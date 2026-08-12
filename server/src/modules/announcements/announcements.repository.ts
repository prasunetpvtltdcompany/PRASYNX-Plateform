import type { AnnouncementDTO, CreateAnnouncementInput, UpdateAnnouncementInput } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const COLUMNS =
  'id,organisation_id,created_by,title,content,target_role,target_class_id,priority,published_at,created_at';

export class AnnouncementsRepository {
  async list(tenantId: string): Promise<AnnouncementDTO[]> {
    const { data, error } = await db
      .from('announcements')
      .select(COLUMNS)
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as AnnouncementDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<AnnouncementDTO | null> {
    const { data, error } = await db
      .from('announcements')
      .select(COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as AnnouncementDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateAnnouncementInput, createdBy: string | undefined): Promise<string> {
    const row = {
      organisation_id: tenantId,
      created_by: createdBy ?? null,
      title: input.title,
      content: input.content ?? null,
      target_role: input.target_role ?? null,
      target_class_id: input.target_class_id ?? null,
      priority: input.priority ?? 'normal',
      published_at: input.publish ? new Date().toISOString() : null,
    };
    const { data, error } = await db.from('announcements').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Announcement could not be created');
    return data.id as string;
  }

  async update(tenantId: string, id: string, input: UpdateAnnouncementInput): Promise<void> {
    const changes: Record<string, unknown> = {};
    if (input.title !== undefined) changes.title = input.title;
    if (input.content !== undefined) changes.content = input.content || null;
    if (input.target_role !== undefined) changes.target_role = input.target_role || null;
    if (input.target_class_id !== undefined) changes.target_class_id = input.target_class_id || null;
    if (input.priority !== undefined) changes.priority = input.priority;
    if (input.publish !== undefined) changes.published_at = input.publish ? new Date().toISOString() : null;
    const { error } = await db.from('announcements').update(changes).eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const { error } = await db.from('announcements').delete().eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<AnnouncementDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Announcement not found in this school');
    return found;
  }
}