import { Link, Outlet } from 'react-router-dom';

// Estructura provisional con enlaces a todas las pantallas (el menú y el diseño final quedan pendientes)
export default function Layout() {
  return (
    <>
      <header>
        <h1><Link to="/">OPV Drywall</Link></h1>
        <nav aria-label="Pantallas públicas">
          <Link to="/cotizar">Cotizar</Link> | <Link to="/consulta">Consultar proyecto</Link> | <Link to="/servicios">Servicios</Link> |{' '}
          <Link to="/fotos">Fotos</Link> | <Link to="/opiniones">Opiniones</Link> | <Link to="/faq">Preguntas frecuentes</Link> |{' '}
          <Link to="/postular">Postular</Link> | <Link to="/contacto">Contacto</Link>
        </nav>
        <nav aria-label="Cuenta">
          <Link to="/login">Iniciar sesión</Link> | <Link to="/registro">Crear cuenta</Link> | <Link to="/olvide-password">Olvidé mi contraseña</Link> |{' '}
          <Link to="/cuenta">Mi cuenta</Link> | <Link to="/cuenta/cotizaciones">Mis cotizaciones</Link>
        </nav>
        <nav aria-label="Administración">
          <Link to="/admin">Panel</Link> | <Link to="/admin/cotizaciones">Cotizaciones</Link> | <Link to="/admin/proyectos">Proyectos</Link> |{' '}
          <Link to="/admin/clientes">Clientes</Link> | <Link to="/admin/servicios">Servicios</Link> | <Link to="/admin/materiales">Materiales</Link> |{' '}
          <Link to="/admin/galeria">Galería</Link> | <Link to="/admin/categorias">Categorías</Link> | <Link to="/admin/testimonios">Testimonios</Link> |{' '}
          <Link to="/admin/preguntas">Preguntas</Link> | <Link to="/admin/postulaciones">Postulaciones</Link> | <Link to="/admin/contactos">Contactos</Link> |{' '}
          <Link to="/admin/usuarios">Usuarios</Link>
        </nav>
        <hr />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
