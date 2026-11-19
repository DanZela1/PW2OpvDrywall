import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import { urlArchivo } from '../../api/archivos';
import { mensajeError } from '../../api/errores';
import PaginaAdmin from '../../componentes/PaginaAdmin';
import Mensajes from '../../componentes/Mensajes';
import Tabla from '../../componentes/Tabla';
import Paginacion from '../../componentes/Paginacion';

// Pantalla /#/admin/galeria. Endpoints: CRUD /fotos-galeria (GET, POST, PUT /:id, DELETE /:id)
// y GET /categorias-galeria para llenar la lista de categorías.
// La foto viaja como archivo (multipart/form-data, campo "imagen") y es obligatoria al crear.
interface Categoria { id: number; nombre: string }
interface Foto {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen: string;
  activa: boolean;
  categoriaId: number | null;
  categoria: Categoria | null;
}
interface RespuestaLista<T> { total: number; pagina: number; limite: number; datos: T[] }
interface Formulario { titulo: string; descripcion: string; categoriaId: string; activa: boolean }

const VACIO: Formulario = { titulo: '', descripcion: '', categoriaId: '', activa: true };
const LIMITE = 10;
const campo: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };

export default function Galeria() {
  const [lista, setLista] = useState<RespuestaLista<Foto> | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pagina, setPagina] = useState(1);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [form, setForm] = useState<Formulario>(VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [claveArchivo, setClaveArchivo] = useState(0); // al cambiarla, el selector de archivo se vacía
  const [editando, setEditando] = useState<number | null>(null); // id de la foto en edición (null = crear)
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    api
      .get<RespuestaLista<Foto>>('/fotos-galeria', {
        params: { pagina, limite: LIMITE, ...(filtroCategoria && { categoriaId: filtroCategoria }) },
      })
      .then((r) => { setLista(r.data); setError(null); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar las fotos.')));
  }, [pagina, filtroCategoria]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    api
      .get<RespuestaLista<Categoria>>('/categorias-galeria', { params: { limite: 100 } })
      .then((r) => setCategorias(r.data.datos))
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar las categorías.')));
  }, []);

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
    // La descripción es opcional: si está vacía no se envía
    const datos: Record<string, string | number | boolean> = {
      titulo: form.titulo,
      categoriaId: Number(form.categoriaId),
      activa: form.activa,
      ...(form.descripcion.trim() && { descripcion: form.descripcion }),
    };
    try {
      let cuerpo: FormData | typeof datos = datos;
      if (archivo) {
        // Con imagen, la petición va como multipart/form-data (Axios pone el encabezado solo)
        cuerpo = new FormData();
        for (const [clave, valor] of Object.entries(datos)) cuerpo.append(clave, String(valor));
        cuerpo.append('imagen', archivo);
      }
      if (editando === null) {
        await api.post('/fotos-galeria', cuerpo);
        setAviso('Foto subida.');
      } else {
        await api.put(`/fotos-galeria/${editando}`, cuerpo);
        setAviso('Foto actualizada.');
      }
      limpiar();
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar la foto.'));
    }
  };

  const editar = (f: Foto) => {
    setEditando(f.id);
    setForm({ titulo: f.titulo, descripcion: f.descripcion ?? '', categoriaId: f.categoriaId ? String(f.categoriaId) : '', activa: f.activa });
    setArchivo(null);
    setClaveArchivo((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (f: Foto) => {
    if (!window.confirm(`¿Eliminar la foto "${f.titulo}"? El archivo se borra y no se puede recuperar.`)) return;
    setError(null);
    setAviso(null);
    try {
      await api.delete(`/fotos-galeria/${f.id}`);
      if (editando === f.id) limpiar();
      setAviso('Foto eliminada.');
      cargar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar la foto.'));
    }
  };

  return (
    <PaginaAdmin titulo="Galería de fotos">
      <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 30 }}>
        <h3 style={{ gridColumn: '1 / -1' }}>{editando === null ? 'Nueva foto' : `Editando foto #${editando}`}</h3>
        <label style={campo}>Título *<input required maxLength={100} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></label>
        <label style={campo}>
          Categoría *
          <select required value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
            <option value="">Elige una categoría</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </label>
        <label style={{ ...campo, gridColumn: '1 / -1' }}>Descripción<input maxLength={255} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
        <label style={campo}>
          {editando === null ? 'Imagen * (JPG, PNG o WebP, máx. 5 MB)' : 'Cambiar imagen (opcional)'}
          <input
            key={claveArchivo}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={editando === null}
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} /> Activa (visible en el sitio)
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button type="submit">{editando === null ? 'Subir foto' : 'Guardar cambios'}</button>
          {editando !== null && <button type="button" onClick={limpiar}>Cancelar</button>}
        </div>
      </form>

      <Mensajes error={error} aviso={aviso} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
        Ver categoría
        <select value={filtroCategoria} onChange={(e) => { setPagina(1); setFiltroCategoria(e.target.value); }} style={{ padding: 8 }}>
          <option value="">Todas</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </label>

      {!lista && !error && <p>Cargando…</p>}
      {lista && (
        <>
          <Tabla
            columnas={['#', 'Foto', 'Título', 'Categoría', 'Activa', 'Acciones']}
            vacio="No hay fotos."
            filas={lista.datos.map((f) => ({
              clave: f.id,
              celdas: [
                f.id,
                <img src={urlArchivo(f.imagen)} alt={f.titulo} loading="lazy" style={{ width: 96, height: 72, objectFit: 'cover' }} />,
                f.titulo,
                f.categoria?.nombre ?? 'Sin categoría',
                f.activa ? 'Sí' : 'No',
                <>
                  <button onClick={() => editar(f)}>Editar</button>{' '}
                  <button onClick={() => eliminar(f)}>Eliminar</button>
                </>,
              ],
            }))}
          />
          <Paginacion pagina={pagina} total={lista.total} limite={LIMITE} etiqueta="fotos" onCambiar={setPagina} />
        </>
      )}
    </PaginaAdmin>
  );
}
