import { Router } from 'express';
import { register, login, logout, refresh, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   authenticate, logout);
router.post('/refresh',  refresh);
router.get('/me',        authenticate, getMe);

export default router;
