import { Router } from 'express';
import c from '../controllers/usuario.controller';
import * as v from '../validators/usuario.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();

router.use(auth, soloAdmin); // todo el módulo es solo para administradores

router.get('/', v.listar, validar, c.listar);
router.get('/:id', v.id, validar, c.obtener);
router.post('/', v.crear, validar, c.crear);
router.put('/:id', v.actualizar, validar, c.actualizar);
router.delete('/:id', v.id, validar, c.eliminar);

export default router;
