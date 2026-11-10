import fs from 'fs';
import path from 'path';
import { matchedData } from 'express-validator';
import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';
import { CARPETA_CV, borrarCV } from '../middlewares/subida';

const { Postulacion } = models;

const crud = crearCrud(Postulacion, {
  nombre: 'Postulación',
  // Guarda el nombre del CV subido (el archivo queda en uploads/cv, que no es público)
  antesDeCrear: (req, datos) => ({ ...datos, ...(req.file && { cv: req.file.filename }) }),
  // Si llega un CV nuevo, reemplaza (y borra) el anterior
  antesDeActualizar: (req, datos, registro) => {
    if (!req.file) return datos;
    borrarCV((registro as any).cv);
    return { ...datos, cv: req.file.filename };
  },
  // Al eliminar la postulación, también se elimina su CV del disco
  antesDeEliminar: (_req, registro) => borrarCV(registro.cv),
});

// GET /:id/cv: descarga el CV (solo administradores)
const descargarCV = h(async (req, res) => {
  const postulacion = await crud.buscar(req.params.id);
  if (!postulacion.cv) throw new ApiError(404, 'Esta postulación no tiene CV adjunto');
  const ruta = path.join(CARPETA_CV, path.basename(postulacion.cv));
  if (!fs.existsSync(ruta)) throw new ApiError(404, 'El archivo del CV ya no existe en el servidor');
  res.download(ruta, `CV-postulacion-${postulacion.id}${path.extname(ruta)}`);
});

// PATCH /:id/estado: nueva, revisada, aceptada o rechazada
const cambiarEstado = h(async (req, res) => {
  const postulacion = await Postulacion.findByPk(req.params.id);
  if (!postulacion) throw new ApiError(404, 'No se encontró la postulación indicada');
  const { estado } = matchedData(req, { locations: ['body'] });
  await postulacion.update({ estado });
  res.json({ id: postulacion.id, estado: postulacion.estado });
});

export default Object.assign(crud, { cambiarEstado, descargarCV });
