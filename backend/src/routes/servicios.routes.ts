import { Router } from 'express';
import c from '../controllers/servicio.controller';
import * as v from '../validators/servicio.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';
import { subirImagen } from '../middlewares/subida';

const router = Router();

router.get('/', v.listar, validar, c.listar); // público
router.get('/:id', v.id, validar, c.obtener); // público
router.post('/', auth, soloAdmin, subirImagen, v.crear, validar, c.crear);
router.put('/:id', auth, soloAdmin, subirImagen, v.actualizar, validar, c.actualizar);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
