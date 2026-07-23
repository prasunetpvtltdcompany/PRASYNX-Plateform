import { Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class ParentNotificationController {
  async getNotifications(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (error) return sendSuccess(res, []);
    sendSuccess(res, data || []);
  }
}
export const parentNotificationController = new ParentNotificationController();
