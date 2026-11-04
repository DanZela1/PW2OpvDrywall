import { matchedData } from 'express-validator';
import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';

const { Cotizacion, Proyecto } = models;

const crud = crearCrud(Cotizacion, {
  nombre: 'Cotización',
  // Muestra el proyecto asociado (si ya existe) junto a cada cotización
  include: [{ model: Proyecto, as: 'proyecto', attributes: ['id', 'codigo', 'estado'] }],
  // Si quien envía tiene sesión, la cotización queda a su nombre; si es visitante, queda sin usuario
  antesDeCrear: async (req, datos) => ({ ...datos, usuarioId: req.user?.id ?? null }),
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

export default Object.assign(crud, { cambiarEstado, listarMias });
