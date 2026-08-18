import { Request, Response } from 'express';
import crypto from 'crypto';
import { sendSuccess } from '../utils/response';

export class VerificationController {
  async verifyCaller(req: Request, res: Response) {
    const { phone } = req.body;
    const verificationId = crypto.randomUUID();
    sendSuccess(res, {
      verified: false,
      verificationId,
      message: 'Verification code sent to your phone. Please provide the code to confirm your identity.',
    });
  }
}

export const verificationController = new VerificationController();
