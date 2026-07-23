import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class LeaveService {
  async applyLeave(data: { user_id: string; leave_type: string; start_date: string; end_date: string; reason?: string }) {
    const { user_id, leave_type, start_date, end_date, reason } = data;
    const { data: result, error } = await supabase
      .from('leave_applications')
      .insert({ user_id, leave_type, start_date, end_date, reason: reason || null, status: 'pending' })
      .select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getLeave(userId: string) {
    const { data, error } = await supabase
      .from('leave_applications').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const leaveService = new LeaveService();
