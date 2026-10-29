const router = require('express').Router();
const c = require('../controllers/usuario.controller');
const v = require('../validators/usuario.validator');
const validar = require('../middlewares/validar');
const { auth, soloAdmin } = require('../middlewares/auth');

router.use(auth, soloAdmin); // todo el módulo es solo para administradores
router.get('/', v.listar, validar, c.listar);
router.get('/:id', v.id, validar, c.obtener);
router.post('/', v.crear, validar, c.crear);
router.put('/:id', v.actualizar, validar, c.actualizar);
router.delete('/:id', v.id, validar, c.eliminar);

module.exports = router;
