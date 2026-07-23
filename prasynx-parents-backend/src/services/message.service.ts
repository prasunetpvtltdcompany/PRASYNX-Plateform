import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class MessageService {
  async sendMessage(data: { sender_id: string; recipient_id: string; message: string }) {
    const { data: result, error } = await supabase
      .from('direct_messages')
      .insert({ sender_id: data.sender_id, recipient_id: data.recipient_id, message: data.message })
      .select();
    if (error) throw new BadRequestError(error.message);
    return result?.[0];
  }

  async getConversation(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const messageService = new MessageService();
