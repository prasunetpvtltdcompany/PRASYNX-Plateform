import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class TransportService {
  async getTransport(studentId: string) {
    const { data, error } = await supabase
      .from('transport_assignments')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error && error.code !== 'PGRST116') throw new BadRequestError(error.message);
    return data || null;
  }
}
export const transportService = new TransportService();
