import { Response } from 'express';
import { messageService } from '../services/message.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class MessageController {
  async sendMessage(req: AuthRequest, res: Response) {
    const data = await messageService.sendMessage(req.body);
    sendCreated(res, data, 'Message sent');
  }

  async getMessages(req: AuthRequest, res: Response) {
    const { user_id, other_user_id } = req.params;
    const data = await messageService.getMessages(user_id, other_user_id);
    sendSuccess(res, data);
  }

  async markMessageRead(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = await messageService.markMessageRead(id);
    sendSuccess(res, data);
  }

  async getConversations(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const data = await messageService.getConversations(user_id);
    sendSuccess(res, data);
  }

  async getUnreadCount(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const data = await messageService.getUnreadCount(user_id);
    sendSuccess(res, data);
  }
}
export const messageController = new MessageController();
