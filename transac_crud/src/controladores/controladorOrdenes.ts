import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Transaction, UniqueConstraintError } from 'sequelize';
import db from '../configuracion/db.js';
// Se importan desde el index de modelos para que también se carguen las asociaciones
import { Orden, DetalleOrden } from '../modelos/index.js';
import {
  ConsultaId,
  CuerpoActualizarOrden,
  CuerpoCrearOrden,
  DetalleEntrada,
} from '../tipos/ordenes.js';

/*
 * ================================================================
 *  CRUD TRANSACCIONAL DE ÓRDENES DE COMPRA
 * ================================================================
 *
 * ¿QUÉ ES UNA TRANSACCIÓN?
 * Una transacción agrupa varias operaciones de base de datos en una
 * sola "unidad de trabajo" que cumple con las propiedades ACID:
 *
 *  - Atomicidad: o se ejecutan TODAS las operaciones, o NO se ejecuta NINGUNA.
 *  - Consistencia: la base de datos pasa de un estado válido a otro estado válido.
 *  - Aislamiento (Isolation): las operaciones de la transacción no se mezclan con otras.
 *  - Durabilidad: una vez confirmada (COMMIT), los cambios quedan guardados.
 *
 * ¿POR QUÉ ES ÚTIL AQUÍ?
 * Una orden se guarda en DOS tablas (ordenes y detalles_orden).
 * Sin transacción podría quedar una orden sin detalles (datos "huérfanos")
 * si algo fallara a mitad de camino. Con transacción eso es imposible:
 * o se guarda la orden COMPLETA (con todos sus detalles), o no se guarda nada.
 *
 * SEQUELIZE OFRECE DOS FORMAS DE MANEJAR TRANSACCIONES:
 *
 * 1) TRANSACCIÓN MANEJADA (la que usa este controlador):
 *
 *      await db.transaction(async (t) => {
 *        // toda operación recibe { transaction: t }
 *        await Orden.create({...}, { transaction: t });
 *        await DetalleOrden.create({...}, { transaction: t });
 *      });
 *
 *    - Si el callback termina SIN errores -> Sequelize hace COMMIT automáticamente.
 *    - Si el callback LANZA un error    -> Sequelize hace ROLLBACK automáticamente.
 *
 * 2) TRANSACCIÓN NO MANEJADA (control manual del COMMIT / ROLLBACK):
 *
 *      const t = await db.transaction(); // se inicia la transacción
 *      try {
 *        await Orden.create({...}, { transaction: t });
 *        await DetalleOrden.create({...}, { transaction: t });
 *        await t.commit();   // se confirman los cambios
 *      } catch (error) {
 *        await t.rollback(); // se revierten TODOS los cambios
 *      }
 *
 * En este controlador se usa la forma MANEJADA porque es más segura
 * (no hay riesgo de olvidar el rollback) y el código es más limpio.
 * ================================================================
 */

// Tipos de las peticiones: body y query params tipados, sin usar "any"
type PeticionConId = Request<Record<string, string>, unknown, unknown, ConsultaId>;
type PeticionCrear = Request<Record<string, string>, unknown, CuerpoCrearOrden, ConsultaId>;
type PeticionActualizar = Request<
  Record<string, string>,
  unknown,
  CuerpoActualizarOrden,
  ConsultaId
>;

// Evita errores de decimales de JavaScript (0.1 + 0.2) redondeando a 2 decimales
const redondear = (valor: number): number => Math.round((valor + Number.EPSILON) * 100) / 100;

/*
 * Inserta los detalles de una orden DENTRO de la transacción recibida ("t")
 * y devuelve el total (suma de los subtotales).
 */
const insertarDetalles = async (
  ordenId: number,
  detalles: DetalleEntrada[],
  t: Transaction
): Promise<number> => {
  let total = 0;
  for (const detalle of detalles) {
    const cantidad = Number(detalle.cantidad);
    const precioUnitario = Number(detalle.precioUnitario);
    const subtotal = redondear(cantidad * precioUnitario); // subtotal = cantidad x precio
    total += subtotal;

    await DetalleOrden.create(
      {
        ordenId, // Llave foránea hacia la orden
        producto: detalle.producto,
        cantidad,
        precioUnitario,
        subtotal,
      },
      { transaction: t } // <- sin este parámetro la inserción quedaría FUERA de la transacción
    );
  }
  return redondear(total);
};

