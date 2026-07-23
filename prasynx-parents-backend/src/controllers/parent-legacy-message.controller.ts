import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyMessageController {
  async getConversations(req: Request, res: Response) {
    const { user_id } = req.params;
    try {
      const { data, error } = await supabase.from('direct_messages').select('*').or(`sender_id.eq.${user_id},recipient_id.eq.${user_id}`).order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async markRead(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { data, error } = await supabase.from('direct_messages').update({ read_at: new Date().toISOString() }).eq('id', id).select();
      if (error) throw error;
      res.json(data?.[0]);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async getUnreadCount(req: Request, res: Response) {
    const { user_id } = req.params;
    try {
      const { data, error } = await supabase.from('direct_messages').select('id', { count: 'exact', head: true }).eq('recipient_id', user_id).is('read_at', null);
      if (error) throw error;
      res.json({ count: data?.length || 0 });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyMessageController = new ParentLegacyMessageController();
