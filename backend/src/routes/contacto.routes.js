const router = require('express').Router();
const c = require('../controllers/contacto.controller');
const v = require('../validators/contacto.validator');
const validar = require('../middlewares/validar');
const { auth, soloAdmin } = require('../middlewares/auth');

router.post('/', v.crear, validar, c.crear);                                      // público
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

module.exports = router;
