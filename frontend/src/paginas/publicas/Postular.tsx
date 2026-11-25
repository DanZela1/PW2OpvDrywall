import { useState, type ChangeEvent, type FormEvent } from 'react';
import { api } from '../../api/cliente';
import ErrorCampo from '../../componentes/ErrorCampo';
import { mensajeError } from '../../tipos';

// Datos del formulario de postulación (POST /postulaciones)
interface Datos {
  nombre: string;
  correo: string;
  telefono: string;
  experiencia: string;
}
type Campo = keyof Datos;
type Errores = Partial<Record<Campo, string>>;

const VACIO: Datos = { nombre: '', correo: '', telefono: '', experiencia: '' };

// El teléfono se acepta con espacios o guiones (9876-5432) y se envía solo con dígitos
const soloDigitos = (t: string): string => t.replace(/[\s-]/g, '');

// La experiencia es opcional; la API vuelve a validar todo
function validar(d: Datos): Errores {
  const e: Errores = {};
  if (!d.nombre.trim()) e.nombre = 'El nombre es requerido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'El email es requerido y debe ser válido.';
  if (!/^\d{8,10}$/.test(soloDigitos(d.telefono))) e.telefono = 'El teléfono debe tener entre 8 y 10 dígitos.';
  return e;
}

export default function Postular() {
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Actualiza un campo y quita su error mientras el usuario escribe
  const cambiar = (campo: Campo) => (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const experiencia = datos.experiencia.trim();
      await api.post('/postulaciones', {
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        telefono: soloDigitos(datos.telefono),
        // La experiencia es opcional: si está vacía no se envía
        ...(experiencia ? { experiencia } : {}),
      });
      setDatos(VACIO);
      setEstado({ tipo: 'ok', texto: '¡Postulación enviada! Revisaremos tu información y te contactaremos.' });
    } catch (e) {
      setEstado({ tipo: 'error', texto: mensajeError(e) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="main-reg">
      <div className="form-container">
        <h2>Trabaja con nosotros</h2>
        <form onSubmit={enviar} noValidate>
          <label htmlFor="postular-nombre">Nombre:</label>
          <input
            type="text" id="postular-nombre" name="nombre" maxLength={100} autoComplete="name"
            value={datos.nombre} onChange={cambiar('nombre')}
            aria-invalid={!!errores.nombre} aria-describedby="postular-nombre-error"
          />
          <ErrorCampo id="postular-nombre-error" texto={errores.nombre} />

          <label htmlFor="postular-correo">Email:</label>
          <input
            type="email" id="postular-correo" name="correo" maxLength={120} autoComplete="email"
            value={datos.correo} onChange={cambiar('correo')}
            aria-invalid={!!errores.correo} aria-describedby="postular-correo-error"
          />
          <ErrorCampo id="postular-correo-error" texto={errores.correo} />

          <label htmlFor="postular-telefono">Teléfono:</label>
          <input
            type="tel" id="postular-telefono" name="telefono" maxLength={14} autoComplete="tel"
            value={datos.telefono} onChange={cambiar('telefono')}
            aria-invalid={!!errores.telefono} aria-describedby="postular-telefono-error"
          />
          <ErrorCampo id="postular-telefono-error" texto={errores.telefono} />

          <label htmlFor="postular-experiencia">Experiencia (opcional):</label>
          <textarea
            id="postular-experiencia" name="experiencia" rows={5} maxLength={1000}
            value={datos.experiencia} onChange={cambiar('experiencia')}
          />

          <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar postulación'}</button>
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