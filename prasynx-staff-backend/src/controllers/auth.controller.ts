import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    if (result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      });
    }
    sendSuccess(res, result, 'Login successful');
  }

  async verifyToken(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = await authService.verifyToken(token);
    sendSuccess(res, { valid: true, user: decoded });
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);
    const result = await authService.forgotPassword(email);
    sendSuccess(res, result, 'If the email exists, a reset link has been sent');
  }

  async resetPassword(req: Request, res: Response) {
    const { token, new_password } = req.body;
    if (!token || !new_password) return sendError(res, 'Token and new_password are required', 400);
    const result = await authService.resetPassword(token, new_password);
    sendSuccess(res, result, 'Password has been reset successfully');
  }

  async refreshToken(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const result = await authService.refreshToken(token);
    sendSuccess(res, result, 'Token refreshed');
  }
}

export const authController = new AuthController();
