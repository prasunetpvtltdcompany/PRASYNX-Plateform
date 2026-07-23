import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody } from '../../middleware/validate';
import { authController } from '../../controllers/auth.controller';
import { loginSchema } from '../../validators/auth.validator';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many attempts' } });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many attempts' } });

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/verify-token', asyncHandler((req, res) => authController.verifyToken(req, res)));
router.post('/forgot-password', resetLimiter, asyncHandler((req, res) => authController.forgotPassword(req, res)));
router.post('/reset-password', resetLimiter, asyncHandler((req, res) => authController.resetPassword(req, res)));
router.post('/refresh-token', asyncHandler((req, res) => authController.refreshToken(req, res)));

export default router;
