import type { Modelos } from '../models';

// Los 4 testimonios que hoy están escritos en la página del sitio (nombre, rol y primera frase).
// Quedan aprobados para que el sitio los pueda mostrar desde la API.
const TESTIMONIOS: Array<[string, string, string]> = [
  ['María López', 'Propietaria de vivienda', 'La constructora hizo un trabajo impecable en el recubrimiento de paredes con yeso.'],
  ['Carlos Rivera', 'Dueño de local comercial', 'Necesitaba remodelar mi tienda y trabajaron mis tabiques de yeso exactamente como los quería.'],
  ['Ana Torres', 'Arquitecta independiente', 'He contratado varias constructoras, pero esta destaca por la calidad del yeso y la precisión en la instalación.'],
  ['Jorge Méndez', 'Proyecto de ampliación en casa', 'Quedé sorprendido con la rapidez. Levantaron nuevas divisiones internas en yeso en pocos días.'],
];

// Se puede ejecutar varias veces sin duplicar (findOrCreate)
export default async ({ Testimonio }: Modelos): Promise<string> => {
  for (const [nombre, rol, texto] of TESTIMONIOS) {
    await Testimonio.findOrCreate({
      where: { nombre, texto },
      defaults: { rol, calificacion: 5, estado: 'aprobado' },
    });
  }
  return `Testimonios cargados: ${TESTIMONIOS.length}`;
};
