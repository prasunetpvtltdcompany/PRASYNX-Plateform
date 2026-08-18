import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ExportService {
  async exportAcademicYears(orgId: string) {
    const { data, error } = await supabase.from('academic_years').select('*').eq('organisation_id', orgId).order('start_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { rows: data || [], columns: [
      { key: 'name', label: 'Name' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'is_current', label: 'Is Current' },
      { key: 'status', label: 'Status' },
    ]};
  }

  async exportSections(orgId: string) {
    const { data, error } = await supabase.from('sections')
      .select('*, class:classes!sections_class_id_fkey(name)').eq('organisation_id', orgId).order('name');
    if (error) throw new BadRequestError(error.message);
    return { rows: (data || []).map((r: any) => ({ ...r, class_name: r.class?.name })), columns: [
      { key: 'name', label: 'Section' },
      { key: 'class_name', label: 'Class' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'room_number', label: 'Room' },
    ]};
  }

  async exportStudents(orgId: string) {
    const { data, error } = await supabase.from('students')
      .select('*, class_student_map!inner(class:classes!class_student_map_class_id_fkey(name))')
      .eq('organisation_id', orgId).order('full_name');
    if (error) throw new BadRequestError(error.message);
    return { rows: (data || []).map((r: any) => ({
      full_name: r.full_name, roll_number: r.roll_number,
      email: r.email, phone: r.phone,
      class_name: r.class_student_map?.class?.name || '',
      student_unique_id: r.student_unique_id, status: r.status,
    })), columns: [
      { key: 'full_name', label: 'Name' },
      { key: 'roll_number', label: 'Roll No' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'class_name', label: 'Class' },
      { key: 'student_unique_id', label: 'Unique ID' },
      { key: 'status', label: 'Status' },
    ]};
  }

  async exportStaff(orgId: string) {
    const { data, error } = await supabase.from('staff_records')
      .select('*').eq('organisation_id', orgId).order('full_name');
    if (error) throw new BadRequestError(error.message);
    return { rows: data || [], columns: [
      { key: 'full_name', label: 'Name' },
      { key: 'staff_unique_id', label: 'Code' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'staff_unique_id', label: 'Unique ID' },
      { key: 'status', label: 'Status' },
    ]};
  }

  async exportHomework(orgId: string) {
    const { data, error } = await supabase.from('homework')
      .select('*, class:class_sections!homework_class_id_fkey(name), subject:subjects(name), teacher:staff_records(full_name)')
      .eq('organisation_id', orgId).order('due_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { rows: (data || []).map((r: any) => ({
      title: r.title, class_name: r.class?.name, subject_name: r.subject?.name,
      teacher_name: r.teacher?.full_name, due_date: r.due_date?.split('T')[0],
      status: r.status, description: r.description,
    })), columns: [
      { key: 'title', label: 'Title' },
      { key: 'class_name', label: 'Class' },
      { key: 'subject_name', label: 'Subject' },
      { key: 'teacher_name', label: 'Teacher' },
      { key: 'due_date', label: 'Due Date' },
      { key: 'status', label: 'Status' },
      { key: 'description', label: 'Description' },
    ]};
  }

  async exportEnrollments(orgId: string) {
    const { data, error } = await supabase.from('class_student_map')
      .select('*, class:classes!class_student_map_class_id_fkey(name), student:students(full_name, roll_number)')
      .eq('organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);
    return { rows: (data || []).map((r: any) => ({
      student_name: r.student?.full_name, roll_number: r.student?.roll_number,
      class_name: r.class?.name, created_at: r.created_at?.split('T')[0],
    })), columns: [
      { key: 'student_name', label: 'Student' },
      { key: 'roll_number', label: 'Roll No' },
      { key: 'class_name', label: 'Class' },
      { key: 'created_at', label: 'Enrolled At' },
    ]};
  }

  async exportPromotions(orgId: string) {
    const { data, error } = await supabase.from('promotion_history')
      .select('*, student:students(full_name, roll_number), from_class:classes!promotion_history_from_class_id_fkey(name), to_class:classes!promotion_history_to_class_id_fkey(name)')
      .eq('organisation_id', orgId).order('promoted_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { rows: (data || []).map((r: any) => ({
      student_name: r.student?.full_name, from_class: r.from_class?.name,
      to_class: r.to_class?.name, promoted_at: r.promoted_at?.split('T')[0],
    })), columns: [
      { key: 'student_name', label: 'Student' },
      { key: 'from_class', label: 'From Class' },
      { key: 'to_class', label: 'To Class' },
      { key: 'promoted_at', label: 'Date' },
    ]};
  }

  async exportCommunicationLogs(orgId: string) {
    const { data, error } = await supabase.from('communication_log')
      .select('*').eq('organisation_id', orgId).order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { rows: data || [], columns: [
      { key: 'created_at', label: 'Time' },
      { key: 'channel', label: 'Channel' },
      { key: 'subject', label: 'Subject' },
      { key: 'message', label: 'Message' },
      { key: 'sender_type', label: 'Sender Type' },
      { key: 'receiver_type', label: 'Receiver Type' },
      { key: 'status', label: 'Status' },
    ]};
  }

  async exportTeacherAssignments(orgId: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map')
      .select('*, class:classes!class_subject_teacher_map_class_id_fkey!inner(id, name, organisation_id), subject:subjects(name), teacher:staff_records(full_name)')
      .eq('class.organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);
    return { rows: (data || []).map((r: any) => ({
      class_name: r.class?.name, subject_name: r.subject?.name,
      teacher_name: r.teacher?.full_name, is_class_teacher: r.is_class_teacher ? 'Yes' : 'No',
    })), columns: [
      { key: 'class_name', label: 'Class' },
      { key: 'subject_name', label: 'Subject' },
      { key: 'teacher_name', label: 'Teacher' },
      { key: 'is_class_teacher', label: 'Class Teacher' },
    ]};
  }

  async exportParents(orgId: string) {
    const { data, error } = await supabase.from('parents')
      .select('*, parent_student_links(student:students(full_name, roll_number))')
      .eq('organisation_id', orgId).order('full_name');
    if (error) throw new BadRequestError(error.message);
    return { rows: (data || []).map((r: any) => ({
      full_name: r.full_name, email: r.email, phone: r.phone,
      children: (r.parent_student_links || []).map((l: any) => l.student?.full_name).join('; '),
      status: r.status,
    })), columns: [
      { key: 'full_name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'children', label: 'Children' },
      { key: 'status', label: 'Status' },
    ]};
  }
}

export const exportService = new ExportService();
