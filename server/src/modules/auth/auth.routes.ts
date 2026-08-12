import { Router } from 'express';
import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@prasynx/validation';
import { authenticate } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';
import { loginLimiter } from '../../shared/middleware/rateLimit';
import { authController } from './auth.controller';

const router = Router();

// Public
router.post('/login', loginLimiter.perIp, loginLimiter.perAccount, validate({ body: loginSchema }), authController.login);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refresh);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);

// Authenticated
router.post('/logout', authenticate, validate({ body: logoutSchema }), authController.logout);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), authController.changePassword);

export default router;