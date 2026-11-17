import type { Modelos } from '../models';

// [nombre, descripción, categoría, precio base de EJEMPLO por m² en lempiras: el equipo debe ajustarlo a sus precios reales]
const SERVICIOS: Array<[string, string, string, number]> = [
  ['Estructura Residencial', 'Estructuras de drywall para viviendas', 'Construcción', 250],
  ['Estructura Comercial', 'Estructuras de drywall para locales y oficinas', 'Construcción', 280],
  ['Aislamiento', 'Aislamiento térmico y acústico', 'Acabados', 120],
  ['Paneles de Yeso', 'Instalación de paneles de yeso', 'Construcción', 180],
  ['Revestimiento de Paredes', 'Revestimiento y acabado de paredes', 'Acabados', 150],
  ['Techado', 'Instalación de cielos y techos', 'Construcción', 220],
];

// Carga los 6 servicios iniciales; se puede ejecutar varias veces sin duplicar (findOrCreate).
// Si un servicio ya existía sin precio base, se le pone el de ejemplo (nunca pisa un precio ya definido).
export default async ({ Usuario, Servicio }: Modelos): Promise<string> => {
  const admin = await Usuario.findOne({ where: { rol: 'admin' }, order: [['id', 'ASC']] });
  for (const [nombre, descripcion, categoria, precioBase] of SERVICIOS) {
    const [servicio] = await Servicio.findOrCreate({
      where: { nombre },
      defaults: { descripcion, categoria, precioBase, usuarioId: admin?.id ?? null },
    });
    if (servicio.precioBase === null) await servicio.update({ precioBase });
  }
  return `Servicios cargados: ${SERVICIOS.length} (precios base de ejemplo)`;
};
