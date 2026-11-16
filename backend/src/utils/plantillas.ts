// Plantillas de correo: una sola estructura (encabezado, mensaje, botón opcional, pie)
// que genera la versión HTML y la versión en texto plano a partir del mismo contenido.

const COLOR_MARCA = '#1f3a5f';
const COLOR_ACENTO = '#e07a1f';

export interface ContenidoCorreo {
  titulo: string;
  saludo?: string;
  parrafos: string[];
  datos?: Array<[string, string]>; // pares "Etiqueta: valor" (resumen de una solicitud)
  boton?: { texto: string; url: string };
  nota?: string; // aviso en letra pequeña (ej. "si no fuiste tú, ignora este mensaje")
}

// Todo lo que escribe un usuario se escapa antes de ir al HTML (evita inyección de código en el correo)
export const escapar = (valor: unknown): string =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function construirCorreo(c: ContenidoCorreo): { html: string; texto: string } {
  const parrafosHtml = c.parrafos
    .map((p) => `<p style="margin:0 0 14px;line-height:1.55;color:#333;">${escapar(p)}</p>`)
    .join('');

  const datosHtml = c.datos?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:6px 0 18px;border-collapse:collapse;background:#f6f8fb;border-radius:6px;">` +
      c.datos
        .map(
          ([etiqueta, valor]) =>
            `<tr><td style="padding:8px 12px;color:#666;font-size:13px;width:34%;vertical-align:top;">${escapar(etiqueta)}</td>` +
            `<td style="padding:8px 12px;color:#222;font-size:14px;">${escapar(valor)}</td></tr>`,
        )
        .join('') +
      `</table>`
    : '';

  const botonHtml = c.boton
    ? `<p style="margin:22px 0;"><a href="${escapar(c.boton.url)}" style="background:${COLOR_ACENTO};color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:bold;display:inline-block;">${escapar(c.boton.texto)}</a></p>` +
      `<p style="margin:0 0 14px;font-size:12px;color:#777;word-break:break-all;">Si el botón no funciona, copia este enlace en tu navegador:<br>${escapar(c.boton.url)}</p>`
    : '';

  const notaHtml = c.nota ? `<p style="margin:18px 0 0;font-size:12px;color:#777;">${escapar(c.nota)}</p>` : '';

  const html =
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>` +
    `<body style="margin:0;padding:24px 0;background:#eef1f5;font-family:Arial,Helvetica,sans-serif;">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">` +
    `<tr><td style="background:${COLOR_MARCA};padding:20px 28px;color:#fff;font-size:20px;font-weight:bold;">OPV Drywall</td></tr>` +
    `<tr><td style="padding:28px;">` +
    `<h1 style="margin:0 0 18px;font-size:20px;color:${COLOR_MARCA};">${escapar(c.titulo)}</h1>` +
    (c.saludo ? `<p style="margin:0 0 14px;color:#333;">${escapar(c.saludo)}</p>` : '') +
    parrafosHtml +
    datosHtml +
    botonHtml +
    notaHtml +
    `</td></tr>` +
    `<tr><td style="background:#f6f8fb;padding:14px 28px;font-size:12px;color:#888;">Este mensaje fue enviado automáticamente por OPV Drywall. Por favor no respondas a este correo.</td></tr>` +
    `</table></body></html>`;

  const texto = [
    c.saludo,
    ...c.parrafos,
    c.datos?.length ? c.datos.map(([e, v]) => `${e}: ${v}`).join('\n') : undefined,
    c.boton ? `${c.boton.texto}: ${c.boton.url}` : undefined,
    c.nota,
    'Saludos,\nOPV Drywall',
  ]
    .filter(Boolean)
    .join('\n\n');

  return { html, texto };
}
