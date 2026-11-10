import nodemailer, { Transporter } from 'nodemailer';

export interface OpcionesCorreo {
  para: string;
  asunto: string;
  texto: string;
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
    });
  }
  return transporter;
}

/**
 * Envía un correo de texto plano.
 * Nunca lanza error: devuelve true si se envió y false si falló,
 * así un problema con el correo no rompe la operación principal de la API.
 */
export async function enviarCorreo({ para, asunto, texto }: OpcionesCorreo): Promise<boolean> {
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
    });
    console.log('[correo] Enviado a', para);
    return true;
  } catch (error) {
    console.error('[correo] Error al enviar a', para, error);
    return false;
  }
}