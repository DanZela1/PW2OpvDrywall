import { Router } from 'express';
import c from '../controllers/contacto.controller';
import * as v from '../validators/contacto.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();

router.post('/', v.crear, validar, c.crear); // público
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
