import { supabase } from '../config/database';

export class DashboardService {
  async getDashboard(teacherId: string) {
    const [classMappings, assignments, messages] = await Promise.all([
      supabase.from('class_subject_teacher_map').select('*, class:classes!class_subject_teacher_map_class_id_fkey(*)').eq('teacher_id', teacherId),
      supabase.from('assignments').select('*').eq('teacher_id', teacherId),
      supabase.from('direct_messages').select('*').or(`sender_id.eq.${teacherId},recipient_id.eq.${teacherId}`)
    ]);

    // Derive student count from canonical chain
    let assignedStudents = 0;
    if (classMappings.data && classMappings.data.length > 0) {
      const classIds = [...new Set(classMappings.data.map((m: any) => m.class_id))];
      const { data: studentMappings } = await supabase
        .from('class_student_map')
        .select('student_id')
        .in('class_id', classIds);
      if (studentMappings) {
        assignedStudents = new Set(studentMappings.map((m: any) => m.student_id)).size;
      }
    }

    return {
      assignedStudents,
      classes: classMappings.data || [],
      totalAssignments: assignments.data?.length || 0,
      pendingMessages: messages.data?.filter((m: any) => !m.read_at).length || 0
    };
  }
}
export const dashboardService = new DashboardService();
