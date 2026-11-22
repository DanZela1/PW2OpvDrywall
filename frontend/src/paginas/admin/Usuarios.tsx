import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { comprobarAdmin, type UsuarioAdminSesion } from '../../api/admin';
import { mensajeError } from '../../api/errores';
import type { RespuestaLista } from '../../tipos';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

interface Usuario { id: number; nombre: string; correo: string; rol: 'admin' | 'cliente'; createdAt: string }
interface Formulario { nombre: string; correo: string; password: string; rol: 'admin' | 'cliente' }
const VACIO: Formulario = { nombre: '', correo: '', password: '', rol: 'cliente' };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5 };
const fecha = (valor: string) => new Date(valor).toLocaleDateString('es-HN');

export default function Usuarios() {
  const [lista, setLista] = useState<RespuestaLista<Usuario> | null>(null); const [yo, setYo] = useState<UsuarioAdminSesion | null>(null);
  const [pagina, setPagina] = useState(1); const [busqueda, setBusqueda] = useState(''); const [q, setQ] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO); const [editando, setEditando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null); const [aviso, setAviso] = useState<string | null>(null);
  const cargar = useCallback(async () => { try { const { data } = await api.get<RespuestaLista<Usuario>>('/usuarios', { params: { pagina, limite: LIMITE, ordenarPor: 'nombre', dir: 'asc', ...(q && { q }) } }); setLista(data); setError(null); } catch (e) { setError(mensajeError(e, 'No se pudieron cargar los usuarios.')); } }, [pagina, q]);
  useEffect(() => { let activo = true; comprobarAdmin().then(({ usuario, error: acceso }) => { if (!activo) return; if (acceso) setError(acceso); else { setYo(usuario); void cargar(); } }); return () => { activo = false; }; }, [cargar]);
  const cambiar = (k: keyof Formulario) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const limpiar = () => { setForm(VACIO); setEditando(null); };
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setAviso(null);
    const datos = { nombre: form.nombre.trim(), correo: form.correo.trim(), rol: form.rol, ...(form.password && { password: form.password }) };
    try { if (editando === null) { await api.post('/usuarios', datos); setAviso('Usuario creado.'); } else { await api.put(`/usuarios/${editando}`, datos); setAviso('Usuario actualizado.'); } limpiar(); await cargar(); }
    catch (e2) { setError(mensajeError(e2, 'No se pudo guardar el usuario.')); }
  };
  const editar = (u: Usuario) => { setEditando(u.id); setForm({ nombre: u.nombre, correo: u.correo, password: '', rol: u.rol }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const eliminar = async (u: Usuario) => { if (u.id === yo?.id) { setError('No puedes eliminar tu propia cuenta.'); return; } if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre}?`)) return; setError(null); setAviso(null); try { await api.delete(`/usuarios/${u.id}`); setAviso('Usuario eliminado.'); await cargar(); } catch (e) { setError(mensajeError(e, 'No se pudo eliminar el usuario.')); } };
  return <PaginaAdmin titulo="Usuarios">
    <p>Administra las cuentas y sus permisos. Las contraseñas se guardan mediante la API y nunca se muestran aquí.</p><Mensajes error={error} aviso={aviso} />
    <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, margin: '20px 0 28px' }}>
      <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Crear cuenta' : `Editando usuario #${editando}`}</h3>
      <label style={campo}>Nombre *<input required maxLength={100} value={form.nombre} onChange={cambiar('nombre')} /></label>
      <label style={campo}>Correo *<input required type="email" maxLength={120} value={form.correo} onChange={cambiar('correo')} /></label>
      <label style={campo}>{editando === null ? 'Contraseña *' : 'Nueva contraseña (opcional)'}<input required={editando === null} type="password" minLength={6} maxLength={72} autoComplete="new-password" value={form.password} onChange={cambiar('password')} placeholder={editando !== null ? 'Déjala vacía para conservarla' : ''} /></label>
      <label style={campo}>Rol<select value={form.rol} onChange={cambiar('rol')}><option value="cliente">Cliente</option><option value="admin">Administrador</option></select></label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}><button type="submit">{editando === null ? 'Crear usuario' : 'Guardar cambios'}</button>{editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}</div>
    </form>
    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}><input aria-label="Buscar usuarios" placeholder="Buscar nombre o correo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPagina(1); setQ(busqueda.trim()); } }} /><button onClick={() => { setPagina(1); setQ(busqueda.trim()); }}>Buscar</button></div>
    {!lista && !error && <p>Cargando usuarios…</p>}
    {lista && <><Tabla columnas={['Nombre', 'Correo', 'Rol', 'Registro', 'Acciones']} vacio="No hay usuarios registrados." filas={lista.datos.map((u) => ({ clave: u.id, celdas: [<>{u.nombre}{u.id === yo?.id && <small> (tu cuenta)</small>}</>, u.correo, u.rol === 'admin' ? 'Administrador' : 'Cliente', fecha(u.createdAt), <><button onClick={() => editar(u)}>Editar</button>{' '}<button disabled={u.id === yo?.id} onClick={() => void eliminar(u)}>Eliminar</button></>] }))} /><Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="usuarios" onCambiar={setPagina} /></>}
  </PaginaAdmin>;
}