// Controlador para listar todas las órdenes junto con sus detalles
// (Las consultas de lectura no necesitan transacción porque son una sola
//  operación: un SELECT con JOIN no puede quedar "a medias").
export const listarOrdenes = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const ordenes = await Orden.findAll({
      include: [{ model: DetalleOrden, as: 'detalles' }], // Incluir los detalles de cada orden
      order: [['id', 'ASC']],
    });
    return res.status(200).json(ordenes);
  } catch (error) {
    console.error('Error al listar las órdenes:', error);
    return res.status(500).json({ error: 'Error al listar las órdenes' });
  }
};

// Controlador para obtener una orden por su ID (con sus detalles)
export const obtenerOrdenPorId = async (req: PeticionConId, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const orden = await Orden.findByPk(Number(req.query.id), {
      include: [{ model: DetalleOrden, as: 'detalles' }],
    });
    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    return res.status(200).json(orden);
  } catch (error) {
    console.error('Error al obtener la orden por ID:', error);
    return res.status(500).json({ error: 'Error al obtener la orden por ID' });
  }
};

/*
 * Controlador para CREAR una orden de forma TRANSACCIONAL.
 * En una sola transacción:
 *   1) Se inserta la cabecera en la tabla "ordenes".
 *   2) Se inserta cada detalle en la tabla "detalles_orden".
 *   3) Se recalcula y guarda el total de la orden.
 * Si CUALQUIER paso falla, se hace ROLLBACK y la base de datos
 * queda exactamente como estaba antes de la petición.
 */
