import { Router } from 'express';
import c from '../controllers/cotizacion.controller';
import * as v from '../validators/cotizacion.validator';
import validar from '../middlewares/validar';
import { auth, authOpcional, soloAdmin } from '../middlewares/auth';

const router = Router();

router.post('/', authOpcional, v.crear, validar, c.crear); // público (PB-01)
router.get('/mias', auth, c.listarMias); // cliente logueado
router.get('/', auth, soloAdmin, v.listar, validar, c.listar); // admin (PB-02)
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
