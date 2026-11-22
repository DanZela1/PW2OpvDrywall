import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { comprobarAdmin } from '../../api/admin';
import { mensajeError } from '../../api/errores';
import type { RespuestaLista } from '../../tipos';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

interface Pregunta { id: number; pregunta: string; respuesta: string; orden: number; activo: boolean }
interface Formulario { pregunta: string; respuesta: string; orden: string; activo: boolean }
const VACIO: Formulario = { pregunta: '', respuesta: '', orden: '0', activo: true };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5 };

export default function Preguntas() {
  const [lista, setLista] = useState<RespuestaLista<Pregunta> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState(''); const [q, setQ] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO); const [editando, setEditando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null); const [aviso, setAviso] = useState<string | null>(null);
  const cargar = useCallback(async () => {
    try { const { data } = await api.get<RespuestaLista<Pregunta>>('/preguntas-frecuentes', { params: { pagina, limite: LIMITE, ordenarPor: 'orden', dir: 'asc', ...(q && { q }) } }); setLista(data); setError(null); }
    catch (e) { setError(mensajeError(e, 'No se pudieron cargar las preguntas.')); }
  }, [pagina, q]);
  useEffect(() => { let activo = true; comprobarAdmin().then(({ error: acceso }) => { if (!activo) return; if (acceso) setError(acceso); else void cargar(); }); return () => { activo = false; }; }, [cargar]);
  const cambiar = (k: keyof Formulario) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((prev) => ({ ...prev, [k]: e.target instanceof HTMLInputElement && e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const limpiar = () => { setForm(VACIO); setEditando(null); };
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setAviso(null);
    const datos = { pregunta: form.pregunta.trim(), respuesta: form.respuesta.trim(), orden: Number(form.orden), activo: form.activo };
    try { if (editando === null) { await api.post('/preguntas-frecuentes', datos); setAviso('Pregunta creada.'); } else { await api.put(`/preguntas-frecuentes/${editando}`, datos); setAviso('Pregunta actualizada.'); } limpiar(); await cargar(); }
    catch (e2) { setError(mensajeError(e2, 'No se pudo guardar la pregunta.')); }
  };
  const editar = (p: Pregunta) => { setEditando(p.id); setForm({ pregunta: p.pregunta, respuesta: p.respuesta, orden: String(p.orden), activo: p.activo }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const eliminar = async (p: Pregunta) => { if (!window.confirm(`¿Eliminar la pregunta “${p.pregunta}”?`)) return; setError(null); setAviso(null); try { await api.delete(`/preguntas-frecuentes/${p.id}`); setAviso('Pregunta eliminada.'); await cargar(); } catch (e) { setError(mensajeError(e, 'No se pudo eliminar la pregunta.')); } };
  return <PaginaAdmin titulo="Preguntas frecuentes">
    <p>Administra las preguntas y respuestas publicadas en el sitio.</p><Mensajes error={error} aviso={aviso} />
    <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, margin: '20px 0 28px' }}>
      <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Agregar pregunta' : `Editando pregunta #${editando}`}</h3>
      <label style={{ ...campo, gridColumn: '1 / -1' }}>Pregunta *<input required maxLength={255} value={form.pregunta} onChange={cambiar('pregunta')} /></label>
      <label style={{ ...campo, gridColumn: '1 / -1' }}>Respuesta *<textarea required maxLength={2000} rows={4} value={form.respuesta} onChange={cambiar('respuesta')} /></label>
      <label style={campo}>Orden de publicación<input type="number" min={0} max={9999} value={form.orden} onChange={cambiar('orden')} /></label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.activo} onChange={cambiar('activo')} /> Publicar pregunta</label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}><button type="submit">{editando === null ? 'Crear pregunta' : 'Guardar cambios'}</button>{editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}</div>
    </form>
    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}><input aria-label="Buscar preguntas" placeholder="Buscar en preguntas y respuestas" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPagina(1); setQ(busqueda.trim()); } }} /><button onClick={() => { setPagina(1); setQ(busqueda.trim()); }}>Buscar</button></div>
    {!lista && !error && <p>Cargando preguntas…</p>}
    {lista && <><Tabla columnas={['Orden', 'Pregunta', 'Respuesta', 'Estado', 'Acciones']} vacio="No hay preguntas frecuentes." filas={lista.datos.map((p) => ({ clave: p.id, celdas: [p.orden, p.pregunta, <details><summary>Ver respuesta</summary><p style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>{p.respuesta}</p></details>, p.activo ? 'Publicada' : 'Oculta', <><button onClick={() => editar(p)}>Editar</button>{' '}<button onClick={() => void eliminar(p)}>Eliminar</button></>] }))} /><Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="preguntas" onCambiar={setPagina} /></>}
  </PaginaAdmin>;
}
