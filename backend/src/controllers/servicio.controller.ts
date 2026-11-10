import models from '../models';
import crearCrud from '../utils/crudFactory';
import { rutaPublicaImagen, borrarImagen } from '../middlewares/subida';

const { Servicio } = models;

export default crearCrud(Servicio, {
  nombre: 'Servicio',
  // Guarda qué administrador creó el servicio y, si se envió, la ruta de su imagen
  antesDeCrear: async (req, datos) => ({
    ...datos,
    usuarioId: req.user!.id,
    ...(req.file && { imagen: rutaPublicaImagen(req.file) }),
  }),
  // Si llega una imagen nueva, reemplaza (y borra) la anterior
  antesDeActualizar: async (req, datos, registro) => {
    if (!req.file) return datos;
    borrarImagen((registro as any).imagen);
    return { ...datos, imagen: rutaPublicaImagen(req.file) };
  },
  // Al eliminar el servicio, también se elimina su imagen del disco
  antesDeEliminar: (_req, registro) => borrarImagen(registro.imagen),
});
