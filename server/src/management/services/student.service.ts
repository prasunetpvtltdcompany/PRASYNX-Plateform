import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

/**
 * Student Service
 * 
 * Handles all business logic for student management.
 * Functions: createStudent, getStudents, updateStudent
 */
export class StudentService {
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
      .select('*, classes:classes!students_class_id_fkey(name), sections:sections!students_section_id_fkey(name)')
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
}

export const studentService = new StudentService();
