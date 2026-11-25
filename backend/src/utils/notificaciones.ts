import { enviarCorreo, enviarEnSegundoPlano } from './correo';
import { construirCorreo } from './plantillas';

// Todas las funciones de este archivo se usan SIN await desde los controladores:
// el correo se manda en segundo plano y un fallo de SMTP nunca afecta la respuesta de la API.

const destinoAdmin = (): string | undefined => process.env.CORREO_ADMIN || process.env.SMTP_USER;

// Dirección del sitio web, para los enlaces de los correos (ej. recuperar contraseña)
const urlSitio = (): string => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------
export function notificarBienvenida(u: { nombre: string; correo: string }): void {
  const { html, texto } = construirCorreo({
    titulo: '¡Bienvenido a OPV Drywall!',
    saludo: `Hola ${u.nombre},`,
    parrafos: [
      'Tu cuenta se creó correctamente. Desde ahora puedes solicitar cotizaciones y dar seguimiento a tus proyectos.',
    ],
    boton: { texto: 'Ir al sitio', url: urlSitio() },
  });
  enviarEnSegundoPlano({ para: u.correo, asunto: 'Bienvenido a OPV Drywall', texto, html });
}

export const MINUTOS_ENLACE_RECUPERACION = 30;

export function notificarRecuperacionPassword(u: { nombre: string; correo: string }, token: string): void {
const enlace = `${urlSitio()}/#/restablecer?token=${encodeURIComponent(token)}`;
  const { html, texto } = construirCorreo({
    titulo: 'Recupera tu contraseña',
    saludo: `Hola ${u.nombre},`,
    parrafos: [
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
      `El enlace funciona una sola vez y vence en ${MINUTOS_ENLACE_RECUPERACION} minutos.`,
    ],
    boton: { texto: 'Crear nueva contraseña', url: enlace },
    nota: 'Si tú no lo solicitaste, ignora este mensaje: tu contraseña actual sigue siendo válida.',
  });
  enviarEnSegundoPlano({ para: u.correo, asunto: 'Recupera tu contraseña de OPV Drywall', texto, html });
}

export function notificarPasswordCambiada(u: { nombre: string; correo: string }): void {
  const { html, texto } = construirCorreo({
    titulo: 'Tu contraseña fue cambiada',
    saludo: `Hola ${u.nombre},`,
    parrafos: ['La contraseña de tu cuenta se cambió correctamente.'],
    nota: 'Si no fuiste tú, comunícate con nosotros de inmediato.',
  });
  enviarEnSegundoPlano({ para: u.correo, asunto: 'Tu contraseña de OPV Drywall fue cambiada', texto, html });
}

// ---------------------------------------------------------------------------
// Cotizaciones
// ---------------------------------------------------------------------------
interface DatosCotizacion {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  tipoServicio: string;
  ubicacion: string;
  descripcion: string;
}

// Confirmación al cliente + aviso al administrador cuando se crea una cotización
export async function notificarNuevaCotizacion(c: DatosCotizacion): Promise<void> {
  const resumen: Array<[string, string]> = [
    ['Número de cotización', String(c.id)],
    ['Servicio', c.tipoServicio],
    ['Ubicación', c.ubicacion],
    ['Descripción', c.descripcion],
  ];

  // 1. Confirmación al cliente
  const cliente = construirCorreo({
    titulo: 'Recibimos tu solicitud de cotización',
    saludo: `Hola ${c.nombre},`,
    parrafos: [
      'Gracias por contactar a OPV Drywall. Recibimos tu solicitud con los siguientes datos:',
      'Nuestro equipo la revisará y te responderá lo antes posible.',
    ],
    datos: resumen,
  });
  await enviarCorreo({
    para: c.correo,
    asunto: `Recibimos tu solicitud de cotización #${c.id}`,
    texto: cliente.texto,
    html: cliente.html,
  });

  // 2. Aviso al administrador
  const admin = destinoAdmin();
  if (admin) {
    const aviso = construirCorreo({
      titulo: 'Nueva solicitud de cotización',
      parrafos: ['Se registró una nueva solicitud. Puedes gestionarla desde el panel de administración.'],
      datos: [['Cliente', c.nombre], ['Correo', c.correo], ['Teléfono', c.telefono], ...resumen],
    });
    await enviarCorreo({
      para: admin,
      asunto: `Nueva cotización #${c.id}: ${c.tipoServicio} (${c.nombre})`,
      texto: aviso.texto,
      html: aviso.html,
    });
  }
}

const TEXTO_ESTADO: Record<string, string> = {
  pendiente: 'está pendiente de revisión',
  en_revision: 'está siendo revisada por nuestro equipo',
  enviada: 'ya fue enviada: revisa tu correo o te contactaremos con el detalle',
  aceptada: 'fue aceptada. ¡Gracias por confiar en nosotros!',
  rechazada: 'no pudo ser aprobada en esta ocasión',
};

// Avisa al cliente que cambió el estado de su cotización
export function notificarCambioEstado(
  c: { id: number; nombre: string; correo: string },
  estadoNuevo: string,
  comentario?: string | null,
): void {
  const { html, texto } = construirCorreo({
    titulo: `Actualización de tu cotización #${c.id}`,
    saludo: `Hola ${c.nombre},`,
    parrafos: [
      `Tu solicitud de cotización #${c.id} ${TEXTO_ESTADO[estadoNuevo] ?? `cambió a "${estadoNuevo}"`}.`,
      ...(comentario ? [`Comentario del equipo: ${comentario}`] : []),
    ],
  });
  enviarEnSegundoPlano({ para: c.correo, asunto: `Tu cotización #${c.id} fue actualizada`, texto, html });
}

// ---------------------------------------------------------------------------
// Contacto y testimonios (avisos para el administrador)
// ---------------------------------------------------------------------------
export function notificarContacto(m: { nombre: string; correo: string; mensaje: string }): void {
  const admin = destinoAdmin();
  if (!admin) return;
  const { html, texto } = construirCorreo({
    titulo: 'Nuevo mensaje de contacto',
    parrafos: ['Alguien escribió desde el formulario de contacto del sitio.'],
    datos: [['Nombre', m.nombre], ['Correo', m.correo], ['Mensaje', m.mensaje]],
  });
  enviarEnSegundoPlano({ para: admin, asunto: `Mensaje de contacto de ${m.nombre}`, texto, html });
}

export function notificarNuevoTestimonio(t: { id: number; nombre: string; texto: string }): void {
  const admin = destinoAdmin();
  if (!admin) return;
  const { html, texto } = construirCorreo({
    titulo: 'Nuevo testimonio por aprobar',
    parrafos: ['Un cliente envió un testimonio. No se publica hasta que lo apruebes en el panel de administración.'],
    datos: [['Número', String(t.id)], ['Nombre', t.nombre], ['Testimonio', t.texto]],
  });
  enviarEnSegundoPlano({ para: admin, asunto: `Testimonio #${t.id} pendiente de aprobación`, texto, html });
}
