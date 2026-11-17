import models from '../models';
import crearCrud from '../utils/crudFactory';

const { Cliente, Cotizacion } = models;

export default crearCrud(Cliente, {
  nombre: 'Cliente',
  camposBusqueda: ['nombre', 'correo', 'telefono'],
  // Al ver un cliente se ven también sus cotizaciones (historial del cliente)
  include: [
    { model: Cotizacion, as: 'cotizaciones', attributes: ['id', 'tipoServicio', 'estado', 'total', 'createdAt'] },
  ],
});
