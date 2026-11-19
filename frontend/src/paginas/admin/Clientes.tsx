import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

// Pantalla /#/admin/clientes. Endpoints: CRUD /clientes (GET, POST, PUT /:id, DELETE /:id).
interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string | null;
  notas: string | null;
}
interface RespuestaLista<T> { total: number; pagina: number; limite: number; datos: T[] }
interface Formulario { nombre: string; correo: string; telefono: string; direccion: string; notas: string }

const VACIO: Formulario = { nombre: '', correo: '', telefono: '', direccion: '', notas: '' };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };

export default function Clientes() {
  const [lista, setLista] = useState<RespuestaLista<Cliente> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO);
  const [editando, setEditando] = useState<number | null>(null); // id del cliente en edición (null = crear)
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api
      .get<RespuestaLista<Cliente>>('/clientes', { params: { pagina, limite: LIMITE, ...(q && { q }) } })
      .then((r) => { setLista(r.data); setError(null); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los clientes.')));
  }, [pagina, q]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (nombre: keyof Formulario) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [nombre]: e.target.value });

  const limpiar = () => { setForm(VACIO); setEditando(null); };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    // direccion y notas son opcionales: si están vacías no se envían
    const datos = {
      nombre: form.nombre,
      correo: form.correo,
      telefono: form.telefono,
      ...(form.direccion.trim() && { direccion: form.direccion }),
      ...(form.notas.trim() && { notas: form.notas }),
    };
    try {
      if (editando === null) {
        await api.post('/clientes', datos);
        setAviso('Cliente creado.');
      } else {
        await api.put(`/clientes/${editando}`, datos);
        setAviso('Cliente actualizado.');
      }
      limpiar();
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el cliente.'));
    }
  };

  const editar = (c: Cliente) => {
    setEditando(c.id);
    setForm({ nombre: c.nombre, correo: c.correo, telefono: c.telefono, direccion: c.direccion ?? '', notas: c.notas ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (c: Cliente) => {
    if (!window.confirm(`¿Eliminar al cliente "${c.nombre}"? Sus cotizaciones se conservan, pero quedan sin cliente.`)) return;
    setError(null);
    setAviso(null);
    try {
      await api.delete(`/clientes/${c.id}`);
      setAviso('Cliente eliminado.');
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el cliente.'));
    }
  };

  return (
    <PaginaAdmin titulo="Clientes">
      <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 30 }}>
        <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Nuevo cliente' : `Editando cliente #${editando}`}</h3>
        <label style={campo}>Nombre *<input required maxLength={100} value={form.nombre} onChange={cambiar('nombre')} /></label>
        <label style={campo}>Correo *<input required type="email" maxLength={120} value={form.correo} onChange={cambiar('correo')} /></label>
        <label style={campo}>Teléfono * (8 a 10 dígitos)<input required pattern="\d{8,10}" value={form.telefono} onChange={cambiar('telefono')} /></label>
        <label style={campo}>Dirección<input maxLength={150} value={form.direccion} onChange={cambiar('direccion')} /></label>
        <label style={{ ...campo, gridColumn: '1 / -1' }}>Notas<textarea maxLength={1000} rows={2} value={form.notas} onChange={cambiar('notas')} /></label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button type="submit">{editando === null ? 'Crear cliente' : 'Guardar cambios'}</button>
          {editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      <Mensajes error={error} aviso={aviso} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <input
          placeholder="Buscar por nombre, correo o teléfono"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPagina(1); setQ(busqueda.trim()); } }}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => { setPagina(1); setQ(busqueda.trim()); }}>Buscar</button>
      </div>

      {!lista && !error && <p>Cargando…</p>}
      {lista && (
        <>
          <Tabla
            columnas={['#', 'Nombre', 'Correo', 'Teléfono', 'Dirección', 'Acciones']}
            vacio="No hay clientes."
            filas={lista.datos.map((c) => ({
              clave: c.id,
              celdas: [
                c.id,
                c.nombre,
                c.correo,
                c.telefono,
                c.direccion ?? '—',
                <>
                  <button onClick={() => editar(c)}>Editar</button>{' '}
                  <button onClick={() => eliminar(c)}>Eliminar</button>
                </>,
              ],
            }))}
          />
          <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="clientes" onCambiar={setPagina} />
        </>
      )}
    </PaginaAdmin>
  );
}