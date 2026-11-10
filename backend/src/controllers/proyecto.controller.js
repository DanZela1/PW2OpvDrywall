const { matchedData } = require('express-validator');
const { Proyecto, Cotizacion } = require('../models');
const ApiError = require('../utils/ApiError');
const crearCrud = require('../utils/crudFactory');
const h = require('../utils/asyncHandler');

const crud = crearCrud(Proyecto, {
  nombre: 'Proyecto',
  include: [{ model: Cotizacion, as: 'cotizacion', attributes: ['id', 'nombre', 'tipoServicio', 'estado'] }],
  // Genera el código de seguimiento (ej. OPV-2026-0001) y toma el correo de la cotización si no se envió
  antesDeCrear: async (req, datos) => {
    const siguiente = ((await Proyecto.max('id')) || 0) + 1;
    const codigo = `OPV-${new Date().getFullYear()}-${String(siguiente).padStart(4, '0')}`;
    if (!datos.clienteCorreo && datos.cotizacionId) {
      datos.clienteCorreo = (await Cotizacion.findByPk(datos.cotizacionId)).correo;
    }
    return { ...datos, codigo };
  },
});

// POST /api/proyectos/consulta  (público, PB-07) -> el cliente consulta con correo + código
// Si no coinciden devuelve el mismo 404, sin revelar cuál de los dos datos falló
crud.consultar = h(async (req, res) => {
  const { correo, codigo } = matchedData(req, { locations: ['body'] });
  const proyecto = await Proyecto.findOne({ where: { codigo, clienteCorreo: correo } });
  if (!proyecto) throw new ApiError(404, 'Proyecto no encontrado');
  res.json({
    codigo: proyecto.codigo,
    estado: proyecto.estado,
    ultimaActualizacion: proyecto.updatedAt,
    contacto: 'opvdrywall@gmail.com',
  });
});

module.exports = crud;
