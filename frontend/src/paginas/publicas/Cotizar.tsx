import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { api } from '../../api/cliente';
import { mensajeError, type RespuestaLista } from '../../tipos';

// Datos que escribe el usuario (los mismos campos del formulario del sitio estático: formRegistro.html)
interface Datos {
  nombre: string;
  correo: string;
  telefono: string;
  tipoServicio: string;
  ubicacion: string;
  descripcion: string;
}
type Campo = keyof Datos;
type Errores = Partial<Record<Campo, string>>;

const VACIO: Datos = { nombre: '', correo: '', telefono: '', tipoServicio: '', ubicacion: '', descripcion: '' };

// Opciones de respaldo: se usan mientras carga la API o si la API no responde
const SERVICIOS_BASE = [
  'Estructura Residencial',
  'Estructura Comercial',
  'Aislamiento',
  'Paneles de Yeso',
  'Revestimiento de Paredes',
  'Techado',
];

// El teléfono se acepta con espacios o guiones (9876-5432) y se envía solo con dígitos
const soloDigitos = (t: string): string => t.replace(/[\s-]/g, '');

// Mismas reglas y mensajes que el formulario estático; la API vuelve a validar todo
function validar(d: Datos): Errores {
  const e: Errores = {};
  if (!d.nombre.trim()) e.nombre = 'El nombre es requerido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'El email es requerido y debe ser válido.';
  if (!/^\d{8,10}$/.test(soloDigitos(d.telefono))) e.telefono = 'El teléfono debe tener entre 8 y 10 dígitos.';
  if (!d.tipoServicio) e.tipoServicio = 'Selecciona el tipo de servicio.';
  if (!d.ubicacion.trim()) e.ubicacion = 'La ubicación es requerida.';
  if (!d.descripcion.trim()) e.descripcion = 'Cuéntanos brevemente tu proyecto.';
  return e;
}

// Mensaje de error bajo un campo (la clase "error" viene de _registro.less y está oculta por defecto)
function ErrorCampo({ id, texto }: { id: string; texto?: string | undefined }) {
  return texto ? (
    <span className="error" id={id} style={{ display: 'block' }}>
      {texto}
    </span>
  ) : null;
}

export default function Cotizar() {
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [servicios, setServicios] = useState<string[]>(SERVICIOS_BASE);
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // El CSS del formulario (_registro.less) espera la clase "body-reg" en <body>, como en el sitio estático
  useEffect(() => {
    document.body.classList.add('body-reg');
    return () => document.body.classList.remove('body-reg');
  }, []);

  // Las opciones de servicio salen de la API; si falla, quedan las de respaldo
  useEffect(() => {
    let montado = true;
    api
      .get<RespuestaLista<{ id: number; nombre: string }>>('/servicios', { params: { activo: true, limite: 50 } })
      .then(({ data }) => {
        if (montado && data.datos.length > 0) setServicios(data.datos.map((s) => s.nombre));
      })
      .catch(() => undefined);
    return () => {
      montado = false;
    };
  }, []);

  // Actualiza un campo y quita su error mientras el usuario escribe
  const cambiar =
    (campo: Campo) => (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor = ev.target.value;
      setDatos((d) => ({ ...d, [campo]: valor }));
      setErrores((e) => ({ ...e, [campo]: undefined }));
    };

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const encontrados = validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      setEstado({ tipo: 'error', texto: 'Revisa los campos marcados.' });
      return;
    }

    setEnviando(true);
    setEstado(null);
    try {
      await api.post('/cotizaciones', {
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        telefono: soloDigitos(datos.telefono),
        tipoServicio: datos.tipoServicio,
        ubicacion: datos.ubicacion.trim(),
        descripcion: datos.descripcion.trim(),
      });
      setDatos(VACIO);
      setEstado({ tipo: 'ok', texto: '¡Solicitud enviada! Pronto nos pondremos en contacto contigo.' });
    } catch (e) {
      setEstado({ tipo: 'error', texto: mensajeError(e) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="main-reg">
      <div className="form-container">
        <h2>Solicitar cotización</h2>
        <form onSubmit={enviar} noValidate>
          <label htmlFor="name">Nombre:</label>
          <input
            type="text" id="name" name="name" maxLength={100} autoComplete="name"
            value={datos.nombre} onChange={cambiar('nombre')}
            aria-invalid={!!errores.nombre} aria-describedby="nameError"
          />
          <ErrorCampo id="nameError" texto={errores.nombre} />

          <label htmlFor="email">Email:</label>
          <input
            type="email" id="email" name="email" maxLength={120} autoComplete="email"
            value={datos.correo} onChange={cambiar('correo')}
            aria-invalid={!!errores.correo} aria-describedby="emailError"
          />
          <ErrorCampo id="emailError" texto={errores.correo} />

          <label htmlFor="phone">Teléfono:</label>
          <input
            type="tel" id="phone" name="phone" maxLength={14} autoComplete="tel"
            value={datos.telefono} onChange={cambiar('telefono')}
            aria-invalid={!!errores.telefono} aria-describedby="phoneError"
          />
          <ErrorCampo id="phoneError" texto={errores.telefono} />

          <label htmlFor="service">Tipo de servicio:</label>
          <select
            id="service" name="service"
            value={datos.tipoServicio} onChange={cambiar('tipoServicio')}
            aria-invalid={!!errores.tipoServicio} aria-describedby="serviceError"
          >
            <option value="">Selecciona una opción</option>
            {servicios.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ErrorCampo id="serviceError" texto={errores.tipoServicio} />

          <label htmlFor="location">Ubicación del proyecto:</label>
          <input
            type="text" id="location" name="location" maxLength={150}
            value={datos.ubicacion} onChange={cambiar('ubicacion')}
            aria-invalid={!!errores.ubicacion} aria-describedby="locationError"
          />
          <ErrorCampo id="locationError" texto={errores.ubicacion} />

          <label htmlFor="description">Descripción breve:</label>
          <textarea
            id="description" name="description" rows={4} maxLength={1000}
            value={datos.descripcion} onChange={cambiar('descripcion')}
            aria-invalid={!!errores.descripcion} aria-describedby="descriptionError"
          />
          <ErrorCampo id="descriptionError" texto={errores.descripcion} />

          <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar'}</button>
          <p
            className={`form-status ${estado ? (estado.tipo === 'ok' ? 'status-ok' : 'status-error') : ''}`}
            role="status" aria-live="polite"
          >
            {estado?.texto}
          </p>
        </form>
      </div>
    </div>
  );
}