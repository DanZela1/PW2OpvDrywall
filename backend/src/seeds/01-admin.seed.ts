import bcrypt from 'bcryptjs';
import type { Modelos } from '../models';

// Crea el usuario administrador inicial (si no existe)
export default async ({ Usuario }: Modelos): Promise<string> => {
  const correo = 'admin@opvdrywall.com';
  const password = 'Admin123!';
  await Usuario.unscoped().findOrCreate({
    where: { correo },
    defaults: { nombre: 'Administrador', passwordHash: await bcrypt.hash(password, 10), rol: 'admin' },
  });
  return `Admin listo -> ${correo} / ${password}  (cámbiala antes de publicar)`;
};