export const crearOrden = async (req: PeticionCrear, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { numeroOrden, clienteNombre, observaciones = null, detalles, simularError = false } =
    req.body;

  try {
    // ---------- INICIO DE LA TRANSACCIÓN (manejada por Sequelize) ----------
    const ordenId = await db.transaction(async (t) => {
      // 1) Se crea la cabecera de la orden DENTRO de la transacción
      const orden = await Orden.create(
        { numeroOrden, clienteNombre, observaciones, total: 0 },
        { transaction: t }
      );

      // 2) Se crean los detalles asociados, dentro de la MISMA transacción
      const total = await insertarDetalles(orden.id, detalles, t);

      // 3) Se actualiza el total de la orden con la suma de los subtotales
      orden.total = total;
      await orden.save({ transaction: t });

      // 4) (Solo con fines didácticos) Simular una falla DESPUÉS de haber insertado
      //    la orden y sus detalles. Al lanzar este error, Sequelize ejecuta ROLLBACK
      //    automáticamente y NADA queda guardado (ni la orden, ni los detalles).
      //    Se activa enviando "simularError": true en el cuerpo de la petición.
      if (simularError) {
        throw new Error('Error simulado: se ejecutó ROLLBACK y la orden NO se guardó.');
      }

      // Si el código llega hasta aquí, Sequelize hace COMMIT al terminar el callback
      return orden.id;
    });
    // ---------- FIN DE LA TRANSACCIÓN (COMMIT automático) ----------

    // Se responde con la orden completa (cabecera + detalles)
    const ordenConDetalles = await Orden.findByPk(ordenId, {
      include: [{ model: DetalleOrden, as: 'detalles' }],
    });
    return res.status(201).json(ordenConDetalles);
  } catch (error) {
    // El número de orden es único: si ya existe, MySQL rechaza el INSERT y la transacción se revierte
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        error: `Ya existe una orden con el número "${numeroOrden}" (transacción revertida: ROLLBACK)`,
      });
    }
    console.error('Error al crear la orden (transacción revertida):', error);
    return res.status(500).json({
      error: 'Error al crear la orden: la transacción fue revertida (ROLLBACK)',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/*
 * Controlador para ACTUALIZAR una orden de forma TRANSACCIONAL.
 * En una sola transacción:
 *   1) Se busca y se BLOQUEA la orden (evita que otra petición la modifique a la vez).
 *   2) Se actualiza la cabecera (cliente / observaciones).
 *   3) Si se envían detalles nuevos, se eliminan los anteriores y se insertan los nuevos.
 *   4) Se recalcula el total.
 * Si algo falla, se hace ROLLBACK y la orden queda EXACTAMENTE
 * como estaba antes (no se pierden los detalles anteriores).
 */
export const actualizarOrden = async (
  req: PeticionActualizar,
  res: Response
): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = Number(req.query.id);
  const { clienteNombre, observaciones, detalles = [], simularError = false } = req.body;

  try {
    // ---------- INICIO DE LA TRANSACCIÓN (manejada por Sequelize) ----------
    const ordenId = await db.transaction(async (t) => {
      // 1) Se busca la orden DENTRO de la transacción con bloqueo de fila (SELECT ... FOR UPDATE)
      const orden = await Orden.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!orden) {
        return null; // No existe: no hay nada que modificar (se responde 404 más abajo)
      }

      // 2) Actualizar la cabecera de la orden
      orden.clienteNombre = clienteNombre ?? orden.clienteNombre;
      orden.observaciones = observaciones ?? orden.observaciones;

      // 3) Si el cuerpo trae detalles, se reemplazan los anteriores por los nuevos
      if (detalles.length > 0) {
        // Se eliminan los detalles anteriores DENTRO de la transacción
        await DetalleOrden.destroy({ where: { ordenId: orden.id }, transaction: t });

        // Se insertan los detalles nuevos DENTRO de la misma transacción
        // 4) Se recalcula el total con los detalles nuevos
        orden.total = await insertarDetalles(orden.id, detalles, t);
      }

      // Se guardan los cambios de la cabecera dentro de la transacción
      await orden.save({ transaction: t });

      // (Solo con fines didácticos) Simular una falla: al lanzar este error
      // Sequelize hace ROLLBACK y la orden vuelve a su estado ANTERIOR
      // (ni los detalles viejos se perdieron, ni los nuevos se guardaron).
      if (simularError) {
        throw new Error('Error simulado: se ejecutó ROLLBACK y la orden volvió a su estado anterior.');
      }

      return orden.id;
    });
    // ---------- FIN DE LA TRANSACCIÓN (COMMIT automático) ----------

    if (ordenId === null) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Se responde con la orden actualizada (cabecera + detalles)
    const ordenConDetalles = await Orden.findByPk(ordenId, {
      include: [{ model: DetalleOrden, as: 'detalles' }],
    });
    return res.status(200).json(ordenConDetalles);
  } catch (error) {
    console.error('Error al actualizar la orden (transacción revertida):', error);
    return res.status(500).json({
      error: 'Error al actualizar la orden: la transacción fue revertida (ROLLBACK)',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/*
 * Controlador para ELIMINAR una orden de forma TRANSACCIONAL.
 * En una sola transacción:
 *   1) Se busca y se bloquea la orden.
 *   2) Se eliminan los detalles (registros hijos).
 *   3) Se elimina la cabecera (registro padre).
 * Si algo falla, se hace ROLLBACK y la orden NO queda a medias
 * (por ejemplo, cabecera eliminada pero detalles huérfanos).
 */
export const eliminarOrden = async (req: PeticionConId, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = Number(req.query.id);

  try {
    // ---------- INICIO DE LA TRANSACCIÓN (manejada por Sequelize) ----------
    const ordenEliminada = await db.transaction(async (t) => {
      // 1) Se busca la orden (con sus detalles) DENTRO de la transacción, bloqueando la fila
      const orden = await Orden.findByPk(id, {
        include: [{ model: DetalleOrden, as: 'detalles' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!orden) {
        return null;
      }

      // 2) Primero se eliminan los detalles (hijos), dentro de la transacción
      await DetalleOrden.destroy({ where: { ordenId: orden.id }, transaction: t });

      // 3) Luego se elimina la cabecera (padre), dentro de la misma transacción
      await orden.destroy({ transaction: t });

      return orden;
    });
    // ---------- FIN DE LA TRANSACCIÓN (COMMIT automático) ----------

    if (ordenEliminada === null) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    return res.status(200).json({
      message: 'Orden y sus detalles eliminados correctamente (transacción confirmada)',
      ordenEliminada,
    });
  } catch (error) {
    console.error('Error al eliminar la orden (transacción revertida):', error);
    return res.status(500).json({
      error: 'Error al eliminar la orden: la transacción fue revertida (ROLLBACK)',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
