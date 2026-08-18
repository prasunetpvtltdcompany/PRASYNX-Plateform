import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class CommunicationService {
  // Send a notification (creates in notifications table + logs to communication_log)
  async sendNotification(orgId: string, body: {
    user_id: string; title: string; message: string; type?: string;
    sender_type?: string; sender_id?: string; channel?: string;
  }) {
    const { user_id, title, message, type, sender_type, sender_id, channel } = body;

    const { data: notif, error: notifErr } = await supabase.from('notifications').insert({
      user_id, title, message, type: type || 'info', read: false
    }).select().single();
    if (notifErr) throw new BadRequestError(notifErr.message);

    await supabase.from('communication_log').insert({
      organisation_id: orgId,
      sender_type: sender_type || 'system',
      sender_id: sender_id || '00000000-0000-0000-0000-000000000000',
      receiver_type: 'user',
      receiver_id: user_id,
      subject: title,
      message,
      channel: channel || 'notification',
      status: 'sent',
    });

    return notif;
  }

  // Send bulk notification to a role
  async notifyRole(orgId: string, body: {
    role: string; title: string; message: string; type?: string;
    sender_type?: string; sender_id?: string; channel?: string;
  }) {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('organisation_id', orgId)
      .eq('role', body.role)
      .eq('status', 'active');

    if (!users?.length) return [];

    const notifRows = users.map(u => ({
      user_id: u.id, title: body.title, message: body.message,
      type: body.type || 'info', read: false
    }));
    const { data: notifs, error: notifErr } = await supabase.from('notifications').insert(notifRows).select();
    if (notifErr) throw new BadRequestError(notifErr.message);

    const logRows = users.map(u => ({
      organisation_id: orgId,
      sender_type: body.sender_type || 'system',
      sender_id: body.sender_id || '00000000-0000-0000-0000-000000000000',
      receiver_type: 'role',
      receiver_id: u.id,
      subject: body.title,
      message: body.message,
      channel: body.channel || 'notification',
      status: 'sent',
    }));
    await supabase.from('communication_log').insert(logRows);

    return notifs || [];
  }

  // Send announcement
  async sendAnnouncement(orgId: string, body: {
    title: string; content: string; target_role?: string; target_class_id?: string;
    sender_type?: string; sender_id?: string;
  }) {
    const { data: announcement, error } = await supabase.from('announcements').insert({
      organisation_id: orgId,
      title: body.title,
      content: body.content,
      target_role: body.target_role,
      target_class_id: body.target_class_id,
      created_by: body.sender_id,
    }).select().single();
    if (error) throw new BadRequestError(error.message);

    await supabase.from('communication_log').insert({
      organisation_id: orgId,
      sender_type: body.sender_type || 'management',
      sender_id: body.sender_id || '00000000-0000-0000-0000-000000000000',
      receiver_type: body.target_role || 'all',
      subject: body.title,
      message: body.content,
      channel: 'announcement',
      status: 'sent',
    });

    return announcement;
  }

  // Get communication logs
  async getLogs(orgId: string) {
    const { data, error } = await supabase.from('communication_log')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  // Get communication stats
  async getStats(orgId: string) {
    const { data, error } = await supabase.from('communication_log')
      .select('channel, status', { count: 'exact' })
      .eq('organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);

    const total = (data || []).length;
    const byChannel: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const r of data || []) {
      byChannel[r.channel] = (byChannel[r.channel] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }
    return { total, byChannel, byStatus };
  }

  // Get all pending comms to send
  async getPending(orgId: string) {
    const { data, error } = await supabase.from('communication_log')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}

export const communicationService = new CommunicationService();
