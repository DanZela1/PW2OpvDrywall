import { Request } from 'express';
import { matchedData } from 'express-validator';
import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';
import { rutaPublicaFoto, borrarFoto } from '../middlewares/subida';
import { notificarNuevoTestimonio } from '../utils/notificaciones';

const { Testimonio } = models;

const esAdmin = (req: Request) => req.user?.rol === 'admin';

const crud = crearCrud(Testimonio, {
  nombre: 'Testimonio',
  camposBusqueda: ['nombre', 'rol', 'texto'],
  // Los visitantes solo ven los aprobados y sin datos privados (correo, estado); el admin lo ve todo
  filtroBase: (req) => (esAdmin(req) ? {} : { estado: 'aprobado' }),
  atributos: (req) => (esAdmin(req) ? undefined : ['id', 'nombre', 'rol', 'texto', 'calificacion', 'foto', 'createdAt']),
  // Si llega una foto nueva, reemplaza (y borra) la anterior
  antesDeActualizar: (req, datos, registro) => {
    if (!req.file) return datos;
    borrarFoto((registro as any).foto);
    return { ...datos, foto: rutaPublicaFoto(req.file) };
  },
  // Al eliminar el testimonio, también se elimina su foto del disco
  antesDeEliminar: (_req, registro) => borrarFoto(registro.foto),
});

// POST / (público): el testimonio SIEMPRE nace "pendiente"; solo un admin lo publica
const crear = h(async (req, res) => {
  const datos = matchedData(req, { locations: ['body'] });
  const creado = await Testimonio.create({
    ...datos,
    estado: 'pendiente',
    ...(req.file && { foto: rutaPublicaFoto(req.file) }),
  });
  notificarNuevoTestimonio(creado); // aviso al admin en segundo plano
  res.status(201).json({
    id: creado.id,
    mensaje: 'Gracias por tu testimonio. Se publicará cuando sea aprobado.',
  });
});

// PATCH /:id/estado: aprobar, rechazar o volver a dejar pendiente
const cambiarEstado = h(async (req, res) => {
  const testimonio = await Testimonio.findByPk(req.params.id);
  if (!testimonio) throw new ApiError(404, 'No se encontró el testimonio indicado');
  const { estado } = matchedData(req, { locations: ['body'] });
  await testimonio.update({ estado });
  res.json({ id: testimonio.id, estado: testimonio.estado });
});

export default Object.assign(crud, { crear, cambiarEstado });
