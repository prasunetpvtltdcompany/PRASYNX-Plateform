import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AccountantService {
  async getCollections(orgId: string) {
    const { data, error } = await supabase
      .from('fee_payments').select('*, student:students(*)').eq('organisation_id', orgId)
      .order('payment_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const accountantService = new AccountantService();
