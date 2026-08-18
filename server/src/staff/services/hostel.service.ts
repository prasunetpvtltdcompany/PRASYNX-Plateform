import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class HostelService {
  async getHostelRooms(orgId: string) {
    const { data, error } = await supabase
      .from('hostel_rooms').select('*').eq('organisation_id', orgId)
      .order('room_number');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const hostelService = new HostelService();
