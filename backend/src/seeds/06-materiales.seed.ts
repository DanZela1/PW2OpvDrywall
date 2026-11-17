import type { Modelos } from '../models';

// [nombre, unidad, precio de EJEMPLO en lempiras: el equipo debe ajustarlo a su lista real]
const MATERIALES: Array<[string, string, number]> = [
  ['Plancha de yeso 1/2"', 'plancha', 185],
  ['Plancha de yeso resistente a la humedad', 'plancha', 240],
  ['Poste metálico', 'pieza', 62],
  ['Canal metálico', 'pieza', 55],
  ['Tornillo para drywall (caja)', 'caja', 140],
  ['Masilla para juntas', 'cubeta', 480],
  ['Cinta para juntas', 'rollo', 45],
  ['Aislante de fibra de vidrio', 'rollo', 950],
];

// Catálogo inicial de materiales; se puede ejecutar varias veces sin duplicar
export default async ({ Material }: Modelos): Promise<string> => {
  for (const [nombre, unidad, precioUnitario] of MATERIALES) {
    await Material.findOrCreate({ where: { nombre }, defaults: { unidad, precioUnitario } });
  }
  return `Materiales cargados: ${MATERIALES.length} (precios de ejemplo)`;
};
