import bcrypt from 'bcryptjs';
import { Request } from 'express';
import models from '../models';
import ApiError from '../utils/ApiError';
import crearCrud from '../utils/crudFactory';

const { Usuario } = models;

// Si se envía password, se guarda su hash en passwordHash
const aplicarHash = async (_req: Request, { password, ...resto }: Record<string, any>) =>
  password === undefined ? resto : { ...resto, passwordHash: await bcrypt.hash(password, 10) };

export default crearCrud(Usuario, {
  nombre: 'Usuario',
  antesDeCrear: aplicarHash,
  antesDeActualizar: aplicarHash,
  antesDeEliminar: async (req, usuario) => {
    if (req.user!.id === usuario.id) throw new ApiError(400, 'No puedes eliminar tu propio usuario');
  },
});
