import { Router } from 'express';
import * as c from '../controllers/auth.controller';
import * as v from '../validators/auth.validator';
import validar from '../middlewares/validar';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/registro', v.registro, validar, c.registro);
router.post('/login', v.login, validar, c.login);
router.get('/me', auth, c.me);

export default router;
