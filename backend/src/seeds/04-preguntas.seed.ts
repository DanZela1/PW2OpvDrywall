import type { Modelos } from '../models';

// Respuestas redactadas para la base de datos; ajústalas desde el panel (PUT /preguntas-frecuentes/:id)
// para que coincidan palabra por palabra con el texto del sitio.
const PREGUNTAS: Array<[string, string]> = [
  ['¿Por qué construir con yeso?', 'Permite acabados lisos, divisiones interiores rápidas, menos escombros y una obra más limpia. Además es económico y fácil de reparar.'],
  ['¿El yeso es resistente y duradero?', 'Sí. Bien instalado, el yeso moderno es resistente, no se deforma y dura décadas con muy poco mantenimiento.'],
  ['¿Qué tipo de proyectos realizan?', 'Construcción y remodelación de viviendas y locales comerciales, oficinas, divisiones interiores, cielos falsos y acabados en yeso.'],
  ['¿Cuánto tiempo toma un proyecto con yeso?', 'Suele ser mucho más rápido que la construcción tradicional. Una remodelación interior toma generalmente entre 2 y 7 días, según el tamaño.'],
  ['¿Ofrecen garantía del trabajo?', 'Sí. Todos los proyectos tienen garantía en materiales y mano de obra.'],
  ['¿El yeso se puede pintar o decorar?', 'Sí. Una vez que está completamente seco se puede pintar, texturizar o decorar.'],
];

// Carga las 6 preguntas del sitio; se puede ejecutar varias veces sin duplicar (findOrCreate)
export default async ({ PreguntaFrecuente }: Modelos): Promise<string> => {
  let orden = 1;
  for (const [pregunta, respuesta] of PREGUNTAS) {
    await PreguntaFrecuente.findOrCreate({ where: { pregunta }, defaults: { respuesta, orden: orden++ } });
  }
  return `Preguntas frecuentes cargadas: ${PREGUNTAS.length}`;
};
