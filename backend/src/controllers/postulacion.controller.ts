import { matchedData } from 'express-validator';
import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';

const { Postulacion } = models;

const crud = crearCrud(Postulacion, { nombre: 'Postulación' });

// PATCH /:id/estado: nueva, revisada, aceptada o rechazada
const cambiarEstado = h(async (req, res) => {
  const postulacion = await Postulacion.findByPk(req.params.id);
  if (!postulacion) throw new ApiError(404, 'No se encontró la postulación indicada');
  const { estado } = matchedData(req, { locations: ['body'] });
  await postulacion.update({ estado });
  res.json({ id: postulacion.id, estado: postulacion.estado });
});

export default Object.assign(crud, { cambiarEstado });
