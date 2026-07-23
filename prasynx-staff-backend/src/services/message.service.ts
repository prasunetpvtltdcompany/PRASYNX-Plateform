import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class MessageService {
  async sendMessage(data: { sender_id: string; recipient_id: string; message: string; file_url?: string }) {
    const { sender_id, recipient_id, message, file_url } = data;
    if (!sender_id || !recipient_id || !message) throw new BadRequestError('Required fields: sender_id, recipient_id, message');
    const { data: result, error } = await supabase
      .from('direct_messages').insert({ sender_id, recipient_id, message, file_url: file_url || null }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getMessages(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('direct_messages').select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async markMessageRead(id: string) {
    const { data, error } = await supabase
      .from('direct_messages').update({ read_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('direct_messages').select('*').or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('direct_messages').select('*', { count: 'exact', head: true }).eq('recipient_id', userId).is('read_at', null);
    if (error) throw new BadRequestError(error.message);
    return { count: count || 0 };
  }
}
export const messageService = new MessageService();
