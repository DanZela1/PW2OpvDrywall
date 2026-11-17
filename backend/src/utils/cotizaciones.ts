import { Transaction } from 'sequelize';
import models from '../models';
import ApiError from './ApiError';
import { TipoItem } from '../models/CotizacionDetalle';

const { Servicio, Material, CotizacionDetalle, Cotizacion } = models;

// Porcentaje de impuesto (ISV en Honduras: 15 %). Se puede cambiar con IMPUESTO_PORCENTAJE en .env
export const porcentajeImpuesto = (): number => {
  const valor = Number(process.env.IMPUESTO_PORCENTAJE);
  return Number.isFinite(valor) && valor >= 0 ? valor : 15;
};

const redondear = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export interface ItemEntrada {
  tipo: TipoItem;
  servicioId?: number;
  materialId?: number;
  descripcion?: string;
  cantidad: number;
  precioUnitario?: number;
}

/**
 * Convierte los ítems que envía el cliente de la API en filas del detalle:
 *  - servicio / material: toma nombre y precio del catálogo (se puede sobrescribir el precio)
 *  - manual: exige descripción y precio
 * Lanza ApiError 400 si un ítem es inválido; al estar dentro de una transacción, nada queda guardado.
 */
export async function construirDetalle(items: ItemEntrada[], t: Transaction) {
  const filas = [];
  for (const [i, item] of items.entries()) {
    const donde = `Ítem ${i + 1}`;
    let descripcion = item.descripcion?.trim() || '';
    let precio = item.precioUnitario;
    let servicioId: number | null = null;
    let materialId: number | null = null;

    if (item.tipo === 'servicio') {
      const s = await Servicio.findByPk(item.servicioId, { transaction: t });
      if (!s || !s.activo) throw new ApiError(400, `${donde}: el servicio ${item.servicioId} no existe o está inactivo`);
      servicioId = s.id;
      descripcion ||= s.nombre;
      precio ??= s.precioBase ?? undefined;
      if (precio === undefined) throw new ApiError(400, `${donde}: el servicio "${s.nombre}" no tiene precio base, envía precioUnitario`);
    } else if (item.tipo === 'material') {
      const m = await Material.findByPk(item.materialId, { transaction: t });
      if (!m || !m.activo) throw new ApiError(400, `${donde}: el material ${item.materialId} no existe o está inactivo`);
      materialId = m.id;
      descripcion ||= m.nombre;
      precio ??= m.precioUnitario;
    } else {
      if (!descripcion) throw new ApiError(400, `${donde}: un ítem manual necesita descripcion`);
      if (precio === undefined) throw new ApiError(400, `${donde}: un ítem manual necesita precioUnitario`);
    }

    filas.push({
      tipo: item.tipo,
      servicioId,
      materialId,
      descripcion: descripcion.slice(0, 200),
      cantidad: item.cantidad,
      precioUnitario: redondear(precio as number),
      subtotal: redondear(item.cantidad * (precio as number)),
    });
  }
  return filas;
}

export function calcularTotales(subtotales: number[], aplicarImpuesto: boolean) {
  const subtotal = redondear(subtotales.reduce((a, b) => a + b, 0));
  const impuesto = aplicarImpuesto ? redondear((subtotal * porcentajeImpuesto()) / 100) : 0;
  return { subtotal, impuesto, total: redondear(subtotal + impuesto) };
}

/** Reemplaza todo el detalle de una cotización y recalcula sus montos (dentro de la transacción recibida) */
export async function guardarDetalle(cotizacionId: number, items: ItemEntrada[], aplicarImpuesto: boolean, t: Transaction) {
  const filas = await construirDetalle(items, t);
  await CotizacionDetalle.destroy({ where: { cotizacionId }, transaction: t });
  await CotizacionDetalle.bulkCreate(filas.map((f) => ({ ...f, cotizacionId })), { transaction: t });
  const totales = calcularTotales(filas.map((f) => f.subtotal), aplicarImpuesto);
  await Cotizacion.update(totales, { where: { id: cotizacionId }, transaction: t });
  return totales;
}
