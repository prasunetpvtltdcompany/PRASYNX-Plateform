import { Router } from 'express';
import { authLimiter, credentialLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody } from '../../middleware/validate';
import { authController } from '../../controllers/auth.controller';
import { loginSchema, registerSchema } from '../../validators/auth.validator';

const registerLimiter = credentialLimiter;

const router = Router();

router.post('/login', validateBody(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/register', registerLimiter, validateBody(registerSchema), asyncHandler((req, res) => authController.register(req, res)));
router.post('/verify-token', asyncHandler((req, res) => authController.verifyToken(req, res)));
router.post('/forgot-password', credentialLimiter, asyncHandler((req, res) => authController.forgotPassword(req, res)));
router.post('/reset-password', credentialLimiter, asyncHandler((req, res) => authController.resetPassword(req, res)));
router.post('/refresh-token', asyncHandler((req, res) => authController.refreshToken(req, res)));

export default router;
