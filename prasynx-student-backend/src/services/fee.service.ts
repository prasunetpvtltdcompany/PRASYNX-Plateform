import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class FeeService {
  async getFees(studentId: string) {
    const { data, error } = await supabase.from('student_fees').select('*, payments:fee_payments(*)').eq('student_id', studentId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const feeService = new FeeService();
