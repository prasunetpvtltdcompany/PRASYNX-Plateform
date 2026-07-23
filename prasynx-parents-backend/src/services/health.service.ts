import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class HealthService {
  async getHealth(studentId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', studentId)
      .eq('document_type', 'Health Report')
      .order('issued_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { reports: data || [] };
  }
}
export const healthService = new HealthService();
