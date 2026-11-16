import { matchedData } from 'express-validator';
import models from '../models';
import crearCrud from '../utils/crudFactory';
import h from '../utils/asyncHandler';
import { notificarContacto } from '../utils/notificaciones';

const { Contacto } = models;

const crud = crearCrud(Contacto, { nombre: 'Mensaje de contacto', camposBusqueda: ['nombre', 'correo', 'mensaje'] });

// POST /: guarda el mensaje y avisa al administrador por correo en segundo plano
const crear = h(async (req, res) => {
  const creado = await Contacto.create(matchedData(req, { locations: ['body'] }));
  notificarContacto(creado);
  res.status(201).json(creado);
});

export default Object.assign(crud, { crear });
