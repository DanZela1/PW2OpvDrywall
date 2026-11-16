import models from '../models';
import crearCrud from '../utils/crudFactory';

const { CategoriaGaleria } = models;

export default crearCrud(CategoriaGaleria, {
  nombre: 'Categoría de galería',
  camposBusqueda: ['nombre', 'descripcion'],
  orden: [['nombre', 'ASC']],
  // Los visitantes solo ven las categorías activas; el admin ve todas
  filtroBase: (req) => (req.user?.rol === 'admin' ? {} : { activa: true }),
});
