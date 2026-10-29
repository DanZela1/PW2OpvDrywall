import models from '../models';
import crearCrud from '../utils/crudFactory';

const { Servicio } = models;

export default crearCrud(Servicio, {
  nombre: 'Servicio',
  // Guarda qué administrador creó el servicio
  antesDeCrear: async (req, datos) => ({ ...datos, usuarioId: req.user!.id }),
});
