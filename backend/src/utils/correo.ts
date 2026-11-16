import nodemailer, { Transporter } from 'nodemailer';

export interface OpcionesCorreo {
  para: string;
  asunto: string;
  texto: string; // versión en texto plano (la leen los clientes de correo sin HTML)
  html?: string; // versión con diseño (ver utils/plantillas.ts)
}

let transporter: Transporter | null = null;

// Se crea la primera vez que se usa, cuando .env ya está cargado
function obtenerTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT = '465', SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true para 465, false para otros puertos
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      // Si el servidor SMTP no responde, el envío falla rápido en vez de quedarse colgado
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

/**
 * Envía un correo (texto + HTML).
 * Nunca lanza error: devuelve true si se envió y false si falló (SMTP caído, credenciales
 * incorrectas, correo inválido...), así un problema con el correo no rompe la operación principal.
 */
export async function enviarCorreo({ para, asunto, texto, html }: OpcionesCorreo): Promise<boolean> {
  const t = obtenerTransporter();
  if (!t) {
    console.warn('[correo] SMTP no configurado en .env; no se envió el correo a', para);
    return false;
  }

  try {
    const remitente = process.env.CORREO_REMITENTE || 'OPV Drywall';
    await t.sendMail({
      from: `"${remitente}" <${process.env.SMTP_USER}>`,
      to: para,
      subject: asunto,
      text: texto,
      html,
    });
    console.log('[correo] Enviado a', para);
    return true;
  } catch (error) {
    console.error('[correo] Error al enviar a', para, '-', (error as Error).message);
    return false;
  }
}

/**
 * Envía un correo en segundo plano: la API NO espera a que termine.
 * Usar en los controladores después de guardar en la base de datos.
 */
export function enviarEnSegundoPlano(opciones: OpcionesCorreo): void {
  void enviarCorreo(opciones).catch((error) => console.error('[correo] Error inesperado:', error));
}
