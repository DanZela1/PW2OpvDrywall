import { Router } from 'express';
import c from '../controllers/postulacion.controller';
import * as v from '../validators/postulacion.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';
import { subirCV } from '../middlewares/subida';

const router = Router();

router.post('/', subirCV, v.crear, validar, c.crear); // público (PB-09); acepta JSON o multipart con el campo "cv"
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.get('/:id/cv', auth, soloAdmin, v.id, validar, c.descargarCV);
router.put('/:id', auth, soloAdmin, subirCV, v.actualizar, validar, c.actualizar);
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
