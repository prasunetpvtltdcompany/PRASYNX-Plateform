import { Request, Response } from 'express';
import { callService } from '../services/callService';
import { conversationService } from '../services/conversationService';
import { sendSuccess } from '../utils/response';

export class CallController {
  async incomingCall(req: Request, res: Response) {
    const { from, callerName, callerRole } = req.body;
    const call = await callService.createIncoming(from, callerName, callerRole);
    conversationService.create(call.id);
    const welcome = conversationService.generateWelcomeMessage(callerName);
    sendSuccess(res, { call, message: welcome }, 'Call initiated', 201);
  }

  async getCall(req: Request, res: Response) {
    const call = await callService.getById(req.params.id);
    sendSuccess(res, call);
  }

  async listCalls(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const calls = await callService.list(limit, offset);
    sendSuccess(res, calls);
  }

  async endCall(req: Request, res: Response) {
    const { id } = req.params;
    const { durationSecs } = req.body;
    const call = await callService.updateStatus(id, 'completed', durationSecs);
    conversationService.delete(id);
    sendSuccess(res, call, 'Call ended');
  }
}

export const callController = new CallController();
