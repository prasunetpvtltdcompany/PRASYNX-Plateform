import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { authService } from '../../auth/auth.service';
import { asyncHandler } from '../../../shared/errors/errors';

const router = Router();

// Compatibility: /api/v2/auth/login -> reuse monolith authService
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    const result = await authService.login(email, password, req.get('User-Agent') || '', req.ip);
    // attach refresh cookie for legacy frontends
    if ((result as any).refreshToken) {
      res.cookie('refreshToken', (result as any).refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/api/v2/auth',
      });
    }
    res.status(200).json(result);
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json({ success: false, error: 'refreshToken is required' });
    const result = await authService.refresh(refreshToken, req.ip);
    if ((result as any).refreshToken) {
      res.cookie('refreshToken', (result as any).refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/api/v2/auth',
      });
    }
    res.status(200).json(result);
  }),
);

router.post(
  '/verify-token',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
    try {
      const decoded = jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer, audience: config.jwt.audience });
      res.status(200).json({ valid: true, user: decoded });
    } catch (err) {
      res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
  }),
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    await authService.forgotPassword(email);
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }),
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, new_password } = req.body as { token?: string; new_password?: string };
    if (!token || !new_password) return res.status(400).json({ success: false, error: 'token and new_password are required' });
    await authService.resetPassword(token, new_password);
    res.status(200).json({ message: 'Password has been reset. Please sign in.' });
  }),
);

export default router;
