import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './componentes/Layout';
import PaginaVacia from './componentes/PaginaVacia';
import RutaProtegida from './componentes/RutaProtegida';
import PublicasCotizar from './paginas/publicas/Cotizar';
import PublicasConsultaProyecto from './paginas/publicas/ConsultaProyecto';
import PublicasServicios from './paginas/publicas/Servicios';
import PublicasFotos from './paginas/publicas/Fotos';
import PublicasOpiniones from './paginas/publicas/Opiniones';
import PublicasPreguntasFrecuentes from './paginas/publicas/PreguntasFrecuentes';
import PublicasPostular from './paginas/publicas/Postular';
import PublicasContacto from './paginas/publicas/Contacto';
import CuentaLogin from './paginas/cuenta/Login';
import CuentaRegistro from './paginas/cuenta/Registro';
import CuentaOlvidePassword from './paginas/cuenta/OlvidePassword';
import CuentaRestablecerPassword from './paginas/cuenta/RestablecerPassword';
import CuentaMiCuenta from './paginas/cuenta/MiCuenta';
import CuentaMisCotizaciones from './paginas/cuenta/MisCotizaciones';
import AdminPanel from './paginas/admin/Panel';
import AdminCotizaciones from './paginas/admin/Cotizaciones';
import AdminCotizacionNueva from './paginas/admin/CotizacionNueva';
import AdminCotizacionDetalle from './paginas/admin/CotizacionDetalle';
import AdminClientes from './paginas/admin/Clientes';
import AdminMateriales from './paginas/admin/Materiales';
import AdminServicios from './paginas/admin/Servicios';
import AdminProyectos from './paginas/admin/Proyectos';
import AdminGaleria from './paginas/admin/Galeria';
import AdminCategorias from './paginas/admin/Categorias';
import AdminTestimonios from './paginas/admin/Testimonios';
import AdminPreguntas from './paginas/admin/Preguntas';
import AdminPostulaciones from './paginas/admin/Postulaciones';
import AdminContactos from './paginas/admin/Contactos';
import AdminUsuarios from './paginas/admin/Usuarios';

// HashRouter: las direcciones llevan "#/" (ej. /#/servicios), así funcionan en cualquier hosting sin configurar el servidor.
// Las rutas /#/restablecer y /#/consulta son las que usarán los enlaces de los correos.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PaginaVacia titulo="Inicio" />} />
          <Route path="cotizar" element={<PublicasCotizar />} />
          <Route path="consulta" element={<PublicasConsultaProyecto />} />
          <Route path="servicios" element={<PublicasServicios />} />
          <Route path="fotos" element={<PublicasFotos />} />
          <Route path="opiniones" element={<PublicasOpiniones />} />
          <Route path="faq" element={<PublicasPreguntasFrecuentes />} />
          <Route path="postular" element={<PublicasPostular />} />
          <Route path="contacto" element={<PublicasContacto />} />
          <Route path="login" element={<CuentaLogin />} />
          <Route path="registro" element={<CuentaRegistro />} />
          <Route path="olvide-password" element={<CuentaOlvidePassword />} />
          <Route path="restablecer" element={<CuentaRestablecerPassword />} />
          <Route element={<RutaProtegida rol="cliente" />}>
            <Route path="cuenta" element={<CuentaMiCuenta />} />
            <Route path="cuenta/cotizaciones" element={<CuentaMisCotizaciones />} />
          </Route>
          <Route element={<RutaProtegida rol="admin" />}>
          <Route path="admin" element={<AdminPanel />} />
          <Route path="admin/cotizaciones" element={<AdminCotizaciones />} />
          <Route path="admin/cotizaciones/nueva" element={<AdminCotizacionNueva />} />
          <Route path="admin/cotizaciones/:id" element={<AdminCotizacionDetalle />} />
          <Route path="admin/clientes" element={<AdminClientes />} />
          <Route path="admin/materiales" element={<AdminMateriales />} />
          <Route path="admin/servicios" element={<AdminServicios />} />
          <Route path="admin/proyectos" element={<AdminProyectos />} />
          <Route path="admin/galeria" element={<AdminGaleria />} />
          <Route path="admin/categorias" element={<AdminCategorias />} />
          <Route path="admin/testimonios" element={<AdminTestimonios />} />
          <Route path="admin/preguntas" element={<AdminPreguntas />} />
          <Route path="admin/postulaciones" element={<AdminPostulaciones />} />
          <Route path="admin/contactos" element={<AdminContactos />} />
          <Route path="admin/usuarios" element={<AdminUsuarios />} />
          </Route>
          <Route path="*" element={<PaginaVacia titulo="Página no encontrada" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
