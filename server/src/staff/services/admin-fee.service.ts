import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AdminFeeService {
  async getAdminFees(orgId: string) {
    const { data, error } = await supabase
      .from('fees').select('*').eq('organisation_id', orgId)
      .order('due_date');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminFee(data: { organisation_id: string; student_id: string; fee_type: string; amount: number; due_date: string }) {
    const { data: result, error } = await supabase
      .from('fees').insert({ ...data, status: 'pending' }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }
}
export const adminFeeService = new AdminFeeService();
