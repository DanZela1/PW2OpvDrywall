import { Link, NavLink } from 'react-router-dom';
import logo from '../../../assets/logo_1.png';

// Equivale a partials/header.hbs del sitio estático. Usa las mismas clases (navbar, container, logo)
// para que el CSS de styles/_header.less se aplique sin cambios.
// Solo se enlazan las pantallas que ya tienen ruta en App.tsx.
const enlaces = [
  { a: '/', texto: 'Inicio' },
  { a: '/servicios', texto: 'Servicios' },
  { a: '/fotos', texto: 'Galería' },
  { a: '/opiniones', texto: 'Testimonios' },
  { a: '/cotizar', texto: 'Cotizar' },
  { a: '/faq', texto: 'Preguntas frecuentes' },
  { a: '/postular', texto: 'Trabaja con nosotros' },
  { a: '/contacto', texto: 'Contacto' },
];

export default function Header() {
  return (
    <header aria-label="Cabecera principal">
      <div className="navbar container">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="OPV Drywall - Instalación y Acabado Profesional" />
          </Link>
        </div>

        <nav aria-label="Menú principal">
          <ul>
            {enlaces.map((e) => (
              <li key={e.a}>
                <NavLink to={e.a} end>{e.texto}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}