// Testimonios de testimonios.html. Si más adelante vienen de la API, solo cambia esta lista
const TESTIMONIOS = [
  {
    foto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    nombre: 'María López',
    rol: 'Propietaria de vivienda',
    texto:
      'La constructora hizo un trabajo impecable en el recubrimiento de paredes con yeso. El acabado quedó totalmente liso y profesional. Además, trabajaron rápido y sin dejar desorden. Estoy más que satisfecha.',
  },
  {
    foto: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    nombre: 'Carlos Rivera',
    rol: 'Dueño de local comercial',
    texto:
      'Necesitaba remodelar mi tienda y trabajaron mis tabiques de yeso exactamente como los quería. El yeso permitió modificar espacios sin mucho escombro y el resultado fue excelente. ¡Los recomiendo totalmente!',
  },
  {
    foto: 'https://images.pexels.com/photos/2744193/pexels-photo-2744193.jpeg',
    nombre: 'Ana Torres',
    rol: 'Arquitecta independiente',
    texto:
      'He contratado varias constructoras, pero esta destaca por la calidad del yeso y la precisión en la instalación. Cumplen tiempos, escuchan al cliente y manejan el material con mucha técnica. Mis clientes siempre quedan felices.',
  },
  {
    foto: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    nombre: 'Jorge Méndez',
    rol: 'Proyecto de ampliación en casa',
    texto:
      'Quedé sorprendido con la rapidez. Levantaron nuevas divisiones internas en yeso en pocos días. El acabado quedó tan fino que casi no tuve que pintar de más. Muy profesionales de principio a fin.',
  },
];

// Las clases (contenedor, tarjeta, info) son las de _cards.less
export default function Opiniones() {
  return (
    <>
      <h1 style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Roboto, sans-serif' }}>
        Testimonios de Nuestros Clientes
      </h1>

      <section className="contenedor">
        {TESTIMONIOS.map((t) => (
          <div key={t.nombre} className="tarjeta">
            <img src={t.foto} alt={`Foto de ${t.nombre}`} />
            <div className="info">
              <h3>{t.nombre} - {t.rol}</h3>
              <p>&ldquo;{t.texto}&rdquo;</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}