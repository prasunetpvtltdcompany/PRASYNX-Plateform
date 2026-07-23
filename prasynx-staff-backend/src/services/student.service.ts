import { supabase } from '../config/database';

export class StudentService {
  async getStudents(teacherId: string) {
    // Derive teacher→students from canonical chain:
    // teacher → class_subject_teacher_map → class_student_map → student
    const { data: classMappings } = await supabase
      .from('class_subject_teacher_map')
      .select('class_id')
      .eq('teacher_id', teacherId);

    if (!classMappings || classMappings.length === 0) return [];

    const classIds = [...new Set(classMappings.map(m => m.class_id))];
    const { data: studentMappings } = await supabase
      .from('class_student_map')
      .select('student_id')
      .in('class_id', classIds);

    if (!studentMappings || studentMappings.length === 0) return [];

    const studentIds = [...new Set(studentMappings.map(m => m.student_id))];
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds);

    return students || [];
  }
}
export const studentService = new StudentService();
