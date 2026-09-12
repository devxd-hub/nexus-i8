import { Router } from 'express';
import { authController } from './auth.controller.ts';

const router = Router();

router.get('/me', (req, res, next) => authController.me(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

export default router;
