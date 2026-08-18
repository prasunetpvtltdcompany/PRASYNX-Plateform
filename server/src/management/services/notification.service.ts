import { supabase } from '../config/database';

async function logCommunication(orgId: string | null, senderType: string, senderId: string, receiverType: string, receiverId: string | null, subject: string, message: string, channel: string) {
  if (!orgId) return;
  try {
    await supabase.from('communication_log').insert({
      organisation_id: orgId, sender_type: senderType,
      sender_id: senderId || '00000000-0000-0000-0000-000000000000',
      receiver_type: receiverType, receiver_id: receiverId,
      subject, message, channel, status: 'sent',
    });
  } catch { /* silent fail — comm_log is non-critical */ }
}

export class NotificationService {
  async create(userId: string, title: string, message: string, type: string = 'info', orgId?: string): Promise<void> {
    const { data } = await supabase.from('notifications').insert({ user_id: userId, title, message, type, read: false }).select('id').single();
    if (data && orgId) {
      await logCommunication(orgId, 'system', '', 'user', userId, title, message, 'notification');
    }
  }

  async createBulk(userIds: string[], title: string, message: string, type: string = 'info', orgId?: string): Promise<void> {
    if (userIds.length === 0) return;
    const rows = userIds.map(uid => ({ user_id: uid, title, message, type, read: false }));
    await supabase.from('notifications').insert(rows);
    if (orgId) {
      for (const uid of userIds) {
        await logCommunication(orgId, 'system', '', 'user', uid, title, message, 'notification');
      }
    }
  }

  async notifyRole(orgId: string, role: string, title: string, message: string, type?: string): Promise<void> {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('organisation_id', orgId)
      .eq('role', role)
      .eq('status', 'active');

    if (users && users.length > 0) {
      await this.createBulk(users.map(u => u.id), title, message, type, orgId);
    }
  }

  async notifyUser(userId: string, title: string, message: string, type?: string, orgId?: string): Promise<void> {
    await this.create(userId, title, message, type, orgId);
  }

  async getNotifications(userId: string, options?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<{ data: any[]; total: number; unread: number }> {
    let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('read', false);
    }
    if (options?.limit) {
      query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
    }

    const { data, count, error } = await query;

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { data: data || [], total: count || 0, unread: unreadCount || 0 };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId).eq('user_id', userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  }
}

export const notificationService = new NotificationService();
