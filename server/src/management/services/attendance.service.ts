import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

const STATUSES = ['present', 'absent', 'late', 'half_day', 'medical_leave', 'approved_leave'];

export class AttendanceService {
  async getDashboard(orgId: string, date?: string) {
    const today = date || new Date().toISOString().split('T')[0];
    const [studentsRes, todayRes, monthRes, riskRes, settingsRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact' }).eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('attendance_records').select('status, student_id').eq('organisation_id', orgId).eq('date', today),
      supabase.from('attendance_records').select('status, date').eq('organisation_id', orgId).gte('date', this.getMonthStart(today)).lte('date', today),
      supabase.from('attendance_risk_flags').select('*', { count: 'exact' }).eq('organisation_id', orgId).eq('action_taken', false),
      supabase.from('attendance_settings').select('*').eq('organisation_id', orgId).order('created_at', { ascending: false }).limit(1),
    ]);

    const totalStudents = studentsRes.count || 0;
    const todayRecords = todayRes.data || [];
    const monthRecords = monthRes.data || [];
    const riskFlags = riskRes.data || [];
    const settings = settingsRes.data?.[0] || {};

    const present = todayRecords.filter(r => r.status === 'present').length;
    const absent = todayRecords.filter(r => r.status === 'absent').length;
    const late = todayRecords.filter(r => r.status === 'late').length;
    const halfDay = todayRecords.filter(r => r.status === 'half_day').length;
    const medical = todayRecords.filter(r => r.status === 'medical_leave').length;
    const approved = todayRecords.filter(r => r.status === 'approved_leave').length;
    const marked = todayRecords.length;

    const monthPresent = monthRecords.filter(r => r.status === 'present').length;
    const monthTotal = monthRecords.length;
    const monthlyPct = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

    const markedStudents = new Set(todayRecords.map(r => r.student_id));
    const unmarked = totalStudents - markedStudents.size;

    const prevMonthStart = this.getPrevMonthStart(today);
    const { data: prevMonthData } = await supabase.from('attendance_records').select('status')
      .eq('organisation_id', orgId).gte('date', prevMonthStart).lt('date', this.getMonthStart(today));
    const prevTotal = prevMonthData?.length || 0;
    const prevPresent = prevMonthData?.filter(r => r.status === 'present').length || 0;
    const prevPct = prevTotal > 0 ? Math.round((prevPresent / prevTotal) * 100) : 0;
    const trend = prevPct > 0 ? ((monthlyPct - prevPct) / prevPct * 100).toFixed(1) : '0';

    const atRisk = riskFlags.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length;

    const complianceScore = this.computeCompliance(totalStudents, present, absent, late, halfDay, unmarked);

