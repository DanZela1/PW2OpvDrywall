// Prepara el proyecto completo: instala las dependencias de cada carpeta que tenga
// package.json y crea los .env que falten (copiando el .env.example).
//
// Se ejecuta SOLO en estos casos:
//   - al hacer `npm install` en la raíz (postinstall)      -> instala lo que falte
//   - antes de `npm run dev:all` / `npm start` (predev)     -> instala lo que falte
//   - con `npm run setup`                                   -> reinstala todo
// En GitHub Actions (CI) no hace nada: allí solo se compila el sitio.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SUBPROYECTOS = ['backend', 'transac_crud'];
const RAIZ = process.cwd();
const SOLO_FALTANTES = process.argv.includes('--solo-faltantes');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

if (process.env.CI) {
  process.exit(0);
}

for (const carpeta of SUBPROYECTOS) {
  const ruta = join(RAIZ, carpeta);
  if (!existsSync(join(ruta, 'package.json'))) continue;

  const yaInstalado = existsSync(join(ruta, 'node_modules'));
  if (!(SOLO_FALTANTES && yaInstalado)) {
    console.log(`\n▶ Instalando dependencias de ${carpeta}...`);
    const resultado = spawnSync(npm, ['install', '--no-audit', '--no-fund'], {
      cwd: ruta,
      stdio: 'inherit',
      shell: process.platform === 'win32', // en Windows npm.cmd necesita shell
    });
    if (resultado.status !== 0) {
      console.error(`✖ Falló npm install en ${carpeta}`);
      process.exit(resultado.status ?? 1);
    }
  }

  const env = join(ruta, '.env');
  const ejemplo = join(ruta, '.env.example');
  if (!existsSync(env) && existsSync(ejemplo)) {
    copyFileSync(ejemplo, env);
    console.log(`✔ Creado ${carpeta}/.env (revisa DB_USER y DB_PASSWORD)`);
  }
}

if (!SOLO_FALTANTES) console.log('\n✔ Listo. Enciende MySQL en XAMPP y corre:  npm start');
