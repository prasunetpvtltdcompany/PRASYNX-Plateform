import bcrypt from 'bcryptjs';
import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AdminUserService {
  async getAdminUsers(orgId: string) {
    const { data, error } = await supabase
      .from('users').select('*').eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminUser(data: { full_name: string; email: string; role: string; organisation_id: string; password: string }) {
    const { full_name, email, role, organisation_id, password } = data;
    if (!full_name || !email || !role || !organisation_id || !password) {
      throw new BadRequestError('Required fields: full_name, email, role, organisation_id, password');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: result, error } = await supabase
      .from('users').insert({ full_name, email, role, organisation_id, password_hash: hashedPassword, status: 'active' }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateUserStatus(userId: string, status: string) {
    const { data, error } = await supabase.from('users').update({ status }).eq('id', userId).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }
}
export const adminUserService = new AdminUserService();
