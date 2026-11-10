import { enviarCorreo } from './correo';

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
  const resumen = [
    `Número de cotización: ${c.id}`,
    `Servicio: ${c.tipoServicio}`,
    `Ubicación: ${c.ubicacion}`,
    `Descripción: ${c.descripcion}`,
  ].join('\n');

  // 1. Confirmación al cliente
  await enviarCorreo({
    para: c.correo,
    asunto: `Recibimos tu solicitud de cotización #${c.id}`,
    texto:
      `Hola ${c.nombre},\n\n` +
      `Gracias por contactar a OPV Drywall. Recibimos tu solicitud de cotización con los siguientes datos:\n\n` +
      `${resumen}\n\n` +
      `Nuestro equipo la revisará y te responderá lo antes posible.\n\n` +
      `Saludos,\nOPV Drywall`,
  });

  // 2. Aviso al administrador
  const destinoAdmin = process.env.CORREO_ADMIN || process.env.SMTP_USER;
  if (destinoAdmin) {
    await enviarCorreo({
      para: destinoAdmin,
      asunto: `Nueva cotización #${c.id}: ${c.tipoServicio} (${c.nombre})`,
      texto:
        `Se registró una nueva solicitud de cotización.\n\n` +
        `Cliente: ${c.nombre}\n` +
        `Correo: ${c.correo}\n` +
        `Teléfono: ${c.telefono}\n` +
        `${resumen}\n\n` +
        `Puedes gestionarla desde el panel de administración.`,
    });
  }
}