    return {
      summary: {
        totalStudents,
        presentToday: present,
        absentToday: absent,
        lateToday: late,
        halfDayToday: halfDay,
        medicalToday: medical,
        approvedToday: approved,
        unmarked,
        monthlyAttendancePct: monthlyPct,
        atRiskStudents: atRisk,
        complianceScore,
        totalRiskFlags: riskFlags.length,
      },
      trend: {
        monthly: trend,
        present: todayRecords.length > 0 ? Math.round((present / todayRecords.length) * 100) : 0,
        absent: todayRecords.length > 0 ? Math.round((absent / todayRecords.length) * 100) : 0,
        late: todayRecords.length > 0 ? Math.round((late / todayRecords.length) * 100) : 0,
      },
      settings,
    };
  }

  private getMonthStart(date: string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private getPrevMonthStart(date: string): string {
    const d = new Date(date);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private computeCompliance(total: number, present: number, absent: number, late: number, halfDay: number, unmarked: number): number {
    const effective = total - unmarked;
    if (effective <= 0) return 100;
    const weighted = present * 1 + late * 0.7 + halfDay * 0.5;
    return Math.round((weighted / effective) * 100);
  }

  async getStudents(orgId: string, filters?: { class_id?: string; section?: string; search?: string }) {
    let query = supabase.from('students').select('id, full_name, roll_number, admission_number, section_id, sections:sections!students_section_id_fkey(name), photo_url, status')
      .eq('organisation_id', orgId).eq('status', 'active');
    if (filters?.class_id) {
      const { data: mapping } = await supabase.from('class_student_map').select('student_id').eq('class_id', filters.class_id);
      const ids = mapping?.map(m => m.student_id) || [];
      if (ids.length === 0) return [];
      query = query.in('id', ids);
    }
    if (filters?.section) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.section);
      if (isUuid) {
        query = query.eq('section_id', filters.section);
      } else {
        const { data: secs } = await supabase.from('sections').select('id').eq('name', filters.section).eq('organisation_id', orgId);
        const ids = secs?.map(s => s.id) || [];
        if (ids.length === 0) return [];
        query = query.in('section_id', ids);
      }
    }
    if (filters?.search) {
      const s = `%${filters.search}%`;
      query = query.or(`full_name.ilike.${s},roll_number.ilike.${s},admission_number.ilike.${s}`);
    }
    const { data } = await query.order('roll_number', { ascending: true, nullsFirst: false });
    return data || [];
  }

  async getRecords(orgId: string, filters: {
    class_id?: string; section?: string; subject_id?: string; teacher_id?: string;
    date?: string; from?: string; to?: string; status?: string; session?: string;
    student_id?: string; search?: string; page?: number; limit?: number;
  }) {
    let query = supabase.from('attendance_records')
      .select('*, student:students(id, full_name, roll_number, admission_number, section_id, photo_url, sections:sections!students_section_id_fkey(name)), teacher:staff_records(id, full_name), subject:subjects(id, name, code)', { count: 'exact' })
      .eq('organisation_id', orgId);

    if (filters.class_id) query = query.eq('class_id', filters.class_id);
    if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
    if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
    if (filters.date) query = query.eq('date', filters.date);
    if (filters.from) query = query.gte('date', filters.from);
    if (filters.to) query = query.lte('date', filters.to);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.session) query = query.eq('session', filters.session);
    if (filters.student_id) query = query.eq('student_id', filters.student_id);

    if (filters.search) {
      const s = `%${filters.search}%`;
      query = query.or(`student.full_name.ilike.${s},student.roll_number.ilike.${s},student.admission_number.ilike.${s}`);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    query = query.order('date', { ascending: false }).range(offset, offset + limit - 1);
    const { data, count } = await query;
    return { data: data || [], total: count || 0, page, limit };
  }

  async markAttendance(orgId: string, data: {
    student_id: string; date: string; status: string; teacher_id?: string;
    class_id?: string; subject_id?: string; session?: string;
    check_in?: string; check_out?: string; duration?: number;
    remarks?: string; leave_reason?: string;
  }) {
    if (!STATUSES.includes(data.status)) throw new BadRequestError('Invalid status');
    const record = {
      organisation_id: orgId,
      student_id: data.student_id,
      teacher_id: data.teacher_id,
      class_id: data.class_id,
      subject_id: data.subject_id,
      session: data.session,
      date: data.date,
      status: data.status,
      check_in_time: data.check_in,
      check_out_time: data.check_out,
      duration: data.duration || 0,
      notes: data.remarks,
      leave_reason: data.leave_reason,
      updated_at: new Date().toISOString(),
    };
    const { data: result, error } = await supabase.from('attendance_records')
      .upsert(record, { onConflict: 'student_id,date' }).select().single();
    if (error) throw new BadRequestError(error.message);
    await this.updateRiskFlags(orgId, data.student_id);
    return result;
  }

  async bulkMark(orgId: string, data: {
    date: string; teacher_id?: string; class_id?: string; subject_id?: string; session?: string;
    records: { student_id: string; status: string; check_in?: string; check_out?: string; remarks?: string }[];
  }) {
    const students = await this.getStudents(orgId);
    const validIds = new Set(students.map(s => s.id));
    const valid = data.records.filter(r => validIds.has(r.student_id) && STATUSES.includes(r.status));
    if (valid.length === 0) throw new BadRequestError('No valid records');

    const upsertData = valid.map(r => ({
      organisation_id: orgId,
      student_id: r.student_id,
      teacher_id: data.teacher_id,
      class_id: data.class_id,
      subject_id: data.subject_id,
      session: data.session,
      date: data.date,
      status: r.status,
      check_in_time: r.check_in,
      check_out_time: r.check_out,
      notes: r.remarks,
      updated_at: new Date().toISOString(),
    }));

    const { data: result, error } = await supabase.from('attendance_records')
      .upsert(upsertData, { onConflict: 'student_id,date' }).select();
    if (error) throw new BadRequestError(error.message);

    for (const r of valid) {
      await this.updateRiskFlags(orgId, r.student_id).catch(() => {});
    }
    return result || [];
  }

  async getDailySummary(orgId: string, date?: string) {
    const today = date || new Date().toISOString().split('T')[0];
    const [studentsRes, recordsRes, classesRes] = await Promise.all([
      supabase.from('students').select('id, section_id, sections:sections!students_section_id_fkey(name)').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('attendance_records').select('*, student:students(full_name, roll_number, section_id, sections:sections!students_section_id_fkey(name))')
        .eq('organisation_id', orgId).eq('date', today),
      supabase.from('classes').select('id, name').eq('organisation_id', orgId).eq('status', 'active'),
    ]);

    const students = studentsRes.data || [];
    const records = recordsRes.data || [];
    const classes = classesRes.data || [];

    const byClass: Record<string, any> = {};
    for (const s of students) {
      const key = 'Unknown';
      if (!byClass[key]) byClass[key] = { class_name: key, total: 0, present: 0, absent: 0, late: 0, half_day: 0, medical: 0, approved: 0, marked: 0 };
      byClass[key].total++;
    }
    for (const r of records) {
      const key = 'Unknown';
      if (!byClass[key]) byClass[key] = { class_name: key, total: 0, present: 0, absent: 0, late: 0, half_day: 0, medical: 0, approved: 0, marked: 0 };
      byClass[key].marked++;
      if (r.status === 'present') byClass[key].present++;
      else if (r.status === 'absent') byClass[key].absent++;
      else if (r.status === 'late') byClass[key].late++;
      else if (r.status === 'half_day') byClass[key].half_day++;
      else if (r.status === 'medical_leave') byClass[key].medical++;
      else if (r.status === 'approved_leave') byClass[key].approved++;
    }

    return {
      date: today,
      totalStudents: students.length,
      totalMarked: records.length,
      totalPresent: records.filter(r => r.status === 'present').length,
      totalAbsent: records.filter(r => r.status === 'absent').length,
      totalLate: records.filter(r => r.status === 'late').length,
      totalHalfDay: records.filter(r => r.status === 'half_day').length,
      totalMedical: records.filter(r => r.status === 'medical_leave').length,
      totalApproved: records.filter(r => r.status === 'approved_leave').length,
      attendancePct: records.length > 0 ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100) : 0,
      byClass: Object.values(byClass),
      records,
    };
  }

  async getStudentHistory(studentId: string, limit = 100) {
    const { data } = await supabase.from('attendance_records')
      .select('*, teacher:staff_records(id, full_name)')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(limit);
    const records = data || [];
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    return {
      records,
      summary: {
        total: records.length,
        present,
        absent,
        late,
        halfDay: records.filter(r => r.status === 'half_day').length,
        medical: records.filter(r => r.status === 'medical_leave').length,
        approved: records.filter(r => r.status === 'approved_leave').length,
        percentage: records.length > 0 ? Math.round((present / records.length) * 100) : 0,
      },
    };
  }

  // Analytics
  async getAnalytics(orgId: string, filters?: { from?: string; to?: string; class_id?: string }) {
    const from = filters?.from || this.getMonthStart(new Date().toISOString().split('T')[0]);
    const to = filters?.to || new Date().toISOString().split('T')[0];

    let query = supabase.from('attendance_records').select('*, student:students(section_id, sections:sections!students_section_id_fkey(name))')
      .eq('organisation_id', orgId).gte('date', from).lte('date', to);
    if (filters?.class_id) query = query.eq('class_id', filters.class_id);
    const { data } = await query;
    const records = data || [];

    const dailyTrend: Record<string, any> = {};
    const weeklyTrend: Record<string, any> = {};
    const monthlyTrend: Record<string, any> = {};
    const classWise: Record<string, any> = {};
    const sectionWise: Record<string, any> = {};
    const subjectWise: Record<string, any> = {};
    const statusDist = { present: 0, absent: 0, late: 0, half_day: 0, medical_leave: 0, approved_leave: 0 };

    for (const r of records) {
      statusDist[r.status as keyof typeof statusDist] = (statusDist[r.status as keyof typeof statusDist] || 0) + 1;

      // Daily
      if (!dailyTrend[r.date]) dailyTrend[r.date] = { date: r.date, present: 0, absent: 0, late: 0, total: 0 };
      dailyTrend[r.date].total++;
      if (r.status === 'present') dailyTrend[r.date].present++;

      // Weekly
      const weekStart = this.getWeekStart(r.date);
      if (!weeklyTrend[weekStart]) weeklyTrend[weekStart] = { week: weekStart, present: 0, total: 0 };
      weeklyTrend[weekStart].total++;
      if (r.status === 'present') weeklyTrend[weekStart].present++;

      // Monthly
      const month = r.date.substring(0, 7);
      if (!monthlyTrend[month]) monthlyTrend[month] = { month, present: 0, total: 0 };
      monthlyTrend[month].total++;
      if (r.status === 'present') monthlyTrend[month].present++;

      // Class-wise
      const cls = 'Unknown';
      if (!classWise[cls]) classWise[cls] = { class: cls, present: 0, total: 0 };
      classWise[cls].total++;
      if (r.status === 'present') classWise[cls].present++;

      // Section-wise
      const sec = (r.student as any)?.sections?.name || 'Unknown';
      if (!sectionWise[sec]) sectionWise[sec] = { section: sec, present: 0, total: 0 };
      sectionWise[sec].total++;
      if (r.status === 'present') sectionWise[sec].present++;

      // Subject-wise
      if (r.subject_id) {
        if (!subjectWise[r.subject_id]) subjectWise[r.subject_id] = { subject_id: r.subject_id, present: 0, total: 0 };
        subjectWise[r.subject_id].total++;
        if (r.status === 'present') subjectWise[r.subject_id].present++;
      }
    }

    // Heatmap (day_of_week x hour)
    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
    for (const r of records) {
      const day = new Date(r.date).getDay();
      const hour = r.check_in_time ? parseInt(r.check_in_time.split(':')[0]) - 6 : 6;
      const col = Math.max(0, Math.min(11, Math.floor(hour / 1)));
      heatmap[day][col]++;
    }

    return {
      summary: {
        totalRecords: records.length,
        ...statusDist,
        attendancePct: records.length > 0 ? Math.round(((statusDist.present) / records.length) * 100) : 0,
      },
      dailyTrend: Object.values(dailyTrend).sort((a: any, b: any) => a.date.localeCompare(b.date)),
      weeklyTrend: Object.values(weeklyTrend).sort((a: any, b: any) => a.week.localeCompare(b.week)),
      monthlyTrend: Object.values(monthlyTrend).sort((a: any, b: any) => a.month.localeCompare(b.month)),
      classWise: Object.values(classWise),
      sectionWise: Object.values(sectionWise),
      subjectWise: Object.values(subjectWise),
      heatmap,
    };
  }

  private getWeekStart(date: string): string {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d.toISOString().split('T')[0];
  }

  // Risk Detection & AI
  async updateRiskFlags(orgId: string, studentId: string) {
    const history = await this.getStudentHistory(studentId, 60);
    const { summary } = history;
    const consecutive = this.countConsecutiveAbsences(history.records);

    let riskLevel = 'low';
    let dropoutProb = 0;
    let suggestedAction = '';

    if (summary.percentage < 40) { riskLevel = 'critical'; dropoutProb = 85; suggestedAction = 'Immediate counseling and parent meeting required'; }
    else if (summary.percentage < 60) { riskLevel = 'high'; dropoutProb = 60; suggestedAction = 'Schedule parent meeting and academic intervention'; }
    else if (summary.percentage < 75) { riskLevel = 'medium'; dropoutProb = 30; suggestedAction = 'Monitor and notify parents'; }
    else { riskLevel = 'low'; dropoutProb = 5; suggestedAction = 'Continue regular monitoring'; }

    if (consecutive >= 10) { riskLevel = 'critical'; dropoutProb = 90; suggestedAction = 'Urgent: Chronic absentee — escalate to administration'; }

    const trend = this.calculateTrend(history.records);

    await supabase.from('attendance_risk_flags').upsert({
      organisation_id: orgId,
      student_id: studentId,
      risk_level: riskLevel,
      attendance_pct: summary.percentage,
      consecutive_absences: consecutive,
      total_absences: summary.absent + summary.late,
      dropout_probability: dropoutProb,
      trend,
      suggested_action: suggestedAction,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'organisation_id,student_id' });
  }

  private countConsecutiveAbsences(records: any[]): number {
    let max = 0, cur = 0;
    for (const r of records.sort((a, b) => a.date.localeCompare(b.date))) {
      if (r.status === 'absent') { cur++; max = Math.max(max, cur); }
      else cur = 0;
    }
    return max;
  }

  private calculateTrend(records: any[]): 'improving' | 'stable' | 'declining' {
    if (records.length < 4) return 'stable';
    const half = Math.floor(records.length / 2);
    const first = records.slice(0, half).filter(r => r.status === 'present').length / half;
    const second = records.slice(half).filter(r => r.status === 'present').length / (records.length - half);
    if (second > first + 0.1) return 'improving';
    if (second < first - 0.1) return 'declining';
    return 'stable';
  }

  async getRiskFlags(orgId: string, filters?: { risk_level?: string }) {
    let query = supabase.from('attendance_risk_flags')
      .select('*, student:students(id, full_name, roll_number, admission_number, section_id, photo_url, sections:sections!students_section_id_fkey(name))')
      .eq('organisation_id', orgId);
    if (filters?.risk_level) query = query.eq('risk_level', filters.risk_level);
    const { data } = await query.order('dropout_probability', { ascending: false });
    return data || [];
  }

  async getAiInsights(orgId: string) {
    const [recordsRes, studentsRes, riskRes, settingsRes] = await Promise.all([
      supabase.from('attendance_records').select('student_id, status, date').eq('organisation_id', orgId),
      supabase.from('students').select('id, full_name, section_id, photo_url, sections:sections!students_section_id_fkey(name)').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('attendance_risk_flags').select('*, student:students(id, full_name, section_id, photo_url, sections:sections!students_section_id_fkey(name))')
        .eq('organisation_id', orgId).order('dropout_probability', { ascending: false }).limit(20),
      supabase.from('attendance_settings').select('*').eq('organisation_id', orgId).single(),
    ]);

    const records = recordsRes.data || [];
    const students = studentsRes.data || [];
    const riskStudents = riskRes.data || [];
    const settings = settingsRes.data || {};

    const studentMap = Object.fromEntries(students.map(s => [s.id, s]));
    const studentRecords: Record<string, any[]> = {};
    for (const r of records) {
      if (!studentRecords[r.student_id]) studentRecords[r.student_id] = [];
      studentRecords[r.student_id].push(r);
    }

    const lowAttendance: any[] = [];
    const chronicAbsentees: any[] = [];
    const forecast: Record<string, any> = {};

    for (const [sid, recs] of Object.entries(studentRecords)) {
      const total = recs.length;
      const present = recs.filter(r => r.status === 'present').length;
      const absent = recs.filter(r => r.status === 'absent').length;
      const pct = total > 0 ? (present / total) * 100 : 0;
      const student = studentMap[sid];

      if (pct < 75) {
        lowAttendance.push({ student, attendancePct: Math.round(pct), total, absent });
      }
      if (absent >= 15) {
        chronicAbsentees.push({ student, totalAbsences: absent, attendancePct: Math.round(pct) });
      }

      if (pct < 80) {
        forecast[sid] = {
          currentPct: Math.round(pct),
          projectedPct: Math.max(0, Math.round(pct - (absent * 2))),
          riskLevel: pct < 40 ? 'critical' : pct < 60 ? 'high' : pct < 75 ? 'medium' : 'low',
        };
      }
    }

    const totalAttendance = records.length > 0
      ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100)
      : 0;

    return {
      totalAttendance,
      lowAttendanceStudents: lowAttendance.slice(0, 10),
      chronicAbsentees: chronicAbsentees.slice(0, 10),
      riskStudents: riskStudents.slice(0, 10),
      forecast: Object.entries(forecast).slice(0, 10).map(([studentId, data]) => ({ studentId, ...data as any })),
      recommendations: this.generateRecommendations(records.length, totalAttendance, lowAttendance.length, chronicAbsentees.length, settings),
      settings,
    };
  }

  private generateRecommendations(total: number, attendancePct: number, lowCount: number, chronicCount: number, settings: any): string[] {
    const recs: string[] = [];
    if (attendancePct < 80) recs.push('Overall attendance below 80% — implement school-wide awareness program');
    if (lowCount > 5) recs.push(`${lowCount} students have <75% attendance — schedule parent meetings`);
    if (chronicCount > 3) recs.push(`${chronicCount} chronic absentees identified — consider counseling and home visits`);
    if (settings.enable_auto_attendance) recs.push('Enable auto-attendance alerts for real-time parent notifications');
    recs.push('Conduct monthly attendance review with class teachers');
    recs.push('Recognize classes with 100% attendance weekly');
    if (recs.length === 0) recs.push('Attendance is well-managed — continue current practices');
    return recs;
  }

  // Reports
  async getReports(orgId: string, type: string, filters?: { from?: string; to?: string; class_id?: string; student_id?: string; teacher_id?: string }) {
    const to = filters?.to || new Date().toISOString().split('T')[0];
    const from = filters?.from || new Date(new Date(to).setMonth(new Date(to).getMonth() - 1)).toISOString().split('T')[0];

    const [studentsRes, recordsRes, classesRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, admission_number, section_id, sections:sections!students_section_id_fkey(name)').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('attendance_records').select('*, student:students(id, full_name, roll_number, section_id, sections:sections!students_section_id_fkey(name))')
        .eq('organisation_id', orgId).gte('date', from).lte('date', to),
      supabase.from('classes').select('id, name').eq('organisation_id', orgId).eq('status', 'active'),
    ]);

    const students = studentsRes.data || [];
    const records = recordsRes.data || [];
    const classes = classesRes.data || [];

    const classMap = Object.fromEntries(classes.map(c => [c.name, c]));

    const studentStats: Record<string, any> = {};
    for (const s of students) {
      studentStats[s.id] = { ...s, present: 0, absent: 0, late: 0, halfDay: 0, medical: 0, approved: 0, total: 0 };
    }
    for (const r of records) {
      if (!studentStats[r.student_id]) continue;
      const st = studentStats[r.student_id];
      st.total++;
      if (r.status === 'present') st.present++;
      else if (r.status === 'absent') st.absent++;
      else if (r.status === 'late') st.late++;
      else if (r.status === 'half_day') st.halfDay++;
      else if (r.status === 'medical_leave') st.medical++;
      else if (r.status === 'approved_leave') st.approved++;
    }

    const classStats: Record<string, any> = {};
    for (const s of students) {
      const key = 'Unknown';
      if (!classStats[key]) classStats[key] = { class: key, total: 0, present: 0, absent: 0, late: 0 };
      classStats[key].total++;
    }
    for (const r of records) {
      const key = 'Unknown';
      if (!classStats[key]) continue;
      if (r.status === 'present') classStats[key].present++;
      else if (r.status === 'absent') classStats[key].absent++;
      else if (r.status === 'late') classStats[key].late++;
    }

    return {
      type,
      from,
      to,
      totalStudents: students.length,
      totalRecords: records.length,
      presentCount: records.filter(r => r.status === 'present').length,
      absentCount: records.filter(r => r.status === 'absent').length,
      lateCount: records.filter(r => r.status === 'late').length,
      halfDayCount: records.filter(r => r.status === 'half_day').length,
      medicalCount: records.filter(r => r.status === 'medical_leave').length,
      approvedCount: records.filter(r => r.status === 'approved_leave').length,
      overallPercentage: records.length > 0 ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100) : 0,
      studentStats: Object.values(studentStats).filter((s: any) => s.total > 0),
      classStats: Object.values(classStats),
    };
  }

  // Settings
  async getSettings(orgId: string) {
    const { data } = await supabase.from('attendance_settings').select('*')
      .eq('organisation_id', orgId).order('created_at', { ascending: false }).limit(1);
    return data?.[0] || null;
  }

  async saveSettings(orgId: string, data: any) {
    const record = { organisation_id: orgId, ...data, updated_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from('attendance_settings')
      .upsert(record, { onConflict: 'organisation_id,academic_year' }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getAutomationLogs(orgId: string, filters?: { type?: string; student_id?: string; status?: string }) {
    let query = supabase.from('attendance_automation_logs')
      .select('*, student:students(id, full_name, roll_number)')
      .eq('organisation_id', orgId).order('verified_at', { ascending: false }).limit(100);
    if (filters?.type) query = query.eq('automation_type', filters.type);
    if (filters?.student_id) query = query.eq('student_id', filters.student_id);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data } = await query;
    return data || [];
  }

  async createAutomationLog(orgId: string, data: any) {
    const log = {
      organisation_id: orgId,
      student_id: data.student_id,
      user_type: data.user_type || 'student',
      automation_type: data.automation_type,
      device_id: data.device_id,
      direction: data.direction,
      match_score: data.match_score,
      status: data.status || 'verified',
      error_message: data.error_message,
      raw_data: data.raw_data,
      verified_at: data.verified_at || new Date().toISOString(),
    };
    const { data: result, error } = await supabase.from('attendance_automation_logs').insert(log).select().single();
    if (error) throw new BadRequestError(error.message);

    if (result.status === 'verified' && result.student_id) {
      await this.markAttendance(orgId, {
        student_id: result.student_id,
        date: new Date(result.verified_at).toISOString().split('T')[0],
        status: 'present',
        check_in: new Date(result.verified_at).toTimeString().slice(0, 5),
      });
    }
    return result;
  }

  async sendNotification(orgId: string, data: {
    student_id: string; notification_type: string; recipient: string; subject?: string; message: string;
  }) {
    const notification = {
      organisation_id: orgId,
      student_id: data.student_id,
      notification_type: data.notification_type,
      recipient: data.recipient,
      subject: data.subject,
      message: data.message,
      status: 'sent',
      sent_at: new Date().toISOString(),
    };
    const { data: result, error } = await supabase.from('attendance_notifications').insert(notification).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getNotifications(orgId: string) {
    const { data } = await supabase.from('attendance_notifications')
      .select('*, student:students(id, full_name, roll_number)')
      .eq('organisation_id', orgId).order('created_at', { ascending: false }).limit(50);
    return data || [];
  }

  // Import
  async importAttendance(orgId: string, data: {
    records: any[]; file_name?: string; file_type?: string; imported_by?: string;
  }) {
    const valid = data.records.filter(r => r.student_id && STATUSES.includes(r.status));
    let success = 0, errors: any[] = [];

    for (const r of valid) {
      try {
        await this.markAttendance(orgId, r);
        success++;
      } catch (e: any) {
        errors.push({ student_id: r.student_id, error: e.message });
      }
    }

    await supabase.from('attendance_imports').insert({
      organisation_id: orgId,
      file_name: data.file_name,
      file_type: data.file_type || 'api',
      total_rows: data.records.length,
      success_count: success,
      error_count: errors.length,
      errors: errors.length > 0 ? JSON.stringify(errors) : null,
      imported_by: data.imported_by,
    });

    return { success, errors, total: data.records.length };
  }

  async getWeeklyReportData(orgId: string, dateStr: string) {
    const from = this.getWeekStart(dateStr);
    const to = dateStr;
    return this.getReports(orgId, 'weekly', { from, to });
  }

  async getMonthlyReportData(orgId: string, dateStr: string) {
    const from = this.getMonthStart(dateStr);
    const to = dateStr;
    return this.getReports(orgId, 'monthly', { from, to });
  }
}

export const attendanceService = new AttendanceService();
