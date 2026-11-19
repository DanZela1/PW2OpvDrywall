import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/cliente';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

// Pantalla /#/admin/cotizaciones. Endpoints: GET /cotizaciones y PATCH /cotizaciones/:id/estado.
type Estado = 'pendiente' | 'en_revision' | 'enviada' | 'aceptada' | 'rechazada';
const ESTADOS: Estado[] = ['pendiente', 'en_revision', 'enviada', 'aceptada', 'rechazada'];
// Mismo flujo que TRANSICIONES del backend (models/Cotizacion.ts): desde cada estado, a cuáles se puede pasar
const TRANSICIONES: Record<Estado, Estado[]> = {
  pendiente: ['en_revision', 'enviada', 'rechazada'],
  en_revision: ['enviada', 'rechazada'],
  enviada: ['aceptada', 'rechazada'],
  aceptada: [],
  rechazada: ['pendiente'],
};

interface Cotizacion {
  id: number;
  nombre: string;
  correo: string;
  tipoServicio: string;
  estado: Estado;
  total: number | null;
  createdAt: string;
  proyecto: { id: number; codigo: string; estado: string } | null;
}
interface RespuestaLista<T> { total: number; pagina: number; limite: number; datos: T[] }

const LIMITE = 10;

export default function Cotizaciones() {
  const [lista, setLista] = useState<RespuestaLista<Cotizacion> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api
      .get<RespuestaLista<Cotizacion>>('/cotizaciones', {
        params: { pagina, limite: LIMITE, ...(estado && { estado }), ...(q && { q }) },
      })
      .then((r) => { setLista(r.data); setError(null); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar las cotizaciones.')));
  }, [pagina, estado, q]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (c: Cotizacion, nuevo: Estado) => {
    setAviso(null);
    try {
      await api.patch(`/cotizaciones/${c.id}/estado`, { estado: nuevo });
      setAviso(`Cotización #${c.id}: ${c.estado} → ${nuevo}`);
      cargar();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cambiar el estado.'));
    }
  };

  return (
    <PaginaAdmin titulo="Cotizaciones">
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          placeholder="Buscar por nombre, correo, servicio o ubicación"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPagina(1); setQ(busqueda.trim()); } }}
          style={{ flex: '1 1 280px', padding: 8 }}
        />
        <button onClick={() => { setPagina(1); setQ(busqueda.trim()); }}>Buscar</button>
        <select value={estado} onChange={(e) => { setPagina(1); setEstado(e.target.value); }} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Link to="/admin/cotizaciones/nueva">+ Nueva cotización</Link>
      </div>

      <Mensajes error={error} aviso={aviso} />
      {!lista && !error && <p>Cargando…</p>}

      {lista && (
        <>
          <Tabla
            columnas={['#', 'Cliente', 'Servicio', 'Estado', 'Total', 'Proyecto', 'Fecha', 'Cambiar estado']}
            vacio="No hay cotizaciones."
            filas={lista.datos.map((c) => ({
              clave: c.id,
              celdas: [
                <Link to={`/admin/cotizaciones/${c.id}`}>{c.id}</Link>,
                <>{c.nombre}<br /><small>{c.correo}</small></>,
                c.tipoServicio,
                c.estado,
                c.total === null ? '—' : c.total.toFixed(2),
                c.proyecto ? c.proyecto.codigo : '—',
                new Date(c.createdAt).toLocaleDateString(),
                TRANSICIONES[c.estado].length === 0 ? (
                  <small>Estado final</small>
                ) : (
                  <select
                    value=""
                    aria-label={`Cambiar estado de la cotización ${c.id}`}
                    onChange={(e) => e.target.value && cambiarEstado(c, e.target.value as Estado)}
                  >
                    <option value="">Pasar a…</option>
                    {TRANSICIONES[c.estado].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ),
              ],
            }))}
          />
          <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="cotizaciones" onCambiar={setPagina} />
        </>
      )}
    </PaginaAdmin>
  );
}