import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AnnouncementService {
  async getAnnouncements(orgId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('organisation_id', orgId)
      .order('published_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const announcementService = new AnnouncementService();
