import { matchedData } from 'express-validator';
import models from '../models';
import { TRANSICIONES, EstadoCotizacion } from '../models/Cotizacion';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';
import { buscarOCrearCliente } from '../utils/clientes';
import { guardarDetalle } from '../utils/cotizaciones';
import { notificarCambioEstado, notificarNuevaCotizacion } from '../utils/notificaciones';

const { Cotizacion, CotizacionHistorial, CotizacionDetalle, Cliente, Proyecto, Usuario, sequelize } = models;

const crud = crearCrud(Cotizacion, {
  nombre: 'Cotización',
  camposBusqueda: ['nombre', 'correo', 'tipoServicio', 'ubicacion'],
  // Muestra el proyecto asociado (si ya existe) junto a cada cotización
  include: [
    { model: Proyecto, as: 'proyecto', attributes: ['id', 'codigo', 'estado'] },
    { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'correo'] },
  ],
});

// Una cotización con todo: cliente, proyecto y líneas de detalle
const completa = (id: number | string) =>
  Cotizacion.findByPk(id, {
    include: [
      { model: Proyecto, as: 'proyecto', attributes: ['id', 'codigo', 'estado'] },
      { model: Cliente, as: 'cliente' },
      { model: CotizacionDetalle, as: 'detalle' },
    ],
    order: [[{ model: CotizacionDetalle, as: 'detalle' }, 'id', 'ASC']],
  });

// GET /:id: incluye el detalle
const obtener = h(async (req, res) => {
  const cotizacion = await completa(req.params.id);
  if (!cotizacion) throw new ApiError(404, `No se encontró cotización con id ${req.params.id}`);
  res.json(cotizacion);
});

// POST /: crea la cotización y su primera fila de historial en UNA transacción
// (o se guardan las dos cosas, o ninguna), y luego envía los correos sin hacer esperar la respuesta
const crear = h(async (req, res) => {
  const datos = matchedData(req, { locations: ['body'] });
  // Si quien envía tiene sesión, la cotización queda a su nombre; si es visitante, queda sin usuario
  const usuarioId = req.user?.id ?? null;

  const creada = await sequelize.transaction(async (t) => {
    // El cliente se busca por correo (o se crea) en la misma transacción
    const { cliente } = await buscarOCrearCliente(
      { nombre: datos.nombre, correo: datos.correo, telefono: datos.telefono },
      t,
    );
    const cotizacion = await Cotizacion.create({ ...datos, usuarioId, clienteId: cliente.id }, { transaction: t });
    await CotizacionHistorial.create(
      {
        cotizacionId: cotizacion.id,
        estadoAnterior: null,
        estadoNuevo: 'pendiente',
        comentario: 'Solicitud recibida',
        usuarioId,
      },
      { transaction: t },
    );
    return cotizacion;
  });

  // Sin await: el correo se manda en segundo plano y sus errores solo se registran en consola
  void notificarNuevaCotizacion(creada).catch((error) =>
    console.error('[correo] Error en la notificación de cotización:', error),
  );

  res.status(201).json(await crud.buscar(creada.id));
});

// PATCH /:id/estado: cambio de estado con transacción
//  1. bloquea la fila de la cotización (FOR UPDATE) para que dos admins no la cambien a la vez
//  2. valida que el cambio esté permitido en el flujo (TRANSICIONES)
//  3. actualiza el estado y escribe el historial
// Si cualquier paso falla se hace ROLLBACK y no queda nada a medias.
const cambiarEstado = h(async (req, res) => {
  const { estado, comentario } = matchedData(req, { locations: ['body'] });

  const { cotizacion, estadoAnterior } = await sequelize.transaction(async (t) => {
    const actual = await Cotizacion.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!actual) throw new ApiError(404, 'No se encontró la cotización indicada');

    const anterior = actual.estado as EstadoCotizacion;
    if (anterior === estado) throw new ApiError(409, `La cotización ya está en estado "${estado}"`);

    const permitidos = TRANSICIONES[anterior];
    if (!permitidos.includes(estado)) {
      throw new ApiError(
        409,
        `No se puede pasar de "${anterior}" a "${estado}". ` +
          (permitidos.length ? `Desde "${anterior}" solo se permite: ${permitidos.join(', ')}` : `"${anterior}" es un estado final`),
      );
    }

    await actual.update({ estado }, { transaction: t });
    await CotizacionHistorial.create(
      {
        cotizacionId: actual.id,
        estadoAnterior: anterior,
        estadoNuevo: estado,
        comentario: comentario || null,
        usuarioId: req.user!.id,
      },
      { transaction: t },
    );
    return { cotizacion: actual, estadoAnterior: anterior };
  });

  // Ya con COMMIT hecho: se avisa al cliente en segundo plano
  notificarCambioEstado(cotizacion, estado, comentario);

  res.json({ id: cotizacion.id, estadoAnterior, estado: cotizacion.estado, comentario: comentario || null });
});

// GET /:id/historial: línea de tiempo de la cotización (solo admin)
const historial = h(async (req, res) => {
  await crud.buscar(req.params.id); // 404 si la cotización no existe
  res.json(
    await CotizacionHistorial.findAll({
      where: { cotizacionId: req.params.id },
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre'] }],
      order: [['id', 'ASC']],
    }),
  );
});

// GET /mias: las cotizaciones del cliente que inició sesión
const listarMias = h(async (req, res) => {
  res.json(await Cotizacion.findAll({ where: { usuarioId: req.user!.id }, order: [['id', 'DESC']] }));
});

// POST /con-detalle (admin): TRANSACCIÓN de varios modelos
//  Cliente (buscar o crear) -> Cotizacion -> CotizacionDetalle (N líneas) -> montos -> Historial
// Si cualquier ítem es inválido (servicio/material inexistente, sin precio...) se hace ROLLBACK de todo,
// incluido el cliente nuevo: no queda ninguna cotización a medias.
const crearConDetalle = h(async (req, res) => {
  const { cliente: datosCliente, items, aplicarImpuesto = true, ...datos } = matchedData(req, { locations: ['body'] });

  const creada = await sequelize.transaction(async (t) => {
    const { cliente } = await buscarOCrearCliente(datosCliente, t);
    const cotizacion = await Cotizacion.create(
      { ...datos, nombre: cliente.nombre, correo: cliente.correo, telefono: cliente.telefono, clienteId: cliente.id, usuarioId: req.user!.id },
      { transaction: t },
    );
    const totales = await guardarDetalle(cotizacion.id, items, aplicarImpuesto, t);
    await CotizacionHistorial.create(
      {
        cotizacionId: cotizacion.id,
        estadoAnterior: null,
        estadoNuevo: 'pendiente',
        comentario: `Cotización creada por el equipo (total ${totales.total})`,
        usuarioId: req.user!.id,
      },
      { transaction: t },
    );
    return cotizacion;
  });

  void notificarNuevaCotizacion(creada).catch((error) =>
    console.error('[correo] Error en la notificación de cotización:', error),
  );
  res.status(201).json(await completa(creada.id));
});

export default Object.assign(crud, { obtener, crearConDetalle, crear, cambiarEstado, historial, listarMias });
