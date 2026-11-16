import models from '../models';
import crearCrud from '../utils/crudFactory';

const { Material } = models;

export default crearCrud(Material, {
  nombre: 'Material',
  camposBusqueda: ['nombre', 'unidad'],
  orden: [['nombre', 'ASC']],
});
