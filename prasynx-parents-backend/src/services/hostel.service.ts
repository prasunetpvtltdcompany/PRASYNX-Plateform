import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class HostelService {
  async getHostel(studentId: string) {
    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*, room:hostel_rooms(*)')
      .eq('student_id', studentId)
      .single();
    if (error && error.code !== 'PGRST116') throw new BadRequestError(error.message);
    return data || null;
  }
}
export const hostelService = new HostelService();
