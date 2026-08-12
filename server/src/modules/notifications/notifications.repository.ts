import type { CreateNotificationInput, NotificationDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const COLUMNS =
  'id,organisation_id,user_id,title,message,type,read,reference_type,reference_id,target_role,sent_at,delivered,created_at';

export class NotificationsRepository {
  async listFor(tenantId: string, userId: string, role: string, limit = 50): Promise<NotificationDTO[]> {
    const { data, error } = await db
      .from('notifications')
      .select(COLUMNS)
      .eq('organisation_id', tenantId)
      .or(`user_id.eq.${userId},target_role.eq.${role}`)
      .order('sent_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as unknown as NotificationDTO[]) ?? [];
  }

  async unreadCount(tenantId: string, userId: string, role: string): Promise<number> {
    const { data, error } = await db
      .from('notifications')
      .select('id,read', { count: 'exact', head: true })
      .eq('organisation_id', tenantId)
      .or(`user_id.eq.${userId},target_role.eq.${role}`)
      .eq('read', false);
    if (error) throw error;
    return data?.length ?? 0;
  }

  async findOwned(tenantId: string, userId: string, role: string, id: string): Promise<NotificationDTO | null> {
    const { data, error } = await db
      .from('notifications')
      .select(COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .or(`user_id.eq.${userId},target_role.eq.${role}`)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as NotificationDTO | null) ?? null;
  }

  async markRead(tenantId: string, userId: string, role: string, id: string): Promise<void> {
    const { error } = await db
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .or(`user_id.eq.${userId},target_role.eq.${role}`);
    if (error) throw error;
  }

  async markAllRead(tenantId: string, userId: string, role: string): Promise<void> {
    const { error } = await db
      .from('notifications')
      .update({ read: true })
      .eq('organisation_id', tenantId)
      .eq('read', false)
      .or(`user_id.eq.${userId},target_role.eq.${role}`);
    if (error) throw error;
  }

  async create(tenantId: string, input: CreateNotificationInput): Promise<string> {
    const { data, error } = await db
      .from('notifications')
      .insert({
        organisation_id: tenantId,
        user_id: input.user_id ?? null,
        title: input.title,
        message: input.message ?? null,
        type: input.type ?? 'info',
        read: false,
        reference_type: input.reference_type ?? null,
        reference_id: input.reference_id ?? null,
        target_role: input.target_role ?? null,
        sent_at: new Date().toISOString(),
        delivered: false,
      })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('Notification could not be created');
    return data.id as string;
  }

  async assertOwned(tenantId: string, userId: string, role: string, id: string): Promise<NotificationDTO> {
    const found = await this.findOwned(tenantId, userId, role, id);
    if (!found) throw new NotFoundError('Notification not found');
    return found;
  }
}