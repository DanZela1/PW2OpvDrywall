import models from '../models';
import crearCrud from '../utils/crudFactory';

const { Contacto } = models;

export default crearCrud(Contacto, { nombre: 'Mensaje de contacto' });
