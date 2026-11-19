import { useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import TarjetaDato from '../../componentes/TarjetaDato';
import Mensajes from '../../componentes/Mensajes';

interface Resumen {
  generadoEn: string;
  usuarios: { total: number; porRol: Record<string, number> };
  cotizaciones: { total: number; ultimos30Dias: number; porEstado: Record<string, number> };
  postulaciones: { total: number; porEstado: Record<string, number> };
  contactos: { total: number; sinLeer: number };
  proyectos: { total: number; porEstado: Record<string, number> };
  testimonios: { total: number; porEstado: Record<string, number> };
}
interface PorMes { meses: number; datos: { mes: string; total: number }[] }
interface PorServicio { tipoServicio: string; total: number }

const rejilla: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 };

function Desglose({ datos }: { datos: Record<string, number> }) {
  const filas = Object.entries(datos);
  if (filas.length === 0) return <p>Sin datos.</p>;
  return (
    <ul style={{ listStyle: 'none' }}>
      {filas.map(([clave, valor]) => (
        <li key={clave}>{clave}: <strong>{valor}</strong></li>
      ))}
    </ul>
  );
}

export default function Panel() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [porMes, setPorMes] = useState<PorMes | null>(null);
  const [porServicio, setPorServicio] = useState<PorServicio[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Resumen>('/reportes/resumen'),
      api.get<PorMes>('/reportes/cotizaciones-por-mes', { params: { meses: 6 } }),
      api.get<PorServicio[]>('/reportes/cotizaciones-por-servicio'),
    ])
      .then(([r, m, s]) => {
        setResumen(r.data);
        setPorMes(m.data);
        setPorServicio(s.data);
      })
      .catch((e) => setError(mensajeError(e, 'No se pudo cargar el panel.')));
  }, []);

  return (
    <PaginaAdmin titulo="Panel de administración">
      <Mensajes error={error} />
      {!error && !resumen && <p>Cargando…</p>}

      {resumen && (
        <>
          <div style={rejilla}>
            <TarjetaDato titulo="Cotizaciones">
              <p><strong>{resumen.cotizaciones.total}</strong> en total, {resumen.cotizaciones.ultimos30Dias} en los últimos 30 días</p>
              <Desglose datos={resumen.cotizaciones.porEstado} />
            </TarjetaDato>
            <TarjetaDato titulo="Proyectos">
              <p><strong>{resumen.proyectos.total}</strong> en total</p>
              <Desglose datos={resumen.proyectos.porEstado} />
            </TarjetaDato>
            <TarjetaDato titulo="Postulaciones">
              <p><strong>{resumen.postulaciones.total}</strong> en total</p>
              <Desglose datos={resumen.postulaciones.porEstado} />
            </TarjetaDato>
            <TarjetaDato titulo="Contactos">
              <p><strong>{resumen.contactos.sinLeer}</strong> sin leer de {resumen.contactos.total}</p>
            </TarjetaDato>
            <TarjetaDato titulo="Testimonios">
              <p><strong>{resumen.testimonios.total}</strong> en total</p>
              <Desglose datos={resumen.testimonios.porEstado} />
            </TarjetaDato>
            <TarjetaDato titulo="Usuarios">
              <p><strong>{resumen.usuarios.total}</strong> en total</p>
              <Desglose datos={resumen.usuarios.porRol} />
            </TarjetaDato>
          </div>

          <div style={{ ...rejilla, marginTop: 30 }}>
            <TarjetaDato titulo="Cotizaciones por mes">
              {porMes && (
                <ul style={{ listStyle: 'none' }}>
                  {porMes.datos.map((d) => (
                    <li key={d.mes}>{d.mes}: <strong>{d.total}</strong></li>
                  ))}
                </ul>
              )}
            </TarjetaDato>
            <TarjetaDato titulo="Servicios más pedidos">
              {porServicio.length === 0 ? (
                <p>Sin datos.</p>
              ) : (
                <ul style={{ listStyle: 'none' }}>
                  {porServicio.map((s) => (
                    <li key={s.tipoServicio}>{s.tipoServicio}: <strong>{s.total}</strong></li>
                  ))}
                </ul>
              )}
            </TarjetaDato>
          </div>
          <p style={{ marginTop: 20, fontSize: '0.85rem' }}>Datos generados: {new Date(resumen.generadoEn).toLocaleString()}</p>
        </>
      )}
    </PaginaAdmin>
  );
}