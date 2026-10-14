const bcrypt = require('bcryptjs');

// Usuario administrador de prueba (cambiar la contraseña antes de publicar)
module.exports = async ({ Usuario }) => {
  const correo = 'admin@opvdrywall.com';
  const password = 'Admin123!';
  await Usuario.unscoped().findOrCreate({
    where: { correo },
    defaults: { nombre: 'Administrador', passwordHash: await bcrypt.hash(password, 10), rol: 'admin' },
  });
  return `Admin listo -> ${correo} / ${password}  (cámbiala antes de publicar)`;
};
