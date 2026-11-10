import { matchedData } from 'express-validator';
import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';
import { notificarNuevaCotizacion } from '../utils/notificaciones';

const { Cotizacion, Proyecto } = models;

const crud = crearCrud(Cotizacion, {
  nombre: 'Cotización',
  // Muestra el proyecto asociado (si ya existe) junto a cada cotización
  include: [{ model: Proyecto, as: 'proyecto', attributes: ['id', 'codigo', 'estado'] }],
});

// POST /: crea la cotización y envía los correos sin hacer esperar la respuesta
const crear = h(async (req, res) => {
  const datos = matchedData(req, { locations: ['body'] });
  // Si quien envía tiene sesión, la cotización queda a su nombre; si es visitante, queda sin usuario
  const creada = await Cotizacion.create({ ...datos, usuarioId: req.user?.id ?? null });

  // Sin await: el correo se manda en segundo plano y sus errores solo se registran en consola
  void notificarNuevaCotizacion(creada).catch((error) =>
    console.error('[correo] Error en la notificación de cotización:', error),
  );

  res.status(201).json(await crud.buscar(creada.id));
});

// PATCH /:id/estado: cambia solo el estado de la cotización
const cambiarEstado = h(async (req, res) => {
  const cotizacion = await Cotizacion.findByPk(req.params.id);
  if (!cotizacion) throw new ApiError(404, 'No se encontró la cotización indicada');
  const { estado } = matchedData(req, { locations: ['body'] });
  await cotizacion.update({ estado });
  res.json({ id: cotizacion.id, estado: cotizacion.estado });
});

// GET /mias: las cotizaciones del cliente que inició sesión
const listarMias = h(async (req, res) => {
  res.json(await Cotizacion.findAll({ where: { usuarioId: req.user!.id }, order: [['id', 'DESC']] }));
});

export default Object.assign(crud, { crear, cambiarEstado, listarMias });