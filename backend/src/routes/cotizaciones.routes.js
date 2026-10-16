const router = require('express').Router();
const c = require('../controllers/cotizacion.controller');
const v = require('../validators/cotizacion.validator');
const validar = require('../middlewares/validar');
const { auth, authOpcional, soloAdmin } = require('../middlewares/auth');

router.post('/', authOpcional, v.crear, validar, c.crear);                       // público (PB-01)
router.get('/mias', auth, c.listarMias);                                          // cliente logueado
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);                    // admin (PB-02)
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

module.exports = router;
