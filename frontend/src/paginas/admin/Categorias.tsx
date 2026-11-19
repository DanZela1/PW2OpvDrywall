import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

// Pantalla /#/admin/categorias. Endpoints: CRUD /categorias-galeria (GET, POST, PUT /:id, DELETE /:id).
interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
}
interface RespuestaLista<T> { total: number; pagina: number; limite: number; datos: T[] }
interface Formulario { nombre: string; descripcion: string; activa: boolean }

const VACIO: Formulario = { nombre: '', descripcion: '', activa: true };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };

export default function Categorias() {
  const [lista, setLista] = useState<RespuestaLista<Categoria> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO);
  const [editando, setEditando] = useState<number | null>(null); // id de la categoría en edición (null = crear)
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api
      .get<RespuestaLista<Categoria>>('/categorias-galeria', { params: { pagina, limite: LIMITE, ...(q && { q }) } })
      .then((r) => { setLista(r.data); setError(null); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar las categorías.')));
  }, [pagina, q]);

  useEffect(() => { cargar(); }, [cargar]);

  const limpiar = () => { setForm(VACIO); setEditando(null); };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    // La descripción es opcional: si está vacía no se envía (la API no acepta texto vacío)
    const datos = { nombre: form.nombre, activa: form.activa, ...(form.descripcion.trim() && { descripcion: form.descripcion }) };
    try {
      if (editando === null) {
        await api.post('/categorias-galeria', datos);
        setAviso('Categoría creada.');
      } else {
        await api.put(`/categorias-galeria/${editando}`, datos);
        setAviso('Categoría actualizada.');
      }
      limpiar();
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar la categoría.'));
    }
  };

  const editar = (c: Categoria) => {
    setEditando(c.id);
    setForm({ nombre: c.nombre, descripcion: c.descripcion ?? '', activa: c.activa });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (c: Categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"? Sus fotos se conservan, pero quedan sin categoría.`)) return;
    setError(null);
    setAviso(null);
    try {
      await api.delete(`/categorias-galeria/${c.id}`);
      if (editando === c.id) limpiar();
      setAviso('Categoría eliminada.');
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar la categoría.'));
    }
  };

  return (
    <PaginaAdmin titulo="Categorías de galería">
      <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 30 }}>
        <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Nueva categoría' : `Editando categoría #${editando}`}</h3>
        <label style={campo}>Nombre *<input required maxLength={60} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
        <label style={campo}>Descripción<input maxLength={255} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} /> Activa (visible en el sitio)
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button type="submit">{editando === null ? 'Crear categoría' : 'Guardar cambios'}</button>
          {editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      <Mensajes error={error} aviso={aviso} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <input
          placeholder="Buscar por nombre o descripción"
          aria-label="Buscar categorías"
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
            columnas={['#', 'Nombre', 'Descripción', 'Activa', 'Acciones']}
            vacio="No hay categorías."
            filas={lista.datos.map((c) => ({
              clave: c.id,
              celdas: [
                c.id,
                c.nombre,
                c.descripcion ?? '—',
                c.activa ? 'Sí' : 'No',
                <>
                  <button onClick={() => editar(c)}>Editar</button>{' '}
                  <button onClick={() => eliminar(c)}>Eliminar</button>
                </>,
              ],
            }))}
          />
          <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="categorías" onCambiar={setPagina} />
        </>
      )}
    </PaginaAdmin>
  );
}
