import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { comprobarAdmin } from '../../api/admin';
import { mensajeError } from '../../api/errores';
import type { RespuestaLista } from '../../tipos';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

interface Testimonio {
  id: number; nombre: string; rol: string | null; texto: string; calificacion: number | null;
  foto: string | null; correo?: string | null; estado: 'pendiente' | 'aprobado' | 'rechazado'; createdAt: string;
}
const LIMITE = 10;
const estados = ['pendiente', 'aprobado', 'rechazado'] as const;
const fecha = (valor: string) => new Date(valor).toLocaleDateString('es-HN');

export default function Testimonios() {
  const [lista, setLista] = useState<RespuestaLista<Testimonio> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get<RespuestaLista<Testimonio>>('/testimonios', {
        params: { pagina, limite: LIMITE, ordenarPor: 'createdAt', dir: 'desc', ...(q && { q }), ...(estado && { estado }) },
      });
      setLista(data); setError(null);
    } catch (e) { setError(mensajeError(e, 'No se pudieron cargar los testimonios.')); }
  }, [pagina, q, estado]);

  useEffect(() => {
    let activo = true;
    comprobarAdmin().then(({ error: acceso }) => {
      if (!activo) return;
      if (acceso) setError(acceso); else void cargar();
    });
    return () => { activo = false; };
  }, [cargar]);

  const cambiarEstado = async (t: Testimonio, nuevo: Testimonio['estado']) => {
    setError(null); setAviso(null);
    try { await api.patch(`/testimonios/${t.id}/estado`, { estado: nuevo }); setAviso(`Testimonio de ${t.nombre}: ${nuevo}.`); await cargar(); }
    catch (e) { setError(mensajeError(e, 'No se pudo cambiar el estado.')); }
  };

  const eliminar = async (t: Testimonio) => {
    if (!window.confirm(`¿Eliminar el testimonio de ${t.nombre}? Esta acción no se puede deshacer.`)) return;
    setError(null); setAviso(null);
    try { await api.delete(`/testimonios/${t.id}`); setAviso('Testimonio eliminado.'); await cargar(); }
    catch (e) { setError(mensajeError(e, 'No se pudo eliminar el testimonio.')); }
  };

  return <PaginaAdmin titulo="Testimonios">
    <p>Revisa las opiniones recibidas y decide cuáles se muestran en el sitio público.</p>
    <Mensajes error={error} aviso={aviso} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '18px 0' }}>
      <input aria-label="Buscar testimonios" placeholder="Buscar nombre o texto" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPagina(1); setQ(busqueda.trim()); } }} />
      <button onClick={() => { setPagina(1); setQ(busqueda.trim()); }}>Buscar</button>
      <select aria-label="Filtrar por estado" value={estado} onChange={(e) => { setPagina(1); setEstado(e.target.value); }}>
        <option value="">Todos los estados</option>{estados.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
    {!lista && !error && <p>Cargando testimonios…</p>}
    {lista && <>
      <Tabla columnas={['Fecha', 'Persona', 'Opinión', 'Calificación', 'Estado', 'Acciones']} vacio="No hay testimonios para mostrar." filas={lista.datos.map((t) => ({
        clave: t.id,
        celdas: [fecha(t.createdAt), <>{t.nombre}{t.rol && <small style={{ display: 'block' }}>{t.rol}</small>}{t.correo && <small style={{ display: 'block' }}>{t.correo}</small>}</>, <details><summary>Leer opinión</summary><p style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>{t.texto}</p></details>, t.calificacion ? `${t.calificacion}/5` : '—', t.estado,
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {t.estado !== 'aprobado' && <button onClick={() => void cambiarEstado(t, 'aprobado')}>Aprobar</button>}
            {t.estado !== 'rechazado' && <button onClick={() => void cambiarEstado(t, 'rechazado')}>Rechazar</button>}
            {t.estado !== 'pendiente' && <button onClick={() => void cambiarEstado(t, 'pendiente')}>Pendiente</button>}
            <button onClick={() => void eliminar(t)}>Eliminar</button>
          </div>],
      }))} />
      <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="testimonios" onCambiar={setPagina} />
    </>}
  </PaginaAdmin>;
}
