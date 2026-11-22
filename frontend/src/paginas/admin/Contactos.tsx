import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { comprobarAdmin } from '../../api/admin';
import { mensajeError } from '../../api/errores';
import type { RespuestaLista } from '../../tipos';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

interface Contacto { id: number; nombre: string; correo: string; mensaje: string; leido: boolean; createdAt: string }
const LIMITE = 10;
const fecha = (valor: string) => new Date(valor).toLocaleString('es-HN');

export default function Contactos() {
  const [lista, setLista] = useState<RespuestaLista<Contacto> | null>(null);
  const [pagina, setPagina] = useState(1); const [busqueda, setBusqueda] = useState(''); const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState(''); const [error, setError] = useState<string | null>(null); const [aviso, setAviso] = useState<string | null>(null);
  const cargar = useCallback(async () => {
    try { const { data } = await api.get<RespuestaLista<Contacto>>('/contacto', { params: { pagina, limite: LIMITE, ordenarPor: 'createdAt', dir: 'desc', ...(q && { q }), ...(filtro && { leido: filtro }) } }); setLista(data); setError(null); }
    catch (e) { setError(mensajeError(e, 'No se pudieron cargar los mensajes.')); }
  }, [pagina, q, filtro]);
  useEffect(() => { let activo = true; comprobarAdmin().then(({ error: acceso }) => { if (!activo) return; if (acceso) setError(acceso); else void cargar(); }); return () => { activo = false; }; }, [cargar]);
  const cambiarLectura = async (c: Contacto) => { setError(null); setAviso(null); try { await api.put(`/contacto/${c.id}`, { leido: !c.leido }); setAviso(c.leido ? 'Mensaje marcado como no leído.' : 'Mensaje marcado como leído.'); await cargar(); } catch (e) { setError(mensajeError(e, 'No se pudo actualizar el mensaje.')); } };
  const eliminar = async (c: Contacto) => { if (!window.confirm(`¿Eliminar el mensaje de ${c.nombre}?`)) return; setError(null); setAviso(null); try { await api.delete(`/contacto/${c.id}`); setAviso('Mensaje eliminado.'); await cargar(); } catch (e) { setError(mensajeError(e, 'No se pudo eliminar el mensaje.')); } };
  return <PaginaAdmin titulo="Mensajes de contacto">
    <p>Consulta las solicitudes recibidas y lleva el control de las que ya atendiste.</p><Mensajes error={error} aviso={aviso} />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '18px 0' }}>
      <input aria-label="Buscar mensajes" placeholder="Buscar nombre, correo o mensaje" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPagina(1); setQ(busqueda.trim()); } }} />
      <button onClick={() => { setPagina(1); setQ(busqueda.trim()); }}>Buscar</button>
      <select aria-label="Filtrar mensajes" value={filtro} onChange={(e) => { setPagina(1); setFiltro(e.target.value); }}><option value="">Todos</option><option value="false">No leídos</option><option value="true">Leídos</option></select>
    </div>
    {!lista && !error && <p>Cargando mensajes…</p>}
    {lista && <><Tabla columnas={['Fecha', 'Contacto', 'Mensaje', 'Estado', 'Acciones']} vacio="No hay mensajes de contacto." filas={lista.datos.map((c) => ({ clave: c.id, celdas: [fecha(c.createdAt), <>{c.nombre}<a style={{ display: 'block' }} href={`mailto:${encodeURIComponent(c.correo)}`}>{c.correo}</a></>, <details><summary>Leer mensaje</summary><p style={{ maxWidth: 400, whiteSpace: 'pre-wrap' }}>{c.mensaje}</p></details>, c.leido ? 'Leído' : 'Pendiente', <><button onClick={() => void cambiarLectura(c)}>{c.leido ? 'Marcar no leído' : 'Marcar leído'}</button>{' '}<button onClick={() => void eliminar(c)}>Eliminar</button></>] }))} /><Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="mensajes" onCambiar={setPagina} /></>}
  </PaginaAdmin>;
}
