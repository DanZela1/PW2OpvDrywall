import type { Modelos } from '../models';

const SERVICIOS: Array<[string, string, string]> = [
  ['Estructura Residencial', 'Estructuras de drywall para viviendas', 'Construcción'],
  ['Estructura Comercial', 'Estructuras de drywall para locales y oficinas', 'Construcción'],
  ['Aislamiento', 'Aislamiento térmico y acústico', 'Acabados'],
  ['Paneles de Yeso', 'Instalación de paneles de yeso', 'Construcción'],
  ['Revestimiento de Paredes', 'Revestimiento y acabado de paredes', 'Acabados'],
  ['Techado', 'Instalación de cielos y techos', 'Construcción'],
];

// Carga los 6 servicios iniciales; se puede ejecutar varias veces sin duplicar (findOrCreate)
export default async ({ Usuario, Servicio }: Modelos): Promise<string> => {
  const admin = await Usuario.findOne({ where: { correo: 'admin@opvdrywall.com' } });
  for (const [nombre, descripcion, categoria] of SERVICIOS) {
    await Servicio.findOrCreate({
      where: { nombre },
      defaults: { descripcion, categoria, usuarioId: admin?.id ?? null },
    });
  }
  return `Servicios cargados: ${SERVICIOS.length}`;
};
