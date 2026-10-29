const router = require('express').Router();
const c = require('../controllers/servicio.controller');
const v = require('../validators/servicio.validator');
const validar = require('../middlewares/validar');
const { auth, soloAdmin } = require('../middlewares/auth');

router.get('/', v.listar, validar, c.listar);                                     // público
router.get('/:id', v.id, validar, c.obtener);                                     // público
router.post('/', auth, soloAdmin, v.crear, validar, c.crear);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

module.exports = router;
