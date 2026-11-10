import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import ApiError from '../utils/ApiError';

dotenv.config();

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------
export const MAX_MB = Number(process.env.MAX_UPLOAD_MB) || 5;

// Por defecto backend/uploads. En un hosting con disco persistente se cambia con UPLOADS_DIR.
const RAIZ = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '..', '..', 'uploads');

export const CARPETA_IMAGENES = path.join(RAIZ, 'imagenes'); // pública: se sirve en /uploads/imagenes
export const CARPETA_CV = path.join(RAIZ, 'cv'); // privada: solo la descarga un admin con token

[CARPETA_IMAGENES, CARPETA_CV].forEach((c) => fs.mkdirSync(c, { recursive: true }));

// ---------------------------------------------------------------------------
// Tipos permitidos. Además del mimetype que declara el cliente (que puede mentir)
// se comprueban los primeros bytes reales del archivo ("firma").
// ---------------------------------------------------------------------------
const empiezaCon = (buf: Buffer, bytes: number[], desde = 0) => bytes.every((b, i) => buf[desde + i] === b);

const TIPOS: Record<string, { ext: string; firma: (buf: Buffer) => boolean }> = {
  'image/jpeg': { ext: '.jpg', firma: (b) => empiezaCon(b, [0xff, 0xd8, 0xff]) },
  'image/png': { ext: '.png', firma: (b) => empiezaCon(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  'image/webp': {
    ext: '.webp',
    firma: (b) => empiezaCon(b, [0x52, 0x49, 0x46, 0x46]) && empiezaCon(b, [0x57, 0x45, 0x42, 0x50], 8),
  },
  'application/pdf': { ext: '.pdf', firma: (b) => empiezaCon(b, [0x25, 0x50, 0x44, 0x46]) },
  'application/msword': { ext: '.doc', firma: (b) => empiezaCon(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: '.docx',
    firma: (b) => empiezaCon(b, [0x50, 0x4b, 0x03, 0x04]),
  },
};

const MIME_IMAGENES = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_DOCUMENTOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ---------------------------------------------------------------------------
// Utilidades de archivos
// ---------------------------------------------------------------------------
const borrar = (ruta: string) => fs.unlink(ruta, () => {}); // si no existe, no pasa nada

const firmaValida = async (archivo: Express.Multer.File): Promise<boolean> => {
  const regla = TIPOS[archivo.mimetype];
  if (!regla) return false;
  const handle = await fs.promises.open(archivo.path, 'r');
  try {
    const buf = Buffer.alloc(16);
    await handle.read(buf, 0, 16, 0);
    return regla.firma(buf);
  } finally {
    await handle.close();
  }
};

// ---------------------------------------------------------------------------
// Fábrica del middleware
// ---------------------------------------------------------------------------
const crearSubida = (campo: string, carpeta: string, permitidos: string[]): RequestHandler => {
  const formatos = permitidos.map((m) => TIPOS[m].ext).join(', ');

  const subir = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, carpeta),
      // Nombre aleatorio y extensión según el tipo real: nunca se usa el nombre que manda el cliente
      filename: (_req, file, cb) =>
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${TIPOS[file.mimetype].ext}`),
    }),
    limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) =>
      permitidos.includes(file.mimetype)
        ? cb(null, true)
        : cb(new ApiError(400, `Tipo de archivo no permitido. Formatos válidos: ${formatos}`)),
  }).single(campo);

  // Si la petición no es multipart (JSON normal), multer la deja pasar sin hacer nada.
  return (req, res, next) => {
    subir(req, res, async (err) => {
      if (err) return next(err);
      const archivo = req.file;
      if (!archivo) return next();

      // Si la petición termina con error (validación, duplicado, 404...), no dejar el archivo huérfano
      res.on('finish', () => {
        if (res.statusCode >= 400) borrar(archivo.path);
      });

      try {
        if (!(await firmaValida(archivo))) {
          borrar(archivo.path);
          return next(new ApiError(400, 'El contenido del archivo no coincide con su tipo'));
        }
        next();
      } catch (e) {
        borrar(archivo.path);
        next(e);
      }
    });
  };
};

export const subirImagen = crearSubida('imagen', CARPETA_IMAGENES, MIME_IMAGENES);
export const subirCV = crearSubida('cv', CARPETA_CV, MIME_DOCUMENTOS);

// ---------------------------------------------------------------------------
// Helpers para controladores
// ---------------------------------------------------------------------------
/** Ruta pública guardada en la base de datos, ej. /uploads/imagenes/1793-ab12.jpg */
export const rutaPublicaImagen = (archivo: Express.Multer.File) => `/uploads/imagenes/${archivo.filename}`;

/** Borra una imagen a partir de la ruta pública guardada en la base de datos */
export const borrarImagen = (rutaPublica?: string | null) => {
  if (rutaPublica) borrar(path.join(CARPETA_IMAGENES, path.basename(rutaPublica)));
};

/** Borra un CV a partir del nombre de archivo guardado en la base de datos */
export const borrarCV = (nombre?: string | null) => {
  if (nombre) borrar(path.join(CARPETA_CV, path.basename(nombre)));
};
