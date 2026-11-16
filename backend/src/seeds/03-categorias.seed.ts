import type { Modelos } from '../models';

const CATEGORIAS: Array<[string, string]> = [
  ['Estructura Residencial', 'Armazón de viviendas: paredes, techos y pisos'],
  ['Estructura Comercial', 'Oficinas, tiendas y locales comerciales'],
  ['Aislamiento', 'Aislamiento térmico y acústico'],
  ['Paneles de Yeso', 'Paredes y techos interiores con paneles de yeso'],
  ['Revestimiento de Paredes', 'Sellado y alisado de uniones para pintura o decoración'],
  ['Techado', 'Instalación y reparación de cubiertas'],
];

// Una categoría por cada servicio; se puede ejecutar varias veces sin duplicar (findOrCreate)
export default async ({ CategoriaGaleria }: Modelos): Promise<string> => {
  for (const [nombre, descripcion] of CATEGORIAS) {
    await CategoriaGaleria.findOrCreate({ where: { nombre }, defaults: { descripcion } });
  }
  return `Categorías de galería cargadas: ${CATEGORIAS.length}`;
};
