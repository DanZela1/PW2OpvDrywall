import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { urlArchivo } from '../../api/archivos';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

// Pantalla /#/admin/servicios. Endpoints: CRUD /servicios (GET, POST, PUT /:id, DELETE /:id).
// La imagen es opcional y viaja como archivo (multipart/form-data, campo "imagen").
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  contacto: string | null;
  imagen: string | null;
  precioBase?: number | null; // la API solo lo devuelve a administradores
  activo: boolean;
}
interface RespuestaLista<T> { total: number; pagina: number; limite: number; datos: T[] }
interface Formulario { nombre: string; descripcion: string; categoria: string; contacto: string; precioBase: string; activo: boolean }

const VACIO: Formulario = { nombre: '', descripcion: '', categoria: '', contacto: '', precioBase: '', activo: true };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };

export default function Servicios() {
  const [lista, setLista] = useState<RespuestaLista<Servicio> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [claveArchivo, setClaveArchivo] = useState(0); // al cambiarla, el selector de archivo se vacía
  const [editando, setEditando] = useState<number | null>(null); // id del servicio en edición (null = crear)
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api
      .get<RespuestaLista<Servicio>>('/servicios', { params: { pagina, limite: LIMITE, ...(q && { q }) } })
      .then((r) => { setLista(r.data); setError(null); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los servicios.')));
  }, [pagina, q]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (nombre: 'nombre' | 'descripcion' | 'categoria' | 'contacto' | 'precioBase') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [nombre]: e.target.value });

  const limpiar = () => {
    setForm(VACIO);
    setEditando(null);
    setArchivo(null);
    setClaveArchivo((n) => n + 1);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const sinPrecio = form.precioBase.trim() === '';
    // contacto y precioBase son opcionales: si están vacíos no se envían
    const datos: Record<string, string | number | boolean | null> = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      activo: form.activo,
      ...(form.contacto.trim() && { contacto: form.contacto }),
      ...(!sinPrecio && { precioBase: Number(form.precioBase) }),
    };
    try {
      let cuerpo: FormData | typeof datos = datos;
      if (archivo) {
        // Con imagen, la petición va como multipart/form-data (Axios pone el encabezado solo)
        cuerpo = new FormData();
        for (const [clave, valor] of Object.entries(datos)) cuerpo.append(clave, String(valor));
        cuerpo.append('imagen', archivo);
      } else if (editando !== null && sinPrecio) {
        datos.precioBase = null; // vaciar el precio de un servicio que ya lo tenía
      }
      if (editando === null) {
        await api.post('/servicios', cuerpo);
        setAviso('Servicio creado.');
      } else {
        await api.put(`/servicios/${editando}`, cuerpo);
        // multipart no puede enviar null: el precio vacío se quita en una segunda petición
        if (archivo && sinPrecio) await api.put(`/servicios/${editando}`, { precioBase: null });
        setAviso('Servicio actualizado.');
      }
      limpiar();
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el servicio.'));
    }
  };

  const editar = (s: Servicio) => {
    setEditando(s.id);
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion,
      categoria: s.categoria,
      contacto: s.contacto ?? '',
      precioBase: s.precioBase === null || s.precioBase === undefined ? '' : String(s.precioBase),
      activo: s.activo,
    });
    setArchivo(null);
    setClaveArchivo((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (s: Servicio) => {
    if (!window.confirm(`¿Eliminar el servicio "${s.nombre}"? También se borra su imagen.`)) return;
    setError(null);
    setAviso(null);
    try {
      await api.delete(`/servicios/${s.id}`);
      if (editando === s.id) limpiar();
      setAviso('Servicio eliminado.');
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el servicio.'));
    }
  };

  return (
    <PaginaAdmin titulo="Servicios">
      <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 30 }}>
        <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Nuevo servicio' : `Editando servicio #${editando}`}</h3>
        <label style={campo}>Nombre *<input required maxLength={100} value={form.nombre} onChange={cambiar('nombre')} /></label>
        <label style={campo}>Categoría *<input required maxLength={60} value={form.categoria} onChange={cambiar('categoria')} /></label>
        <label style={campo}>Contacto<input maxLength={120} value={form.contacto} onChange={cambiar('contacto')} /></label>
        <label style={campo}>Precio base (L)<input type="number" min={0} max={100000000} step="0.01" value={form.precioBase} onChange={cambiar('precioBase')} /></label>
        <label style={{ ...campo, gridColumn: '1 / -1' }}>Descripción *<textarea required maxLength={1000} rows={3} value={form.descripcion} onChange={cambiar('descripcion')} /></label>
        <label style={campo}>
          {editando === null ? 'Imagen (JPG, PNG o WebP, máx. 5 MB)' : 'Cambiar imagen (opcional)'}
          <input key={claveArchivo} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo (visible en el sitio)
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button type="submit">{editando === null ? 'Crear servicio' : 'Guardar cambios'}</button>
          {editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      <Mensajes error={error} aviso={aviso} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <input
          placeholder="Buscar por nombre o descripción"
          aria-label="Buscar servicios"
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
            columnas={['#', 'Imagen', 'Nombre', 'Categoría', 'Precio base', 'Activo', 'Acciones']}
            vacio="No hay servicios."
            filas={lista.datos.map((s) => ({
              clave: s.id,
              celdas: [
                s.id,
                s.imagen
                  ? <img src={urlArchivo(s.imagen)} alt={`Imagen de ${s.nombre}`} loading="lazy" style={{ width: 64, height: 48, objectFit: 'cover' }} />
                  : '—',
                s.nombre,
                s.categoria,
                s.precioBase === null || s.precioBase === undefined ? '—' : `L ${s.precioBase.toFixed(2)}`,
                s.activo ? 'Sí' : 'No',
                <>
                  <button onClick={() => editar(s)}>Editar</button>{' '}
                  <button onClick={() => eliminar(s)}>Eliminar</button>
                </>,
              ],
            }))}
          />
          <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="servicios" onCambiar={setPagina} />
        </>
      )}
    </PaginaAdmin>
  );
}
