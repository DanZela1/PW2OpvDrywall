import { Router } from 'express';
import c from '../controllers/proyecto.controller';
import * as v from '../validators/proyecto.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();

router.post('/consulta', v.consulta, validar, c.consultar); // público (PB-07)
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.post('/', auth, soloAdmin, v.crear, validar, c.crear);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
