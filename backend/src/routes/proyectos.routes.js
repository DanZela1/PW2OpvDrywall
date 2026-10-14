const router = require('express').Router();
const c = require('../controllers/proyecto.controller');
const v = require('../validators/proyecto.validator');
const validar = require('../middlewares/validar');
const { auth, soloAdmin } = require('../middlewares/auth');

router.post('/consulta', v.consulta, validar, c.consultar);                       // público (PB-07)
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);
router.post('/', auth, soloAdmin, v.crear, validar, c.crear);
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

module.exports = router;
