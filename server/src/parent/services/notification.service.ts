import { supabase } from '../config/database';

export class NotificationService {
  async create(userId: string, title: string, message: string, type: string = 'info'): Promise<void> {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type, read: false });
  }

  async createBulk(userIds: string[], title: string, message: string, type: string = 'info'): Promise<void> {
    if (userIds.length === 0) return;
    const rows = userIds.map(uid => ({ user_id: uid, title, message, type, read: false }));
    await supabase.from('notifications').insert(rows);
  }

  async getNotifications(userId: string, options?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<{ data: any[]; total: number; unread: number }> {
    let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false });

    if (options?.unreadOnly) query = query.eq('read', false);
    if (options?.limit) query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);

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
