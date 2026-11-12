import Orden from './modeloOrden.js';
import DetalleOrden from './modeloDetalleOrden.js';

/*
 * ASOCIACIONES (relación 1 a muchos):
 * Una ORDEN tiene muchos DETALLES y cada DETALLE pertenece a una ORDEN.
 * onDelete: 'CASCADE' -> si se borra la orden, la base de datos borra
 * automáticamente sus detalles (red de seguridad, además del borrado
 * explícito que se hace dentro de la transacción).
 */
Orden.hasMany(DetalleOrden, {
  foreignKey: 'ordenId',
  as: 'detalles', // Alias para usar en las consultas con "include"
  onDelete: 'CASCADE',
});
DetalleOrden.belongsTo(Orden, { foreignKey: 'ordenId' });

// Re-exportar los modelos para centralizar su carga en un solo lugar
export { Orden, DetalleOrden };
