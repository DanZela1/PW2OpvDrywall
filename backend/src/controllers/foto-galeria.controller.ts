import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import { rutaPublicaImagen, borrarImagen } from '../middlewares/subida';

const { FotoGaleria, CategoriaGaleria } = models;

// Responde 400 con un mensaje claro si la categoría indicada no existe
const exigirCategoria = async (categoriaId?: number | null) => {
  if (categoriaId && !(await CategoriaGaleria.findByPk(categoriaId))) {
    throw new ApiError(400, `No existe la categoría de galería con id ${categoriaId}`);
  }
};

export default crearCrud(FotoGaleria, {
  nombre: 'Foto de galería',
  camposBusqueda: ['titulo', 'descripcion'],
  include: [{ model: CategoriaGaleria, as: 'categoria', attributes: ['id', 'nombre'] }],
  // Los visitantes solo ven las fotos activas; el admin ve todas
  filtroBase: (req) => (req.user?.rol === 'admin' ? {} : { activa: true }),
  // La imagen es obligatoria al crear: una foto sin archivo no tiene sentido
  antesDeCrear: async (req, datos) => {
    if (!req.file) throw new ApiError(400, 'La imagen es obligatoria (campo "imagen" en multipart/form-data)');
    await exigirCategoria(datos.categoriaId);
    return { ...datos, imagen: rutaPublicaImagen(req.file) };
  },
  // Si llega una imagen nueva, reemplaza (y borra) la anterior
  antesDeActualizar: async (req, datos, registro) => {
    await exigirCategoria(datos.categoriaId);
    if (!req.file) return datos;
    borrarImagen((registro as any).imagen);
    return { ...datos, imagen: rutaPublicaImagen(req.file) };
  },
  // Al eliminar la foto, también se elimina su archivo del disco
  antesDeEliminar: (_req, registro) => borrarImagen(registro.imagen),
});
