import type { Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { authService } from './auth.service';
import type { LoginResult } from '@prasynx/types';

export class AuthController {
  login = asyncHandler<Record<string, never>, LoginResult, { email: string; password: string; userAgent?: string; ip?: string }>(
    async (req, res) => {
      const body = req.validated?.body as { email: string; password: string; userAgent?: string; ip?: string };
      if (!body) throw new BadRequestError('Invalid request body');
      const result = await authService.login(body.email, body.password, body.userAgent, req.ip);
      this.attachRefreshCookie(res, result.refreshToken);
      res.status(200).json(result);
    },
  );

  refresh = asyncHandler(async (req, res) => {
    const body = req.validated?.body as { refreshToken?: string };
    if (!body?.refreshToken) throw new BadRequestError('refreshToken is required');
    const result = await authService.refresh(body.refreshToken, req.ip);
    this.attachRefreshCookie(res, result.refreshToken);
    res.status(200).json(result);
  });

  logout = asyncHandler(async (req, res) => {
    const body = req.validated?.body as { refreshToken?: string; all?: string };
    const user = req.user!;
    const all = body?.all === 'true';
    await authService.logout(body?.refreshToken, all, user.sessionId, user.userId);
    res.clearCookie('refreshToken');
    res.status(204).send();
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const body = req.validated?.body as { email: string };
    await authService.forgotPassword(body.email);
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const body = req.validated?.body as { token: string; newPassword: string };
    await authService.resetPassword(body.token, body.newPassword);
    res.status(200).json({ message: 'Password has been reset. Please sign in.' });
  });

  changePassword = asyncHandler(async (req, res) => {
    const body = req.validated?.body as { currentPassword: string; newPassword: string };
    const user = req.user!;
    await authService.changePassword(user.userId, body.currentPassword, body.newPassword);
    res.status(204).send();
  });

  private attachRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
  }
}

export const authController = new AuthController();