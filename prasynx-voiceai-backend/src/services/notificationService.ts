import { supabase } from '../config/database';
import { NotificationRecord } from '../types';
import { AppError } from '../utils/errors';

export class NotificationService {
  async send(data: {
    recipientId?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    channel: 'sms' | 'email' | 'whatsapp' | 'app';
    subject: string;
    body: string;
  }): Promise<NotificationRecord> {
    const { data: record, error } = await supabase
      .from('voice_notifications')
      .insert({
        recipient_id: data.recipientId || null,
        recipient_phone: data.recipientPhone || null,
        recipient_email: data.recipientEmail || null,
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new AppError(`Failed to create notification: ${error.message}`, 500);
    return record;
  }

  async markSent(id: string): Promise<NotificationRecord> {
    const { data, error } = await supabase
      .from('voice_notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(`Failed to update notification: ${error.message}`, 500);
    return data;
  }

  async list(limit = 20, offset = 0): Promise<NotificationRecord[]> {
    const { data, error } = await supabase
      .from('voice_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new AppError(`Failed to list notifications: ${error.message}`, 500);
    return data || [];
  }
}

export const notificationService = new NotificationService();
