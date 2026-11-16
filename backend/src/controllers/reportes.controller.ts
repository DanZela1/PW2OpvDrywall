import { fn, col, Op, QueryTypes } from 'sequelize';
import { matchedData } from 'express-validator';
import models from '../models';
import h from '../utils/asyncHandler';

const { sequelize, Usuario, Cotizacion, Postulacion, Contacto, Proyecto, Testimonio } = models;

// Cuenta filas agrupadas por una columna y devuelve { valor: cantidad }
async function contarPor(Modelo: any, columna: string): Promise<Record<string, number>> {
  const filas = (await Modelo.findAll({
    attributes: [columna, [fn('COUNT', col('id')), 'total']],
    group: [columna],
    raw: true,
  })) as unknown as Array<Record<string, string | number>>;
  return Object.fromEntries(filas.map((f) => [String(f[columna]), Number(f.total)]));
}

// GET /reportes/resumen: los números del dashboard del administrador
export const resumen = h(async (_req, res) => {
  const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    usuarios,
    cotizaciones,
    cotizacionesPorEstado,
    cotizacionesUltimos30,
    postulacionesPorEstado,
    contactosTotal,
    contactosSinLeer,
    proyectosPorEstado,
    testimoniosPorEstado,
  ] = await Promise.all([
    contarPor(Usuario, 'rol'),
    Cotizacion.count(),
    contarPor(Cotizacion, 'estado'),
    Cotizacion.count({ where: { createdAt: { [Op.gte]: hace30Dias } } }),
    contarPor(Postulacion, 'estado'),
    Contacto.count(),
    Contacto.count({ where: { leido: false } }),
    contarPor(Proyecto, 'estado'),
    contarPor(Testimonio, 'estado'),
  ]);

  const suma = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

  res.json({
    generadoEn: new Date().toISOString(),
    usuarios: { total: suma(usuarios), porRol: usuarios },
    cotizaciones: { total: cotizaciones, ultimos30Dias: cotizacionesUltimos30, porEstado: cotizacionesPorEstado },
    postulaciones: { total: suma(postulacionesPorEstado), porEstado: postulacionesPorEstado },
    contactos: { total: contactosTotal, sinLeer: contactosSinLeer },
    proyectos: { total: suma(proyectosPorEstado), porEstado: proyectosPorEstado },
    testimonios: { total: suma(testimoniosPorEstado), porEstado: testimoniosPorEstado },
  });
});

// GET /reportes/cotizaciones-por-mes?meses=6: cotizaciones por mes (los meses sin datos salen con 0)
export const cotizacionesPorMes = h(async (req, res) => {
  const { meses = 6 } = matchedData(req, { locations: ['query'] });

  const ahora = new Date();
  const inicio = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - (meses - 1), 1));

  const filas = await sequelize.query<{ mes: string; total: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS total
       FROM cotizaciones
      WHERE created_at >= :inicio
      GROUP BY mes
      ORDER BY mes`,
    { replacements: { inicio }, type: QueryTypes.SELECT },
  );
  const porMes = new Map(filas.map((f) => [f.mes, Number(f.total)]));

  const datos = Array.from({ length: meses }, (_, i) => {
    const d = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + i, 1));
    const mes = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    return { mes, total: porMes.get(mes) ?? 0 };
  });
  res.json({ meses, datos });
});

// GET /reportes/cotizaciones-por-servicio: qué servicios se piden más
export const cotizacionesPorServicio = h(async (_req, res) => {
  const filas = (await Cotizacion.findAll({
    attributes: ['tipoServicio', [fn('COUNT', col('id')), 'total']],
    group: ['tipoServicio'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    raw: true,
  })) as unknown as Array<{ tipoServicio: string; total: string | number }>;
  res.json(filas.map((f) => ({ tipoServicio: f.tipoServicio, total: Number(f.total) })));
});
