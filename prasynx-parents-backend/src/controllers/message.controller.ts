import { Response } from 'express';
import { messageService } from '../services/message.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class MessageController {
  async sendMessage(req: AuthRequest, res: Response) {
    const result = await messageService.sendMessage(req.body);
    sendCreated(res, result, 'Message sent');
  }

  async getConversation(req: AuthRequest, res: Response) {
    const { user_id, other_user_id } = req.params;
    const data = await messageService.getConversation(user_id, other_user_id);
    sendSuccess(res, data);
  }
}
export const messageController = new MessageController();
