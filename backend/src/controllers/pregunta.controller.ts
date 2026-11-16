import models from '../models';
import crearCrud from '../utils/crudFactory';

const { PreguntaFrecuente } = models;

export default crearCrud(PreguntaFrecuente, {
  nombre: 'Pregunta frecuente',
  camposBusqueda: ['pregunta', 'respuesta'],
  orden: [['orden', 'ASC'], ['id', 'ASC']],
  // Los visitantes solo ven las preguntas activas; el admin ve todas
  filtroBase: (req) => (req.user?.rol === 'admin' ? {} : { activo: true }),
});
