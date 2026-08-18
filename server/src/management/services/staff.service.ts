import { supabase } from '../config/database';
import { config } from '../config';
import { BadRequestError } from '../utils/errors';

/**
 * Staff Service
 * 
 * Handles all business logic for staff and teacher management.
 * Functions: createStaff, getStaff, updateStaff, updateStaffStatus
 */
export class StaffService {
  async createStaff(data: any) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 10);
    const staffRole = data.role || 'staff';

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        organisation_id: data.organisation_id,
        full_name: data.full_name,
        email: data.email,
        password_hash: passwordHash,
        role: staffRole,
        status: 'active'
      })
      .select()
      .single();

    if (userError) throw new BadRequestError(userError.message);

    const { data: teacher, error: teacherError } = await supabase
      .from('staff_records')
      .insert({
        organisation_id: data.organisation_id,
        user_id: user.id,
        staff_unique_id: `STAFF-${Date.now()}`,
        full_name: data.full_name,
        subject: data.subject || null,
        phone: data.phone || null,
        status: 'active'
      })
      .select()
      .single();

    if (teacherError) {
      await supabase.from('users').delete().eq('id', user.id);
      throw new BadRequestError(teacherError.message);
    }

    return { user, teacher, credentials: { email: data.email, password: data.password } };
  }

  async getStaff(organisationId: string) {
    const staffRoles = ['teacher', 'admin', 'accountant', 'librarian', 'transport_manager', 'hostel_warden', 'staff', 'driver', 'counsellor'];

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status, created_at')
      .eq('organisation_id', organisationId)
      .in('role', staffRoles);

    if (userError) throw new BadRequestError(userError.message);

    const { data: teacherRows, error: teacherError } = await supabase
      .from('staff_records')
      .select('user_id, staff_unique_id, subject, phone, status')
      .eq('organisation_id', organisationId);

    if (teacherError) throw new BadRequestError(teacherError.message);

    const teacherMap = new Map((teacherRows || []).map(t => [t.user_id, t]));
    return (users || []).map(user => ({
      ...user,
      staff_unique_id: teacherMap.get(user.id)?.staff_unique_id || '',
      subject: teacherMap.get(user.id)?.subject || '',
      phone: teacherMap.get(user.id)?.phone || ''
    }));
  }

  async updateStaff(staffId: string, data: any) {
    const updatePayload: any = {};
    if (data.full_name) updatePayload.full_name = data.full_name;
    if (data.role) updatePayload.role = data.role;
    if (data.status) updatePayload.status = data.status;

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabase.from('users').update(updatePayload).eq('id', staffId);
      if (error) throw new BadRequestError(error.message);
    }

    const teacherPayload: any = {};
    if (data.subject) teacherPayload.subject = data.subject;
    if (data.phone) teacherPayload.phone = data.phone;
    if (data.full_name) teacherPayload.full_name = data.full_name;
    if (data.status) teacherPayload.status = data.status;

    if (Object.keys(teacherPayload).length > 0) {
      const { error } = await supabase.from('staff_records').update(teacherPayload).eq('user_id', staffId);
      if (error) throw new BadRequestError(error.message);
    }

    return { message: 'Staff account updated' };
  }

  async updateStaffStatus(staffId: string, status: string) {
    const { error: userError } = await supabase.from('users').update({ status }).eq('id', staffId);
    if (userError) throw new BadRequestError(userError.message);

    const { error: teacherError } = await supabase.from('staff_records').update({ status }).eq('user_id', staffId);
    if (teacherError) throw new BadRequestError(teacherError.message);

    return { message: 'Staff status updated' };
  }
}

export const staffService = new StaffService();
