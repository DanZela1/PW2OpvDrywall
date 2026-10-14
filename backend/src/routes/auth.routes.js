const router = require('express').Router();
const c = require('../controllers/auth.controller');
const v = require('../validators/auth.validator');
const validar = require('../middlewares/validar');
const { auth } = require('../middlewares/auth');

router.post('/registro', v.registro, validar, c.registro);
router.post('/login', v.login, validar, c.login);
router.get('/me', auth, c.me);

module.exports = router;
