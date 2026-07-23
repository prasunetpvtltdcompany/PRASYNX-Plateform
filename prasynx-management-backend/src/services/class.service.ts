import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ClassService {
  async getDashboard(orgId: string) {
    const [classesRes, studentsRes, roomsRes] = await Promise.all([
      supabase.from('classes').select('id, status').eq('organisation_id', orgId),
      supabase.from('students').select('id, status').eq('organisation_id', orgId),
      supabase.from('classrooms').select('id, status').eq('organisation_id', orgId),
    ]);
    return {
      totalClasses: (classesRes.data || []).filter((c: any) => c.status === 'active').length,
      totalStudents: (studentsRes.data || []).filter((s: any) => s.status === 'active').length,
      totalRooms: (roomsRes.data || []).filter((r: any) => r.status === 'active').length,
      archivedClasses: (classesRes.data || []).filter((c: any) => c.status === 'archived').length,
    };
  }

  async getClasses(orgId: string) {
    const { data, error } = await supabase.from('classes').select('*').eq('organisation_id', orgId).order('name', { ascending: true });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getClassById(classId: string) {
    const { data, error } = await supabase.from('classes').select('*').eq('id', classId).single();
    if (error) throw new NotFoundError('Class not found');
    return data;
  }

  async createClass(orgId: string, data: any) {
    const { data: cls, error } = await supabase.from('classes').insert({ ...data, organisation_id: orgId, status: 'active' }).select().single();
    if (error) throw new BadRequestError(error.message);
    return cls;
  }

  async updateClass(classId: string, data: any) {
    const { data: cls, error } = await supabase.from('classes').update(data).eq('id', classId).select().single();
    if (error) throw new BadRequestError(error.message);
    return cls;
  }

  async deleteClass(classId: string) {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Class deleted' };
  }

  async archiveClass(classId: string) {
    const { data, error } = await supabase.from('classes').update({ status: 'archived' }).eq('id', classId).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getClassStudents(classId: string) {
    const { data, error } = await supabase.from('class_student_map').select('*, student:students(*)').eq('class_id', classId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async assignStudent(classId: string, studentId: string) {
    const { data, error } = await supabase.from('class_student_map').insert({ class_id: classId, student_id: studentId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async assignStudentsBulk(classId: string, studentIds: string[]) {
    const records = studentIds.map(student_id => ({ class_id: classId, student_id }));
    const { data, error } = await supabase.from('class_student_map').insert(records).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async removeStudent(classId: string, studentId: string) {
    const { error } = await supabase.from('class_student_map').delete().eq('class_id', classId).eq('student_id', studentId);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Student removed from class' };
  }

  async transferStudent(studentId: string, fromClassId: string, toClassId: string) {
    await supabase.from('class_student_map').delete().eq('class_id', fromClassId).eq('student_id', studentId);
    const { data, error } = await supabase.from('class_student_map').insert({ class_id: toClassId, student_id: studentId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async promoteStudents(orgId: string, fromClassId: string, toClassId: string, studentIds: string[]) {
    await supabase.from('class_student_map').delete().eq('class_id', fromClassId).in('student_id', studentIds);
    const records = studentIds.map(student_id => ({ class_id: toClassId, student_id }));
    const { data, error } = await supabase.from('class_student_map').insert(records).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async assignClassTeacher(classId: string, teacherId: string, orgId?: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map').insert({
      class_id: classId, teacher_id: teacherId,
      organisation_id: orgId || (await this.getClassById(classId)).organisation_id
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async assignAssistantTeacher(classId: string, teacherId: string, orgId?: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map').insert({
      class_id: classId, teacher_id: teacherId,
      organisation_id: orgId || (await this.getClassById(classId)).organisation_id
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getRooms(classId: string) {
    const { data, error } = await supabase.from('classrooms').select('*').eq('class_id', classId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async allocateRoom(orgId: string, data: any) {
    const { data: room, error } = await supabase.from('classrooms').insert({ ...data, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return room;
  }

  async updateRoom(roomId: string, data: any) {
    const { data: room, error } = await supabase.from('classrooms').update(data).eq('id', roomId).select().single();
    if (error) throw new BadRequestError(error.message);
    return room;
  }

  async deleteRoom(roomId: string) {
    const { error } = await supabase.from('classrooms').delete().eq('id', roomId);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Room deleted' };
  }

  async getAttendanceTrend(orgId: string, classId: string) {
    const { data, error } = await supabase.from('attendance_records').select('date, status').eq('organisation_id', orgId).eq('class_id', classId).order('date', { ascending: true }).limit(30);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getPerformanceSnapshots(orgId: string, classId: string) {
    const { data, error } = await supabase.from('exam_results').select('*, exam:exams(*)').eq('organisation_id', orgId).eq('class_id', classId).order('created_at', { ascending: false }).limit(10);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getAcademicAnalytics(orgId: string, classId: string) {
    const [studentsRes, examsRes, attendanceRes] = await Promise.all([
      supabase.from('class_student_map').select('student_id').eq('class_id', classId),
      supabase.from('exam_results').select('marks_obtained, total_marks, exam_id').eq('organisation_id', orgId).eq('class_id', classId),
      supabase.from('attendance_records').select('status').eq('organisation_id', orgId).eq('class_id', classId),
    ]);
    const students = studentsRes.data || [];
    const exams = examsRes.data || [];
    const attendance = attendanceRes.data || [];
    const avgMarks = exams.length > 0 ? exams.reduce((s: number, e: any) => s + (e.marks_obtained / e.total_marks) * 100, 0) / exams.length : 0;
    const attendanceRate = attendance.length > 0 ? attendance.filter((a: any) => a.status === 'present').length / attendance.length * 100 : 0;
    return { totalStudents: students.length, averageMarks: Math.round(avgMarks * 100) / 100, attendanceRate: Math.round(attendanceRate * 100) / 100, examCount: exams.length };
  }

  async getAiInsights(orgId: string, classId: string) {
    const analytics = await this.getAcademicAnalytics(orgId, classId);
    const insights: string[] = [];
    if (analytics.averageMarks < 60) insights.push('Class average marks are below 60%. Consider remedial sessions.');
    if (analytics.attendanceRate < 80) insights.push('Attendance rate is below 80%. Investigate causes of absenteeism.');
    if (analytics.totalStudents > 40) insights.push('Class size exceeds 40 students. Consider splitting the class.');
    return { insights, analytics };
  }

  async getUnassignedStudents(orgId: string) {
    const { data: allStudents, error } = await supabase.from('students').select('id').eq('organisation_id', orgId).eq('status', 'active');
    if (error) throw new BadRequestError(error.message);
    const studentIds = (allStudents || []).map((s: any) => s.id);
    if (studentIds.length === 0) return [];
    const { data: mapped } = await supabase.from('class_student_map').select('student_id').in('student_id', studentIds);
    const mappedIds = new Set((mapped || []).map((m: any) => m.student_id));
    const unassignedIds = studentIds.filter(id => !mappedIds.has(id));
    if (unassignedIds.length === 0) return [];
    const { data: unassigned } = await supabase.from('students').select('*').in('id', unassignedIds);
    return unassigned || [];
  }

  async getAvailableTeachers(orgId: string) {
    const { data, error } = await supabase.from('users').select('id, full_name, email').eq('organisation_id', orgId).eq('role', 'teacher').eq('status', 'active');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}

export const classService = new ClassService();
