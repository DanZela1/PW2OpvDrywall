// Preguntas y respuestas de preguntasFrecuentes.html. Si más adelante vienen de la API, solo cambia esta lista
const PREGUNTAS = [
  {
    pregunta: '¿Por qué construir con yeso?',
    respuesta:
      'El yeso permite acabados lisos, divisiones internas rápidas, reducción de escombros y una obra más limpia. Además, es económico y fácil de reparar.',
  },
  {
    pregunta: '¿El yeso es resistente y duradero?',
    respuesta:
      'Sí. El yeso moderno, bien aplicado, es muy resistente, no se deforma y puede durar décadas con mantenimientos mínimos.',
  },
  {
    pregunta: '¿Qué tipo de proyectos realizan?',
    respuesta:
      'Realizamos construcción y remodelación de viviendas, locales comerciales, oficinas, tabiques interiores, cielos falsos y acabados en yeso en general.',
  },
  {
    pregunta: '¿Cuánto tiempo toma un proyecto con yeso?',
    respuesta:
      'Generalmente es mucho más rápido que la construcción tradicional. Una remodelación interior puede tardar entre 2 y 7 días, dependiendo del tamaño.',
  },
  {
    pregunta: '¿Ofrecen garantía del trabajo?',
    respuesta:
      'Sí, todos nuestros proyectos tienen garantía por materiales y mano de obra, asegurando calidad y durabilidad.',
  },
  {
    pregunta: '¿El yeso se puede pintar o decorar?',
    respuesta:
      '¡Claro! Se puede pintar, texturizar o decorar sin problema una vez que el yeso seca completamente.',
  },
];

// El acordeón funciona solo con CSS (_faq.less): cada checkbox oculto abre o cierra su respuesta, sin JavaScript
export default function PreguntasFrecuentes() {
  return (
    <div className="faq-contenedor">
      <div className="faq-wrapper">
        <h1 style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Roboto, sans-serif' }}>Preguntas Frecuentes</h1>

        {PREGUNTAS.map((p, i) => (
          <div key={p.pregunta} className="faq-item">
            <input type="checkbox" id={`faq-${i + 1}`} className="faq-toggle" />
            <label htmlFor={`faq-${i + 1}`} className="faq-question">{p.pregunta}</label>
            <div className="faq-answer">
              <p>{p.respuesta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}