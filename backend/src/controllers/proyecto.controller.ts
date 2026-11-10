import { matchedData } from 'express-validator';
import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';

const { Proyecto, Cotizacion } = models;

const crud = crearCrud(Proyecto, {
  nombre: 'Proyecto',
  include: [{ model: Cotizacion, as: 'cotizacion', attributes: ['id', 'nombre', 'tipoServicio', 'estado'] }],
  antesDeCrear: async (_req, datos) => {
    // Código de seguimiento OPV-AÑO-NNNN, siempre generado por el sistema
    const siguiente = ((await Proyecto.max('id')) || 0) + 1;
    const codigo = `OPV-${new Date().getFullYear()}-${String(siguiente).padStart(4, '0')}`;
    // Si no se envía correo pero sí la cotización, se toma el correo de la cotización
    if (!datos.clienteCorreo && datos.cotizacionId) {
      datos.clienteCorreo = (await Cotizacion.findByPk(datos.cotizacionId)).correo;
    }
    return { ...datos, codigo };
  },
});

// POST /consulta (público): el cliente consulta su proyecto con correo + código
const consultar = h(async (req, res) => {
  const { correo, codigo } = matchedData(req, { locations: ['body'] });
  const proyecto = await Proyecto.findOne({ where: { codigo, clienteCorreo: correo } });
  // El mismo 404 si falla el código o el correo, para no revelar cuál dato falló
  if (!proyecto) throw new ApiError(404, 'Proyecto no encontrado');
  res.json({
    codigo: proyecto.codigo,
    estado: proyecto.estado,
    ultimaActualizacion: proyecto.updatedAt,
    contacto: 'opvdrywall@gmail.com',
  });
});

export default Object.assign(crud, { consultar });
