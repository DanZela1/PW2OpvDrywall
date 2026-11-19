import { Link } from 'react-router-dom';

// Atajos para entrar a las pantallas de cuenta y administración mientras se desarrollan.
// Solo se muestra con npm run dev (import.meta.env.DEV); en el build de producción no aparece.
// Se puede borrar cuando exista el menú definitivo de cuenta y administración.
export default function MenuProvisional() {
  if (!import.meta.env.DEV) return null;
  return (
    <nav aria-label="Atajos de desarrollo" style={{ background: '#fff8d6', padding: '8px 20px', fontSize: '0.85rem' }}>
      <strong>Dev:</strong>{' '}
      <Link to="/login">Login</Link> | <Link to="/registro">Registro</Link> | <Link to="/cuenta">Mi cuenta</Link> |{' '}
      <Link to="/cuenta/cotizaciones">Mis cotizaciones</Link> | <Link to="/consulta">Consultar proyecto</Link> |{' '}
      <Link to="/admin">Panel</Link> | <Link to="/admin/cotizaciones">Cotizaciones</Link> | <Link to="/admin/proyectos">Proyectos</Link> |{' '}
      <Link to="/admin/clientes">Clientes</Link> | <Link to="/admin/servicios">Servicios</Link> | <Link to="/admin/materiales">Materiales</Link> |{' '}
      <Link to="/admin/galeria">Galería</Link> | <Link to="/admin/categorias">Categorías</Link> | <Link to="/admin/testimonios">Testimonios</Link> |{' '}
      <Link to="/admin/preguntas">Preguntas</Link> | <Link to="/admin/postulaciones">Postulaciones</Link> | <Link to="/admin/contactos">Contactos</Link> |{' '}
      <Link to="/admin/usuarios">Usuarios</Link>
    </nav>
  );
}