import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { PaginationParams } from '../utils/pagination';

export class AcademicService {
  // ── Academic Years ────────────────────────────────────────
  async getAcademicYears(orgId: string, pagination?: PaginationParams) {
    let query = supabase.from('academic_years').select('*', { count: 'exact' }).eq('organisation_id', orgId).order('start_date', { ascending: false });
    if (pagination) query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
    const { data, error, count } = await query;
    if (error) throw new BadRequestError(error.message);
    return { data: data || [], total: count };
  }

  async getAcademicYearById(id: string) {
    const { data, error } = await supabase.from('academic_years').select('*').eq('id', id).single();
    if (error) throw new NotFoundError('Academic year not found');
    return data;
  }

  async createAcademicYear(orgId: string, body: any) {
    const { data, error } = await supabase.from('academic_years').insert({ ...body, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async updateAcademicYear(id: string, body: any) {
    const { data, error } = await supabase.from('academic_years').update(body).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async deleteAcademicYear(id: string) {
    const { error } = await supabase.from('academic_years').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Academic year deleted' };
  }

  async setActiveAcademicYear(orgId: string, id: string) {
    const { data: year, error: fetchError } = await supabase.from('academic_years').select('*').eq('id', id).eq('organisation_id', orgId).single();
    if (fetchError) throw new NotFoundError('Academic year not found');
    const { error: resetError } = await supabase.from('academic_years').update({ is_current: false }).eq('organisation_id', orgId).neq('id', id);
    if (resetError) throw new BadRequestError(resetError.message);
    const { data, error } = await supabase.from('academic_years').update({ is_current: true }).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  // ── Sections ─────────────────────────────────────────────
  async getSections(orgId: string, pagination?: PaginationParams) {
    let query = supabase.from('sections').select('*, class:classes!sections_class_id_fkey(name)', { count: 'exact' }).eq('organisation_id', orgId).order('name');
    if (pagination) query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
    const { data, error, count } = await query;
    if (error) throw new BadRequestError(error.message);
    return { data: data || [], total: count };
  }

  async getSectionById(id: string) {
    const { data, error } = await supabase.from('sections').select('*, class:classes!sections_class_id_fkey(name)').eq('id', id).single();
    if (error) throw new NotFoundError('Section not found');
    return data;
  }

  async createSection(orgId: string, body: any) {
    const { class_id, ...sectionData } = body;
    const { data, error } = await supabase.from('sections').insert({ ...sectionData, class_id: class_id || sectionData.class_id, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async updateSection(id: string, body: any) {
    const { data, error } = await supabase.from('sections').update(body).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async deleteSection(id: string) {
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Section deleted' };
  }

  // ── Class-Subject Assignments (class_subjects) ──────────
  async getClassSubjects(orgId: string, pagination?: PaginationParams) {
    let query = supabase.from('class_subjects').select('*, class:class_sections!class_subjects_class_id_fkey(name), subject:subjects(name)', { count: 'exact' }).eq('organisation_id', orgId);
    if (pagination) query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
    const { data, error, count } = await query;
    if (error) throw new BadRequestError(error.message);
    return { data: data || [], total: count };
  }

  async getClassSubjectById(id: string) {
    const { data, error } = await supabase.from('class_subjects').select('*, class:class_sections!class_subjects_class_id_fkey(name), subject:subjects(name)').eq('id', id).single();
    if (error) throw new NotFoundError('Class-subject assignment not found');
    return data;
  }

  async createClassSubject(orgId: string, body: any) {
    const { data, error } = await supabase.from('class_subjects').insert({ ...body, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async updateClassSubject(id: string, body: any) {
    const { data, error } = await supabase.from('class_subjects').update(body).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async deleteClassSubject(id: string) {
    const { error } = await supabase.from('class_subjects').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Class-subject assignment deleted' };
  }

  // ── Teacher Assignments (class_subject_teacher_map) ─────
  async getTeacherAssignments(orgId: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map')
      .select('*, class:classes!class_subject_teacher_map_class_id_fkey!inner(id, name, organisation_id), subject:subjects(name), teacher:staff_records(full_name, staff_unique_id)')
      .eq('class.organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getTeacherAssignmentById(id: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map')
      .select('*, class:classes!class_subject_teacher_map_class_id_fkey(name), subject:subjects(name), teacher:staff_records(full_name, staff_unique_id)')
      .eq('id', id).single();
    if (error) throw new NotFoundError('Teacher assignment not found');
    return data;
  }

  async createTeacherAssignment(orgId: string, body: any) {
    const { class_id, subject_id, teacher_id, is_class_teacher, section_id } = body;
    const { data, error } = await supabase.from('class_subject_teacher_map').insert({
      class_id, subject_id, teacher_id: teacher_id || null, is_class_teacher: is_class_teacher || false,
      organisation_id: orgId, section_id: section_id || null
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async updateTeacherAssignment(id: string, body: any) {
    const { data, error } = await supabase.from('class_subject_teacher_map').update(body).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async deleteTeacherAssignment(id: string) {
    const { error } = await supabase.from('class_subject_teacher_map').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Teacher assignment deleted' };
  }

  // ── Class Teacher ───────────────────────────────────────
  async getClassTeachers(orgId: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map')
      .select('*, class:classes!class_subject_teacher_map_class_id_fkey!inner(id, name, organisation_id), teacher:staff_records(full_name, staff_unique_id)')
      .eq('class.organisation_id', orgId).eq('is_class_teacher', true);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async assignClassTeacher(orgId: string, body: any) {
    const { class_id, teacher_id } = body;
    await supabase.from('class_subject_teacher_map').update({ is_class_teacher: false }).eq('class_id', class_id).eq('is_class_teacher', true);
    const existing = await supabase.from('class_subject_teacher_map')
      .select('id').eq('class_id', class_id).eq('teacher_id', teacher_id).maybeSingle();
    if (existing.data) {
      const { data, error } = await supabase.from('class_subject_teacher_map').update({ is_class_teacher: true }).eq('id', existing.data.id).select().single();
      if (error) throw new BadRequestError(error.message);
      return data;
    }
    const { data, error } = await supabase.from('class_subject_teacher_map').insert({
      class_id, teacher_id, is_class_teacher: true, organisation_id: orgId
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async removeClassTeacher(orgId: string, classId: string) {
    const { error } = await supabase.from('class_subject_teacher_map').update({ is_class_teacher: false }).eq('class_id', classId).eq('is_class_teacher', true);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Class teacher removed' };
  }

  // ── Student Enrollment (class_student_map) ──────────────
  async getEnrollments(orgId: string) {
    const { data, error } = await supabase.from('class_student_map')
      .select('*, class:classes!class_student_map_class_id_fkey(name), student:students(full_name, roll_number)')
      .eq('organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getClassEnrollments(classId: string) {
    const { data, error } = await supabase.from('class_student_map')
      .select('*, student:students(full_name, roll_number, student_unique_id)')
      .eq('class_id', classId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async enrollStudent(orgId: string, body: any) {
    const { data, error } = await supabase.from('class_student_map').insert({ ...body, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async enrollStudentsBulk(orgId: string, body: any) {
    const { class_id, student_ids } = body;
    if (!class_id || !student_ids?.length) throw new BadRequestError('class_id and student_ids[] required');
    const records = student_ids.map((student_id: string) => ({ class_id, student_id, organisation_id: orgId }));
    const { data, error } = await supabase.from('class_student_map').insert(records).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async removeEnrollment(classId: string, studentId: string) {
    const { error } = await supabase.from('class_student_map').delete().eq('class_id', classId).eq('student_id', studentId);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Student removed from class' };
  }
}

export const academicService = new AcademicService();
