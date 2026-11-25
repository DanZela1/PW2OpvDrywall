
import bcrypt from 'bcryptjs';
import type { Modelos } from '../models';

// Crea el usuario administrador inicial (si no existe)
export default async ({ Usuario }: Modelos): Promise<string> => {
  const correo = 'admin@opvdrywall.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error('Configura ADMIN_PASSWORD con al menos 12 caracteres');
  }

  const [usuario, creado] = await Usuario.unscoped().findOrCreate({
    where: { correo },
    defaults: {
      nombre: 'Administrador',
      passwordHash: await bcrypt.hash(password, 10),
      rol: 'admin',
    },
  });

  return creado
    ? `Administrador creado -> ${correo}`
    : `Administrador existente -> ${usuario.correo}`;
};
