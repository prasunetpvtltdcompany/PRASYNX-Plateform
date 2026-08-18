/**
 * Management Service (Legacy — use DashboardService, StaffService, StudentService, ClassService instead)
 * 
 * @deprecated Split into domain-specific services:
 *   - DashboardService  → dashboard.service.ts
 *   - StaffService      → staff.service.ts
 *   - StudentService    → student.service.ts
 *   - ClassService      → class.service.ts
 * 
 * Kept for backward compatibility. New code should import from the individual services.
 */
import crypto from 'crypto';
import { supabase } from '../config/database';
import { config } from '../config';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ManagementService {
  async getDashboardStats(organisationId: string) {
    const [students, staff, classes, announcements] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('organisation_id', organisationId),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('organisation_id', organisationId).eq('role', 'staff'),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('organisation_id', organisationId),
      supabase.from('announcements').select('*').eq('organisation_id', organisationId).order('created_at', { ascending: false }).limit(5)
    ]);

    return {
      stats: {
        totalStudents: students.count || 0,
        totalStaff: staff.count || 0,
        totalClasses: classes.count || 0
      },
      recentAnnouncements: announcements.data || []
    };
  }

  // Student operations
  async createStudent(data: any) {
    const { data: student, error } = await supabase
      .from('students')
      .insert([{ ...data, status: 'active' }])
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return student;
  }

  async getStudents(organisationId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async updateStudent(studentId: string, updates: any) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  // Staff operations
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

  // Class operations
  async createClass(data: any) {
    const { data: cls, error } = await supabase
      .from('classes')
      .insert({ ...data, status: 'active' })
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return cls;
  }

  async getClasses(organisationId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('organisation_id', organisationId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async assignStudentToClass(classId: string, studentId: string) {
    const { data, error } = await supabase
      .from('class_student_map')
      .insert({ class_id: classId, student_id: studentId })
      .select();
    if (error) throw new BadRequestError(error.message);
    return data?.[0];
  }
}

export const managementService = new ManagementService();
