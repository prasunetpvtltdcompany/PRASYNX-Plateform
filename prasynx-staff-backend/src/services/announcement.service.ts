import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AnnouncementService {
  async createAnnouncement(data: { organisation_id: string; title: string; content: string; target_role?: string }) {
    const { organisation_id, title, content, target_role } = data;
    const { data: result, error } = await supabase
      .from('announcements')
      .insert({ organisation_id, title, content, target_role: target_role || null, published_at: new Date().toISOString() })
      .select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getAnnouncements(orgId: string) {
    const { data, error } = await supabase
      .from('announcements').select('*').eq('organisation_id', orgId)
      .order('published_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const announcementService = new AnnouncementService();
