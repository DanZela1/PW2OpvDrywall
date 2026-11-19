import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

// Pantalla /#/admin/materiales. Endpoints: CRUD /materiales (GET, POST, PUT /:id, DELETE /:id), todos solo admin.
interface Material {
  id: number;
  nombre: string;
  unidad: string;
  precioUnitario: number;
  activo: boolean;
}
interface RespuestaLista<T> { total: number; pagina: number; limite: number; datos: T[] }
interface Formulario { nombre: string; unidad: string; precioUnitario: string; activo: boolean }

const VACIO: Formulario = { nombre: '', unidad: '', precioUnitario: '', activo: true };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };

export default function Materiales() {
  const [lista, setLista] = useState<RespuestaLista<Material> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO);
  const [editando, setEditando] = useState<number | null>(null); // id del material en edición (null = crear)
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api
      .get<RespuestaLista<Material>>('/materiales', { params: { pagina, limite: LIMITE, ...(q && { q }) } })
      .then((r) => { setLista(r.data); setError(null); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los materiales.')));
  }, [pagina, q]);

  useEffect(() => { cargar(); }, [cargar]);

  const limpiar = () => { setForm(VACIO); setEditando(null); };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const datos = { nombre: form.nombre, unidad: form.unidad, precioUnitario: Number(form.precioUnitario), activo: form.activo };
    try {
      if (editando === null) {
        await api.post('/materiales', datos);
        setAviso('Material creado.');
      } else {
        await api.put(`/materiales/${editando}`, datos);
        setAviso('Material actualizado.');
      }
      limpiar();
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el material.'));
    }
  };

  const editar = (m: Material) => {
    setEditando(m.id);
    setForm({ nombre: m.nombre, unidad: m.unidad, precioUnitario: String(m.precioUnitario), activo: m.activo });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (m: Material) => {
    if (!window.confirm(`¿Eliminar el material "${m.nombre}"? Las cotizaciones que ya lo usan conservan su línea.`)) return;
    setError(null);
    setAviso(null);
    try {
      await api.delete(`/materiales/${m.id}`);
      if (editando === m.id) limpiar();
      setAviso('Material eliminado.');
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el material.'));
    }
  };

  return (
    <PaginaAdmin titulo="Materiales">
      <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 30 }}>
        <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Nuevo material' : `Editando material #${editando}`}</h3>
        <label style={campo}>Nombre *<input required maxLength={100} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
        <label style={campo}>Unidad * (plancha, saco, metro…)<input required maxLength={30} value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} /></label>
        <label style={campo}>Precio unitario (L) *<input required type="number" min={0} max={1000000} step="0.01" value={form.precioUnitario} onChange={(e) => setForm({ ...form, precioUnitario: e.target.value })} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button type="submit">{editando === null ? 'Crear material' : 'Guardar cambios'}</button>
          {editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      <Mensajes error={error} aviso={aviso} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <input
          placeholder="Buscar por nombre o unidad"
          aria-label="Buscar materiales"
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
            columnas={['#', 'Nombre', 'Unidad', 'Precio unitario', 'Activo', 'Acciones']}
            vacio="No hay materiales."
            filas={lista.datos.map((m) => ({
              clave: m.id,
              celdas: [
                m.id,
                m.nombre,
                m.unidad,
                `L ${m.precioUnitario.toFixed(2)}`,
                m.activo ? 'Sí' : 'No',
                <>
                  <button onClick={() => editar(m)}>Editar</button>{' '}
                  <button onClick={() => eliminar(m)}>Eliminar</button>
                </>,
              ],
            }))}
          />
          <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="materiales" onCambiar={setPagina} />
        </>
      )}
    </PaginaAdmin>
  );
}
