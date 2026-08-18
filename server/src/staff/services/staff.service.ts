/**
 * @deprecated This monolithic service is being split into domain-specific services.
 * Use dashboard.service.ts, student.service.ts, class.service.ts, timetable.service.ts,
 * qr-attendance.service.ts, attendance.service.ts, grade.service.ts, assignment.service.ts,
 * exam.service.ts, message.service.ts, leave.service.ts, announcement.service.ts,
 * admin-user.service.ts, admin-fee.service.ts, librarian.service.ts, transport.service.ts,
 * hostel.service.ts, accountant.service.ts instead.
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class StaffService {
  // Dashboard
  async getDashboard(teacherId: string) {
    const [classMappings, assignments, messages] = await Promise.all([
      supabase.from('class_subject_teacher_map').select('*, class:classes!class_subject_teacher_map_class_id_fkey(*)').eq('teacher_id', teacherId),
      supabase.from('assignments').select('*').eq('teacher_id', teacherId),
      supabase.from('direct_messages').select('*').or(`sender_id.eq.${teacherId},recipient_id.eq.${teacherId}`)
    ]);

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

  // Students - derived from canonical chain
  async getStudents(teacherId: string) {
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

  // Classes
  async getClasses(teacherId: string) {
    const { data, error } = await supabase
      .from('class_subject_teacher_map')
      .select('*, class:classes!class_subject_teacher_map_class_id_fkey(*), subject:subjects(*)')
      .eq('teacher_id', teacherId);

    if (error) throw new BadRequestError(error.message);
    return (data || []).map((m: any) => ({
      ...m,
      class_name: m.class?.name || 'Unknown',
      subject_name: m.subject?.name || ''
    }));
  }

  // Timetable
  async getTimetable(teacherId: string) {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, class:classes!timetable_entries_class_id_fkey(*), subject:subjects(*)')
      .eq('teacher_id', teacherId)
      .order('day_of_week');

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  // QR Attendance
  async generateQR(body: { teacher_id: string; class_id?: string; subject?: string; period?: string; org_id: string }) {
    const { teacher_id, class_id, subject, period, org_id } = body;

    if (!teacher_id || !org_id) {
      throw new BadRequestError('Required fields: teacher_id, org_id');
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: session, error: insertError } = await supabase
      .from('qr_sessions')
      .insert({
        teacher_id,
        class_id: class_id || null,
        subject: subject || null,
        period: period || null,
        token,
        expires_at: expiresAt,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw new BadRequestError(insertError.message);

    const qrData = JSON.stringify({ token, teacher_id, class_id: class_id || null, subject: subject || null, period: period || null, org_id });
    const qrDataUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 2, color: { dark: '#1e40af', light: '#ffffff' } });

    return { session, qrDataUrl, expires_at: expiresAt, token };
  }

  async getScanCount(token: string) {
    const { data: session, error } = await supabase
      .from('qr_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !session) {
      throw new NotFoundError('QR session not found');
    }

    if (new Date(session.expires_at) < new Date()) {
      return { count: 0 };
    }

    const { count, error: countError } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('attendance_date', new Date().toISOString().slice(0, 10))
      .eq('teacher_id', session.teacher_id);

    if (countError) throw new BadRequestError(countError.message);
    return { count: count || 0 };
  }

  private async getStudentMeta(studentId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('organisation_id, class_id, section_id')
      .eq('id', studentId)
      .maybeSingle();
    if (error || !data) throw new BadRequestError('Student not found: ' + studentId);
    return data;
  }

  // Attendance
  async markAttendance(data: { teacher_id: string; student_id: string; date: string; status: string; notes?: string }) {
    const { teacher_id, student_id, date, status, notes } = data;

    if (!teacher_id || !student_id || !date || !status) {
      throw new BadRequestError('Required fields: teacher_id, student_id, date, status');
    }

    const meta = await this.getStudentMeta(student_id);

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('student_id', student_id)
      .eq('attendance_date', date)
      .is('subject_id', null)
      .maybeSingle();

    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    let result: any;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('attendance_records')
        .update({
          attendance_status: capitalizedStatus,
          remarks: notes || null,
          teacher_id
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new BadRequestError(error.message);
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('attendance_records')
        .insert({
          organisation_id: meta.organisation_id,
          student_id,
          class_id: meta.class_id,
          section_id: meta.section_id,
          teacher_id,
          attendance_date: date,
          attendance_status: capitalizedStatus,
          remarks: notes || null
        })
        .select()
        .single();
      if (error) throw new BadRequestError(error.message);
      result = inserted;
    }

    // Notify parents of attendance
    try {
      const { data: student } = await supabase.from('students').select('organisation_id, full_name').eq('id', student_id).single();
      if (student) {
        const { data: parents } = await supabase
          .from('parent_student_links')
          .select('parent_id')
          .eq('student_id', student_id);

        if (parents && parents.length > 0) {
          const notifications = parents.map((p: any) => ({
            user_id: p.parent_id,
            title: `Attendance Marked - ${student.full_name}`,
            message: `${student.full_name} was marked "${status}" on ${date}.`,
            type: status === 'absent' ? 'warning' : 'info',
            read: false,
          }));
          await supabase.from('notifications').insert(notifications);
        }
      }
    } catch (e) {
      console.error('[Attendance] Failed to notify parents:', e);
    }

    const mappedResult = {
      id: result.id,
      student_id: result.student_id,
      teacher_id: result.teacher_id,
      date: result.attendance_date,
      status: result.attendance_status.toLowerCase(),
      notes: result.remarks,
      created_at: result.created_at,
      organisation_id: result.organisation_id
    };

    return { attendance: mappedResult };
  }

  async bulkAttendance(data: { teacher_id: string; class_id: string; date: string; attendance_records: any[] }) {
    const { teacher_id, class_id, date, attendance_records } = data;

    if (!teacher_id || !class_id || !date || !attendance_records) {
      throw new BadRequestError('Required fields: teacher_id, class_id, date, attendance_records');
    }

    const results = [];
    for (const record of attendance_records) {
      const meta = await this.getStudentMeta(record.student_id);
      const capitalizedStatus = record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase();

      const { data: existing } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', record.student_id)
        .eq('attendance_date', date)
        .is('subject_id', null)
        .maybeSingle();

      let result: any;
      if (existing) {
        const { data: updated, error } = await supabase
          .from('attendance_records')
          .update({
            attendance_status: capitalizedStatus,
            remarks: record.notes || null,
            teacher_id
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw new BadRequestError(error.message);
        result = updated;
      } else {
        const { data: inserted, error } = await supabase
          .from('attendance_records')
          .insert({
            organisation_id: meta.organisation_id,
            student_id: record.student_id,
            class_id: meta.class_id,
            section_id: meta.section_id,
            teacher_id,
            attendance_date: date,
            attendance_status: capitalizedStatus,
            remarks: record.notes || null
          })
          .select()
          .single();
        if (error) throw new BadRequestError(error.message);
        result = inserted;
      }

      results.push({
        id: result.id,
        student_id: result.student_id,
        teacher_id: result.teacher_id,
        date: result.attendance_date,
        status: result.attendance_status.toLowerCase(),
        notes: result.remarks,
        created_at: result.created_at,
        organisation_id: result.organisation_id
      });
    }

    return { attendance: results };
  }

  async getAttendance(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });

    if (error) throw new BadRequestError(error.message);

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      teacher_id: r.teacher_id,
      date: r.attendance_date,
      status: r.attendance_status ? r.attendance_status.toLowerCase() : 'present',
      notes: r.remarks,
      created_at: r.created_at,
      organisation_id: r.organisation_id
    }));

    return { attendance: mapped };
  }

  async getAttendanceReport(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw new BadRequestError(error.message);

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      teacher_id: r.teacher_id,
      date: r.attendance_date,
      status: r.attendance_status ? r.attendance_status.toLowerCase() : 'present',
      notes: r.remarks,
      created_at: r.created_at,
      organisation_id: r.organisation_id
    }));

    const total = mapped.length;
    const present = mapped.filter((a: any) => a.status === 'present').length;
    const absent = mapped.filter((a: any) => a.status === 'absent').length;
    const late = mapped.filter((a: any) => a.status === 'late').length;

    return { total, present, absent, late, percentage: total > 0 ? Math.round((present / total) * 100) : 0, records: mapped };
  }

  // Grades
  async addGrade(data: { teacher_id: string; student_id: string; subject: string; grade: string; semester?: string; notes?: string }) {
    const { teacher_id, student_id, subject, grade, semester, notes } = data;

    if (!teacher_id || !student_id || !subject || !grade) {
      throw new BadRequestError('Required fields: teacher_id, student_id, subject, grade');
    }

    const { data: result, error } = await supabase
      .from('grades')
      .insert({ teacher_id, student_id, subject, grade, semester: semester || 'current', notes: notes || null })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return { grade: result };
  }

  async getGrades(studentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return { grades: data || [] };
  }

  // Assignments
  async createAssignment(data: { teacher_id: string; subject_id?: string; class_id?: string; title: string; description?: string; due_date: string }) {
    const { teacher_id, subject_id, class_id, title, description, due_date } = data;

    if (!teacher_id || !title || !due_date) {
      throw new BadRequestError('Required fields: teacher_id, title, due_date');
    }

    const { data: result, error } = await supabase
      .from('assignments')
      .insert({ teacher_id, subject_id: subject_id || null, class_id: class_id || null, title, description: description || null, due_date, status: 'active' })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);

    // Notify students and parents
    try {
      if (class_id) {
        const { data: classStudents } = await supabase
          .from('class_student_map')
          .select('student_id')
          .eq('class_id', class_id);

        if (classStudents && classStudents.length > 0) {
          const { data: students } = await supabase
            .from('students')
            .select('id, organisation_id')
            .in('id', classStudents.map((s: any) => s.student_id));

          if (students && students.length > 0) {
            const { data: studentUsers } = await supabase
              .from('users')
              .select('id')
              .in('id', students.map((s: any) => s.id))
              .eq('status', 'active');

            if (studentUsers && studentUsers.length > 0) {
              const notifs = studentUsers.map((u: any) => ({
                user_id: u.id,
                title: 'New Assignment',
                message: `New assignment: "${title}" — Due: ${due_date}`,
                type: 'info',
                read: false,
              }));
              await supabase.from('notifications').insert(notifs);
            }
          }
        }
      }
    } catch (e) {
      console.error('[Assignment] Failed to notify:', e);
    }

    return result;
  }

  async getAssignments(teacherId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, submissions:assignment_submissions(*)')
      .eq('teacher_id', teacherId)
      .order('due_date', { ascending: true });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getSubmissions(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*, student:students(*)')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async gradeSubmission(submissionId: string, grade: string, feedback?: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({ grade, feedback })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);

    try {
      const { data: submission } = await supabase
        .from('assignment_submissions')
        .select('student_id, assignment:assignments(title)')
        .eq('id', submissionId)
        .single();

      if (submission) {
        const { data: student } = await supabase
          .from('students')
          .select('organisation_id')
          .eq('id', submission.student_id)
          .single();

        if (student) {
          await supabase.from('notifications').insert({
            user_id: submission.student_id,
            title: 'Assignment Graded',
            message: `Your assignment "${(submission.assignment as any)?.title}" has been graded: ${grade}.`,
            type: 'success',
            read: false,
          });
        }
      }
    } catch (e) {
      console.error('[Grade] Failed to notify:', e);
    }

    return data;
  }

  // Exams
  async createExam(data: { organisation_id: string; name: string; exam_type: string; start_date?: string; end_date?: string }) {
    const { organisation_id, name, exam_type, start_date, end_date } = data;

    if (!organisation_id || !name || !exam_type) {
      throw new BadRequestError('Required fields: organisation_id, name, exam_type');
    }

    const { data: result, error } = await supabase
      .from('exams')
      .insert({ organisation_id, name, exam_type, start_date: start_date || null, end_date: end_date || null, status: 'draft' })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async addExamQuestion(data: { exam_id: string; subject_id?: string; question_type: string; question_text: string; options?: any; correct_answer?: string; marks?: number }) {
    const { exam_id, subject_id, question_type, question_text, options, correct_answer, marks } = data;

    const { data: result, error } = await supabase
      .from('exam_questions')
      .insert({
        exam_id, subject_id: subject_id || null, question_type, question_text,
        option_a: options?.a || null, option_b: options?.b || null,
        option_c: options?.c || null, option_d: options?.d || null,
        correct_answer: correct_answer || null, marks: marks || 1
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getExams(organisationId: string) {
    const { data, error } = await supabase
      .from('exams')
      .select('*, questions:exam_questions(*)')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async updateExamStatus(id: string, status: string) {
    const { data, error } = await supabase.from('exams').update({ status }).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async deleteExamQuestion(id: string) {
    const { error } = await supabase.from('exam_questions').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async getExamSubmissions(examId: string) {
    const { data, error } = await supabase
      .from('exam_submissions')
      .select('*, student:students(full_name, roll_number)')
      .eq('exam_id', examId)
      .order('submission_time', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async gradeExamSubmission(id: string, marks_obtained: number, feedback?: string) {
    const { data, error } = await supabase
      .from('exam_submissions')
      .update({ marks_obtained, feedback: feedback || null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return data;
  }

  // Messages
  async sendMessage(data: { sender_id: string; recipient_id: string; message: string; file_url?: string }) {
    const { sender_id, recipient_id, message, file_url } = data;

    if (!sender_id || !recipient_id || !message) {
      throw new BadRequestError('Required fields: sender_id, recipient_id, message');
    }

    const { data: result, error } = await supabase
      .from('direct_messages')
      .insert({ sender_id, recipient_id, message, file_url: file_url || null })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getMessages(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async markMessageRead(id: string) {
    const { data, error } = await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null);

    if (error) throw new BadRequestError(error.message);
    return { count: count || 0 };
  }

  // Leave
  async applyLeave(data: { user_id: string; leave_type: string; start_date: string; end_date: string; reason?: string }) {
    const { user_id, leave_type, start_date, end_date, reason } = data;

    const { data: result, error } = await supabase
      .from('leave_applications')
      .insert({ user_id, leave_type, start_date, end_date, reason: reason || null, status: 'pending' })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getLeave(userId: string) {
    const { data, error } = await supabase
      .from('leave_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  // Announcements
  async createAnnouncement(data: { organisation_id: string; title: string; content: string; target_role?: string }) {
    const { organisation_id, title, content, target_role } = data;

    const { data: result, error } = await supabase
      .from('announcements')
      .insert({ organisation_id, title, content, target_role: target_role || null, published_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getAnnouncements(orgId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('organisation_id', orgId)
      .order('published_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  // Admin: Users
  async getAdminUsers(orgId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organisation_id', orgId)
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
      .from('users')
      .insert({ full_name, email, role, organisation_id, password_hash: hashedPassword, status: 'active' })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateUserStatus(userId: string, status: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return data;
  }

  // Admin: Classes
  async getAdminClasses(orgId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('organisation_id', orgId)
      .order('name');

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminClass(data: { organisation_id: string; class_name: string; section?: string }) {
    const { data: result, error } = await supabase
      .from('classes')
      .insert({ organisation_id: data.organisation_id, name: data.class_name })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  // Admin: Timetable
  async getAdminTimetable(orgId: string) {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, class:classes!timetable_entries_class_id_fkey(*), subject:subjects(*), teacher:staff_records(*)')
      .eq('organisation_id', orgId)
      .order('day_of_week');

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminTimetable(data: { organisation_id: string; class_id: string; subject_id: string; teacher_id: string; day_of_week: number; start_time: string; end_time: string }) {
    const { data: result, error } = await supabase
      .from('timetable_entries')
      .insert(data)
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  // Admin: Fees
  async getAdminFees(orgId: string) {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('organisation_id', orgId)
      .order('due_date');

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminFee(data: { organisation_id: string; student_id: string; fee_type: string; amount: number; due_date: string }) {
    const { data: result, error } = await supabase
      .from('fees')
      .insert({ ...data, status: 'pending' })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  // Librarian
  async getBooks(orgId: string) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('organisation_id', orgId)
      .order('title');

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async addBook(data: { organisation_id: string; title: string; author: string; isbn?: string; copies?: number }) {
    const copies = data.copies || 1;
    const { data: result, error } = await supabase
      .from('books')
      .insert({ organisation_id: data.organisation_id, title: data.title, author: data.author, isbn: data.isbn || null, total_copies: copies, available_copies: copies })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async issueBook(data: { book_id: string; student_id: string; issued_by: string }) {
    const { data: result, error } = await supabase
      .from('book_issues')
      .insert({
        book_id: data.book_id, student_id: data.student_id, issued_by: data.issued_by,
        issue_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'issued'
      })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);

    await supabase.rpc('decrement_available_copies', { book_id: data.book_id });
    return result;
  }

  // Transport
  async getTransportRoutes(orgId: string) {
    const { data, error } = await supabase
      .from('transport_routes')
      .select('*')
      .eq('organisation_id', orgId)
      .order('route_name');

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createTransportRoute(data: { organisation_id: string; route_name: string; stops?: string[] }) {
    const { data: result, error } = await supabase
      .from('transport_routes')
      .insert({ organisation_id: data.organisation_id, route_name: data.route_name, stops: data.stops || [] })
      .select()
      .single();

    if (error) throw new BadRequestError(error.message);
    return result;
  }

  // Hostel
  async getHostelRooms(orgId: string) {
    const { data, error } = await supabase
      .from('hostel_rooms')
      .select('*')
      .eq('organisation_id', orgId)
      .order('room_number');

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  // Accountant
  async getCollections(orgId: string) {
    const { data, error } = await supabase
      .from('fee_payments')
      .select('*, student:students(*)')
      .eq('organisation_id', orgId)
      .order('payment_date', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}

export const staffService = new StaffService();
