import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/cliente';
import ErrorCampo from '../../componentes/ErrorCampo';
import { mensajeError } from '../../tipos';
import facebook from '../../../../assets/facebook.png';
import gmail from '../../../../assets/gmail.png';
import tiktok from '../../../../assets/tiktok.png';
import telefono from '../../../../assets/fon.png';
import trabajo from '../../../../assets/job.png';

// Datos que escribe el usuario en el formulario (POST /contacto)
interface Datos {
  nombre: string;
  correo: string;
  mensaje: string;
}
type Campo = keyof Datos;
type Errores = Partial<Record<Campo, string>>;

const VACIO: Datos = { nombre: '', correo: '', mensaje: '' };

// La API vuelve a validar todo; esto evita enviar datos incompletos
function validar(d: Datos): Errores {
  const e: Errores = {};
  if (!d.nombre.trim()) e.nombre = 'El nombre es requerido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'El email es requerido y debe ser válido.';
  if (!d.mensaje.trim()) e.mensaje = 'Escribe tu mensaje.';
  return e;
}

// Tarjetas de contactenos.html. Las que tienen "ruta" son enlaces internos de la app; el resto, enlaces externos
interface Tarjeta {
  img: string;
  alt: string;
  texto: string;
  accion: string;
  href?: string;
  externo?: boolean;
  ruta?: string;
}

const TARJETAS: Tarjeta[] = [
  {
    img: facebook, alt: 'Facebook', accion: 'Visitar', externo: true,
    texto: 'Síguenos en Facebook para ver nuestros trabajos y novedades.',
    href: 'https://www.facebook.com/share/1DHx5wUqkY/?mibextid=wwXIfr',
  },
  {
    img: gmail, alt: 'Gmail', accion: 'Enviar',
    texto: 'Escríbenos un correo y te responderemos a la brevedad.',
    href: 'mailto:opvdrywall@gmail.com',
  },
  {
    img: tiktok, alt: 'TikTok', accion: 'Ver', externo: true,
    texto: 'Conoce más sobre nuestros proyectos en TikTok.',
    href: 'https://www.tiktok.com/@opv.drywall?_r=1&_t=ZM-922AAEY7nEx',
  },
  {
    img: telefono, alt: 'Teléfono', accion: 'Llamar',
    texto: 'Llámanos para una comunicación directa y personalizada.',
    href: 'tel:+15197019903',
  },
  {
    // En el sitio estático apuntaba a una oferta externa; aquí lleva a la pantalla de postulación
    img: trabajo, alt: 'Trabaja con nosotros', accion: 'Aplicar',
    texto: '¿Interesado en trabajar con nosotros? Aplica ahora.',
    ruta: '/postular',
  },
];

// Interior de cada tarjeta (el CSS de _contacto.less espera <a><div><img/><p/><span/></div></a>)
function Interior({ t }: { t: Tarjeta }) {
  return (
    <div>
      <img src={t.img} alt={t.alt} />
      <p>{t.texto}</p>
      <span>{t.accion}</span>
    </div>
  );
}

export default function Contacto() {
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
      await api.post('/contacto', {
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        mensaje: datos.mensaje.trim(),
      });
      setDatos(VACIO);
      setEstado({ tipo: 'ok', texto: '¡Mensaje enviado! Te responderemos a la brevedad.' });
    } catch (e) {
      setEstado({ tipo: 'error', texto: mensajeError(e) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {/* Formulario: mismo diseño que Cotizar (_registro.less). minHeight evita que ocupe toda la pantalla */}
      <div className="main-reg" style={{ minHeight: 'auto' }}>
        <div className="form-container">
          <h2>Escríbenos</h2>
          <form onSubmit={enviar} noValidate>
            <label htmlFor="contacto-nombre">Nombre:</label>
            <input
              type="text" id="contacto-nombre" name="nombre" maxLength={100} autoComplete="name"
              value={datos.nombre} onChange={cambiar('nombre')}
              aria-invalid={!!errores.nombre} aria-describedby="contacto-nombre-error"
            />
            <ErrorCampo id="contacto-nombre-error" texto={errores.nombre} />

            <label htmlFor="contacto-correo">Email:</label>
            <input
              type="email" id="contacto-correo" name="correo" maxLength={120} autoComplete="email"
              value={datos.correo} onChange={cambiar('correo')}
              aria-invalid={!!errores.correo} aria-describedby="contacto-correo-error"
            />
            <ErrorCampo id="contacto-correo-error" texto={errores.correo} />

            <label htmlFor="contacto-mensaje">Mensaje:</label>
            <textarea
              id="contacto-mensaje" name="mensaje" rows={5} maxLength={1000}
              value={datos.mensaje} onChange={cambiar('mensaje')}
              aria-invalid={!!errores.mensaje} aria-describedby="contacto-mensaje-error"
            />
            <ErrorCampo id="contacto-mensaje-error" texto={errores.mensaje} />

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

      {/* Tarjetas de contacto (contactenos.html) */}
      <div className="llamanos">
        {TARJETAS.map((t) =>
          t.ruta ? (
            <Link key={t.alt} to={t.ruta} className="contact-card">
              <Interior t={t} />
            </Link>
          ) : (
            <a
              key={t.alt} href={t.href} className="contact-card"
              {...(t.externo ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              <Interior t={t} />
            </a>
          ),
        )}
      </div>
    </>
  );
}