import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/cliente';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';

interface Linea {
  id: number;
  tipo: 'servicio' | 'material' | 'manual';
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
interface Cotizacion {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  tipoServicio: string;
  ubicacion: string;
  descripcion: string;
  estado: string;
  subtotal: number | null;
  impuesto: number | null;
  total: number | null;
  createdAt: string;
  cliente: { id: number; nombre: string; correo: string } | null;
  proyecto: { id: number; codigo: string; estado: string } | null;
  detalle: Linea[];
}
interface Evento {
  id: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  autor: { id: number; nombre: string } | null;
}

const dinero = (v: number | null) => (v === null ? '—' : v.toFixed(2));

export default function CotizacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [historial, setHistorial] = useState<Evento[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCotizacion(null);
    setError(null);
    Promise.all([
      api.get<Cotizacion>(`/cotizaciones/${id}`),
      api.get<Evento[]>(`/cotizaciones/${id}/historial`),
    ])
      .then(([c, h]) => { setCotizacion(c.data); setHistorial(h.data); })
      .catch((e) => setError(mensajeError(e, 'No se pudo cargar la cotización.')));
  }, [id]);

  return (
    <PaginaAdmin titulo={`Detalle de cotización #${id}`} ancho={1000}>
      <p><Link to="/admin/cotizaciones">← Volver a cotizaciones</Link></p>
      <Mensajes error={error} />
      {!cotizacion && !error && <p>Cargando…</p>}

      {cotizacion && (
        <>
          <h3>Datos</h3>
          <p><strong>Estado:</strong> {cotizacion.estado}</p>
          <p><strong>Cliente:</strong> {cotizacion.nombre} — {cotizacion.correo} — {cotizacion.telefono}</p>
          <p><strong>Servicio:</strong> {cotizacion.tipoServicio}</p>
          <p><strong>Ubicación:</strong> {cotizacion.ubicacion}</p>
          <p><strong>Descripción:</strong> {cotizacion.descripcion}</p>
          <p><strong>Creada:</strong> {new Date(cotizacion.createdAt).toLocaleString()}</p>
          <p><strong>Proyecto:</strong> {cotizacion.proyecto ? `${cotizacion.proyecto.codigo} (${cotizacion.proyecto.estado})` : 'Sin proyecto'}</p>

          <h3 style={{ marginTop: 25 }}>Líneas de la cotización</h3>
          <Tabla
            columnas={['Tipo', 'Descripción', 'Cantidad', 'Precio unitario', 'Subtotal']}
            vacio="Esta cotización todavía no tiene detalle."
            filas={cotizacion.detalle.map((l) => ({
              clave: l.id,
              celdas: [l.tipo, l.descripcion, l.cantidad, dinero(l.precioUnitario), dinero(l.subtotal)],
            }))}
          />
          <p style={{ marginTop: 10 }}>
            Subtotal: <strong>{dinero(cotizacion.subtotal)}</strong> | Impuesto: <strong>{dinero(cotizacion.impuesto)}</strong> | Total: <strong>{dinero(cotizacion.total)}</strong>
          </p>

          <h3 style={{ marginTop: 25 }}>Historial de estados</h3>
          <ol style={{ paddingLeft: 20 }}>
            {historial.map((h) => (
              <li key={h.id}>
                {new Date(h.createdAt).toLocaleString()}: {h.estadoAnterior ?? 'inicio'} → <strong>{h.estadoNuevo}</strong>
                {h.autor ? ` (por ${h.autor.nombre})` : ''}
                {h.comentario ? ` — ${h.comentario}` : ''}
              </li>
            ))}
          </ol>
        </>
      )}
    </PaginaAdmin>
  );
}