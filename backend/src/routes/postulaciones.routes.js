const router = require('express').Router();
const c = require('../controllers/postulacion.controller');
const v = require('../validators/postulacion.validator');
const validar = require('../middlewares/validar');
const { auth, soloAdmin } = require('../middlewares/auth');

router.post('/', v.crear, validar, c.crear);                                      // público (PB-09)
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

module.exports = router;
