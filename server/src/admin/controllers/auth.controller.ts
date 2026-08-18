import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export class AuthController {
  async login(req: Request, res: Response) {
    const { token } = req.body;
    if (!token) return sendError(res, 'Token is required', 400);
    const result = await authService.login(token);
    if (result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
        path: '/'
      });
    }
    sendSuccess(res, { user: result.user, organisations: result.organisations }, 'Login successful');
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    sendSuccess(res, {}, 'Logged out');
  }

  async getCredentialHistory(req: AuthRequest, res: Response) {
    const history = await authService.getCredentialHistory();
    sendSuccess(res, { history });
  }

  async verifyOrg(req: AuthRequest, res: Response) {
    const { organisation_id, status } = req.body;
    const result = await authService.verifyOrg(organisation_id, status);
    sendSuccess(res, result);
  }

  async createOrganisation(req: AuthRequest, res: Response) {
    const result = await authService.createOrganisation(req.body);
    sendSuccess(res, result, 'Organisation created');
  }

  async createManagementAccess(req: AuthRequest, res: Response) {
    const result = await authService.createManagementAccess(req.body);
    sendSuccess(res, result, 'Management access created');
  }

  async changePassword(req: AuthRequest, res: Response) {
    const { current_password, new_password } = req.body;
    if (!req.user?.email) return sendError(res, 'User email not found', 401);
    const result = await authService.changePassword(req.user.email, current_password, new_password);
    sendSuccess(res, result);
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
