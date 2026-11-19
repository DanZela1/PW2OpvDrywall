import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

const ESTADOS = ['Cotización enviada', 'En ejecución', 'Finalizado'] as const;
type Estado = (typeof ESTADOS)[number];

interface Proyecto {
  id: number;
  codigo: string;
  clienteCorreo: string;
  estado: Estado;
  notas: string | null;
  cotizacion: { id: number; nombre: string; tipoServicio: string; estado: string } | null;
}
interface RespuestaLista<T> { total: number; pagina: number; limite: number; datos: T[] }
interface Formulario { cotizacionId: string; clienteCorreo: string; estado: Estado; notas: string }

const VACIO: Formulario = { cotizacionId: '', clienteCorreo: '', estado: 'Cotización enviada', notas: '' };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };

export default function Proyectos() {
  const [lista, setLista] = useState<RespuestaLista<Proyecto> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO);
  const [editando, setEditando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api
      .get<RespuestaLista<Proyecto>>('/proyectos', {
        params: { pagina, limite: LIMITE, ...(filtroEstado && { estado: filtroEstado }), ...(q && { q }) },
      })
      .then((r) => { setLista(r.data); setError(null); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los proyectos.')));
  }, [pagina, filtroEstado, q]);

  useEffect(() => { cargar(); }, [cargar]);

  const limpiar = () => { setForm(VACIO); setEditando(null); };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    try {
      if (editando === null) {
        await api.post('/proyectos', {
          estado: form.estado,
          ...(form.cotizacionId.trim() && { cotizacionId: Number(form.cotizacionId) }),
          ...(form.clienteCorreo.trim() && { clienteCorreo: form.clienteCorreo }),
          ...(form.notas.trim() && { notas: form.notas }),
        });
        setAviso('Proyecto creado.');
      } else {
        await api.put(`/proyectos/${editando}`, {
          clienteCorreo: form.clienteCorreo,
          estado: form.estado,
          ...(form.notas.trim() && { notas: form.notas }),
        });
        setAviso('Proyecto actualizado.');
      }
      limpiar();
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el proyecto.'));
    }
  };

  const editar = (p: Proyecto) => {
    setEditando(p.id);
    setForm({ cotizacionId: '', clienteCorreo: p.clienteCorreo, estado: p.estado, notas: p.notas ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (p: Proyecto) => {
    if (!window.confirm(`¿Eliminar el proyecto ${p.codigo}?`)) return;
    setError(null);
    setAviso(null);
    try {
      await api.delete(`/proyectos/${p.id}`);
      setAviso('Proyecto eliminado.');
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el proyecto.'));
    }
  };

  return (
    <PaginaAdmin titulo="Proyectos">
      <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 30 }}>
        <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Nuevo proyecto' : `Editando proyecto #${editando}`}</h3>
        {editando === null && (
          <label style={campo}>
            ID de la cotización
            <input type="number" min={1} value={form.cotizacionId} onChange={(e) => setForm({ ...form, cotizacionId: e.target.value })} />
          </label>
        )}
        <label style={campo}>
          Correo del cliente {editando === null ? '(obligatorio si no hay cotización)' : '*'}
          <input
            type="email"
            maxLength={120}
            required={editando !== null}
            value={form.clienteCorreo}
            onChange={(e) => setForm({ ...form, clienteCorreo: e.target.value })}
          />
        </label>
        <label style={campo}>
          Estado
          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Estado })}>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ ...campo, gridColumn: '1 / -1' }}>
          Notas
          <textarea maxLength={1000} rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button type="submit">{editando === null ? 'Crear proyecto' : 'Guardar cambios'}</button>
          {editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      <Mensajes error={error} aviso={aviso} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 15 }}>
        <input
          placeholder="Buscar por código o correo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPagina(1); setQ(busqueda.trim()); } }}
          style={{ flex: '1 1 260px', padding: 8 }}
        />
        <button onClick={() => { setPagina(1); setQ(busqueda.trim()); }}>Buscar</button>
        <select value={filtroEstado} onChange={(e) => { setPagina(1); setFiltroEstado(e.target.value); }} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!lista && !error && <p>Cargando…</p>}
      {lista && (
        <>
          <Tabla
            columnas={['Código', 'Correo del cliente', 'Estado', 'Cotización', 'Notas', 'Acciones']}
            vacio="No hay proyectos."
            filas={lista.datos.map((p) => ({
              clave: p.id,
              celdas: [
                p.codigo,
                p.clienteCorreo,
                p.estado,
                p.cotizacion ? `#${p.cotizacion.id} ${p.cotizacion.tipoServicio}` : '—',
                p.notas ?? '—',
                <>
                  <button onClick={() => editar(p)}>Editar</button>{' '}
                  <button onClick={() => eliminar(p)}>Eliminar</button>
                </>,
              ],
            }))}
          />
          <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="proyectos" onCambiar={setPagina} />
        </>
      )}
    </PaginaAdmin>
  );
}