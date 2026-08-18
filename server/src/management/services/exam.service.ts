import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ExamService {
  async getDashboard(orgId: string) {
    const now = new Date().toISOString().split('T')[0];
    const [examsRes, resultsRes, studentsRes, subjectsRes] = await Promise.all([
      supabase.from('exams').select('*').eq('organisation_id', orgId),
      supabase.from('exam_results').select('*, student:students(full_name), subject:subjects(name)').eq('organisation_id', orgId),
      supabase.from('students').select('id', { count: 'exact' }).eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('subjects').select('id, name').eq('organisation_id', orgId),
    ]);

    const exams = examsRes.data || [];
    const results = resultsRes.data || [];
    const totalStudents = studentsRes.count || 0;

    const upcoming = exams.filter(e => e.status === 'upcoming' || e.status === 'scheduled' || e.status === 'draft').length;
    const completed = exams.filter(e => e.status === 'completed').length;
    const published = exams.filter(e => e.is_published === true).length;

    const assessedIds = new Set(results.map(r => r.student_id));
    const studentsAssessed = assessedIds.size;

    let avgScore = 0;
    let passTotal = 0;
    let passCount = 0;
    const subjectStats: Record<string, { total: number; sum: number; passed: number }> = {};
    for (const r of results) {
      const pct = r.percentage != null ? Number(r.percentage) : (r.max_marks ? (Number(r.marks_obtained) / Number(r.max_marks)) * 100 : 0);
      avgScore += pct;
      passTotal++;
      if (r.is_passed === true || pct >= 40) passCount++;
      const sub = r.subject?.name || 'Unknown';
      if (!subjectStats[sub]) subjectStats[sub] = { total: 0, sum: 0, passed: 0 };
      subjectStats[sub].total++;
      subjectStats[sub].sum += pct;
      if (r.is_passed === true || pct >= 40) subjectStats[sub].passed++;
    }

    const subjectAreas = Object.entries(subjectStats).map(([subject_name, s]) => ({
      subject_name,
      avg_marks: s.total > 0 ? Math.round((s.sum / s.total) * 100) / 100 : 0,
      pass_rate: s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0,
    }));

    return {
      summary: {
        totalExams: exams.length,
        upcoming,
        completed,
        published,
        studentsAssessed: studentsAssessed || totalStudents,
        avgScore: passTotal > 0 ? Math.round(avgScore / passTotal) : 0,
      },
      subjectAreas,
    };
  }

  async getExams(orgId: string, filters?: {
    class_id?: string; section?: string; exam_type?: string; status?: string;
    term?: string; academic_year?: string; from?: string; to?: string; search?: string;
    page?: number; limit?: number;
  }) {
    let query = supabase.from('exams').select('*, class:classes!exams_class_id_fkey(name)', { count: 'exact' }).eq('organisation_id', orgId);
    if (filters?.class_id) query = query.eq('class_id', filters.class_id);
    if (filters?.section) query = query.eq('section', filters.section);
    if (filters?.exam_type) query = query.eq('exam_type', filters.exam_type);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.term) query = query.eq('term', filters.term);
    if (filters?.academic_year) query = query.eq('academic_year', filters.academic_year);
    if (filters?.from) query = query.gte('start_date', filters.from);
    if (filters?.to) query = query.lte('end_date', filters.to);
    if (filters?.search) { const s = `%${filters.search}%`; query = query.or(`name.ilike.${s},title.ilike.${s},description.ilike.${s}`); }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    query = query.order('start_date', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count } = await query;
    const rows = (data || []).map(e => this.mapExamRow(e));
    return { data: rows, total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async getExamById(examId: string) {
    const { data, error } = await supabase.from('exams').select('*, class:classes!exams_class_id_fkey(name), schedules:exam_schedules(*, subject:subjects(name), invigilator:invigilator_id(full_name))').eq('id', examId).single();
    if (error) throw new BadRequestError(error.message);
    const row = this.mapExamRow(data);
    row.schedules = (data.schedules || []).map((s: any) => this.mapScheduleRow(s));
    return row;
  }

  async createExam(orgId: string, data: any) {
    const exam = {
      organisation_id: orgId,
      name: data.title || data.name,
      title: data.title || data.name,
      exam_type: data.exam_type || 'midterm',
      academic_year: data.academic_year,
      term: data.term,
      class_id: data.class_id,
      section: data.section,
      start_date: data.start_date,
      end_date: data.end_date,
      description: data.description,
      status: data.status || 'draft',
      total_marks: data.total_marks || data.max_marks || 100,
      max_marks: data.total_marks || data.max_marks || 100,
      passing_marks: data.passing_marks || null,
      created_by: data.created_by,
    };
    const { data: result, error } = await supabase.from('exams').insert(exam).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapExamRow(result);
  }

  async updateExam(examId: string, data: any) {
    const patch: any = { ...data, updated_at: new Date().toISOString() };
    if (data.title) { patch.name = data.title; patch.title = data.title; }
    if (data.total_marks) { patch.total_marks = data.total_marks; patch.max_marks = data.total_marks; }
    const { data: result, error } = await supabase.from('exams').update(patch).eq('id', examId).select('*, class:classes!exams_class_id_fkey(name)').single();
    if (error) throw new BadRequestError(error.message);
    return this.mapExamRow(result);
  }

  async deleteExam(examId: string) {
    await Promise.all([
      supabase.from('exam_schedules').delete().eq('exam_id', examId),
      supabase.from('exam_results').delete().eq('exam_id', examId),
    ]);
    const { error } = await supabase.from('exams').delete().eq('id', examId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async updateExamStatus(examId: string, status: string) {
    const { data, error } = await supabase.from('exams').update({ status, updated_at: new Date().toISOString() }).eq('id', examId).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  // Schedules
  async getSchedules(examId: string) {
    const { data } = await supabase.from('exam_schedules')
      .select('*, subject:subjects(id, name, code), invigilator:invigilator_id(full_name, email)')
      .eq('exam_id', examId).order('date').order('start_time');
    return (data || []).map(s => this.mapScheduleRow(s));
  }

  async createSchedule(orgId: string, data: any) {
    const schedule = {
      organisation_id: orgId,
      exam_id: data.exam_id,
      class_id: data.class_id,
      subject_id: data.subject_id,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      room: data.room,
      invigilator_id: data.invigilator_id,
      max_marks: data.max_marks || data.total_marks || 100,
      pass_marks: data.pass_marks || null,
      duration_minutes: data.duration_minutes,
      session: data.session,
    };
    const { data: result, error } = await supabase.from('exam_schedules').insert(schedule).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapScheduleRow(result);
  }

  async updateSchedule(scheduleId: string, data: any) {
    const patch: any = { ...data, updated_at: new Date().toISOString() };
    if (data.total_marks) { delete patch.total_marks; patch.max_marks = data.total_marks; }
    const { data: result, error } = await supabase.from('exam_schedules').update(patch).eq('id', scheduleId).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapScheduleRow(result);
  }

  async deleteSchedule(scheduleId: string) {
    const { error } = await supabase.from('exam_schedules').delete().eq('id', scheduleId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // Results
  async getResults(orgId: string, filters?: { exam_id?: string; student_id?: string; subject_id?: string; page?: number; limit?: number }) {
    let query = supabase.from('exam_results')
      .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name)), subject:subjects(name, code)', { count: 'exact' })
      .eq('organisation_id', orgId);
    if (filters?.exam_id) query = query.eq('exam_id', filters.exam_id);
    if (filters?.student_id) query = query.eq('student_id', filters.student_id);
    if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, count } = await query;
    const rows = (data || []).map(r => this.mapResultRow(r));
    return { data: rows, total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async enterMarks(orgId: string, data: {
    exam_id: string; student_id: string; subject_id: string;
    marks_obtained: number; max_marks?: number; total_marks?: number; grade?: string; remarks?: string;
  }) {
    const maxMarks = data.total_marks || data.max_marks || 100;
    const pct = maxMarks ? (data.marks_obtained / maxMarks) * 100 : 0;
    const grade = data.grade || this.calculateGrade(pct);
    const record = {
      organisation_id: orgId,
      exam_id: data.exam_id,
      student_id: data.student_id,
      subject_id: data.subject_id,
      marks_obtained: data.marks_obtained,
      max_marks: maxMarks,
      total_marks: maxMarks,
      grade,
      is_passed: pct >= 40,
      percentage: Math.round(pct * 100) / 100,
      remarks: data.remarks,
      updated_at: new Date().toISOString(),
    };
    const { data: result, error } = await supabase.from('exam_results')
      .upsert(record, { onConflict: 'exam_id,student_id,subject_id' }).select('*, student:students(full_name), subject:subjects(name)').single();
    if (error) throw new BadRequestError(error.message);
    return this.mapResultRow(result);
  }

  async bulkEnterMarks(orgId: string, data: { exam_id: string; marks?: any[]; results?: any[] }) {
    const marks = data.marks || data.results || [];
    if (marks.length === 0) throw new BadRequestError('No marks provided');
    const records = marks.map(m => {
      const maxMarks = m.total_marks || m.max_marks || 100;
      const pct = maxMarks > 0 ? (m.marks_obtained / maxMarks) * 100 : 0;
      return {
        organisation_id: orgId,
        exam_id: data.exam_id,
        student_id: m.student_id,
        subject_id: m.subject_id,
        marks_obtained: m.marks_obtained,
        max_marks: maxMarks,
        total_marks: maxMarks,
        grade: m.grade || this.calculateGrade(pct),
        is_passed: pct >= 40,
        percentage: Math.round(pct * 100) / 100,
        remarks: m.remarks,
        updated_at: new Date().toISOString(),
      };
    });
    const { data: result, error } = await supabase.from('exam_results').upsert(records, { onConflict: 'exam_id,student_id,subject_id' }).select();
    if (error) throw new BadRequestError(error.message);
    return { count: (result || []).length };
  }

  async publishResults(examId: string) {
    const { error } = await supabase.from('exam_results').update({ is_published: true }).eq('exam_id', examId);
    if (error) throw new BadRequestError(error.message);
    await supabase.from('exams').update({ is_published: true, status: 'published', updated_at: new Date().toISOString() }).eq('id', examId);
    return { success: true };
  }

  async lockResults(examId: string) {
    const { error } = await supabase.from('exam_results').update({ is_locked: true }).eq('exam_id', examId);
    if (error) throw new BadRequestError(error.message);
    await supabase.from('exams').update({ is_locked: true, updated_at: new Date().toISOString() }).eq('id', examId);
    return { success: true };
  }

  async unlockResults(examId: string) {
    const { error } = await supabase.from('exam_results').update({ is_locked: false }).eq('exam_id', examId);
    if (error) throw new BadRequestError(error.message);
    await supabase.from('exams').update({ is_locked: false, updated_at: new Date().toISOString() }).eq('id', examId);
    return { success: true };
  }

  async getStudentPerformance(orgId: string, studentId: string) {
    const { data } = await supabase.from('exam_results')
      .select('*, subject:subjects(name, code), exam:exams(name, exam_type, term, academic_year)')
      .eq('organisation_id', orgId).eq('student_id', studentId).order('created_at', { ascending: false });
    const results = data || [];
    const total = results.length;
    const passed = results.filter(r => r.is_passed).length;
    const avgScore = total > 0 ? Math.round(results.reduce((s, r) => s + (r.percentage ?? (r.max_marks ? (Number(r.marks_obtained) / Number(r.max_marks)) * 100 : 0)), 0) / total) : 0;

    const subjectScores: Record<string, number[]> = {};
    for (const r of results) {
      const sub = r.subject?.name || 'Unknown';
      if (!subjectScores[sub]) subjectScores[sub] = [];
      subjectScores[sub].push(r.percentage ?? (r.max_marks ? (Number(r.marks_obtained) / Number(r.max_marks)) * 100 : 0));
    }

    return {
      overallGpa: total > 0 ? Math.round((avgScore / 25) * 10) / 10 : 0,
      avgScore,
      examsTaken: total,
      rank: 0,
      subjectScores: Object.entries(subjectScores).map(([subject_name, scores]) => ({
        subject_name,
        score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      })),
      recentExams: results.slice(0, 10).map(r => ({
        exam_title: r.exam?.name || '—',
        subject_name: r.subject?.name || '—',
        marks_obtained: r.marks_obtained,
        total_marks: r.total_marks || r.max_marks || 100,
        grade: r.grade || '—',
      })),
    };
  }

  // Analytics
  async getAnalytics(orgId: string) {
    const [examsRes, resultsRes, schedulesRes] = await Promise.all([
      supabase.from('exams').select('*').eq('organisation_id', orgId),
      supabase.from('exam_results').select('*, subject:subjects(name), exam:exams(name, exam_type)').eq('organisation_id', orgId),
      supabase.from('exam_schedules').select('*').eq('organisation_id', orgId),
    ]);

    const exams = examsRes.data || [];
    const results = resultsRes.data || [];
    const schedules = schedulesRes.data || [];

    const examTypeDist: Record<string, number> = {};
    for (const e of exams) { examTypeDist[e.exam_type || 'other'] = (examTypeDist[e.exam_type || 'other'] || 0) + 1; }

    const examsByMonth: Record<string, number> = {};
    for (const e of exams) {
      if (e.start_date) { const m = e.start_date.substring(0, 7); examsByMonth[m] = (examsByMonth[m] || 0) + 1; }
    }

    const passFail = { passed: 0, failed: 0 };
    const gradeDist: Record<string, number> = {};
    for (const r of results) {
      if (r.is_passed) passFail.passed++; else passFail.failed++;
      if (r.grade) gradeDist[r.grade] = (gradeDist[r.grade] || 0) + 1;
    }

    const subjectPerformance: Record<string, { total: number; sum: number; passed: number }> = {};
    for (const r of results) {
      const sub = r.subject?.name || 'Unknown';
      if (!subjectPerformance[sub]) subjectPerformance[sub] = { total: 0, sum: 0, passed: 0 };
      subjectPerformance[sub].total++;
      subjectPerformance[sub].sum += r.percentage ?? (r.max_marks ? (Number(r.marks_obtained) / Number(r.max_marks)) * 100 : 0);
      if (r.is_passed) subjectPerformance[sub].passed++;
    }

    const avgPct = results.length > 0 ? Math.round((passFail.passed / results.length) * 100) : 0;

    return {
      examTypeDistribution: Object.entries(examTypeDist).map(([name, value]) => ({ name, value })),
      examsByMonth: Object.entries(examsByMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
      averagePassPercentage: avgPct,
      subjectPerformance: Object.entries(subjectPerformance).map(([name, data]) => ({ name, ...data, avg: Math.round((data.sum / data.total) * 100) / 100, pct: Math.round((data.passed / data.total) * 100) })),
      gradeDistribution: Object.entries(gradeDist).map(([grade, count]) => ({ grade, count })),
      passFailRatio: [passFail],
      totalExams: exams.length,
      totalResults: results.length,
      totalSchedules: schedules.length,
    };
  }

  // AI Insights
  async getAiInsights(orgId: string) {
    const [resultsRes, studentsRes, examsRes] = await Promise.all([
      supabase.from('exam_results').select('*, student:students(full_name, class_id, section_id), subject:subjects(id, name)').eq('organisation_id', orgId),
      supabase.from('students').select('id, full_name, class_id, section_id').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('exams').select('id, name, exam_type, start_date, end_date').eq('organisation_id', orgId),
    ]);

    const results = resultsRes.data || [];
    const students = studentsRes.data || [];
    const exams = examsRes.data || [];

    const studentStats: Record<string, { total: number; passed: number; subjects: Set<string>; marks: number[] }> = {};
    for (const r of results) {
      const sid = r.student_id;
      if (!studentStats[sid]) studentStats[sid] = { total: 0, passed: 0, subjects: new Set(), marks: [] };
      studentStats[sid].total++;
      if (r.is_passed) studentStats[sid].passed++;
      if (r.subject?.name) studentStats[sid].subjects.add(r.subject.name);
      studentStats[sid].marks.push(Number(r.marks_obtained) || 0);
    }

    const atRisk: any[] = [];
    const weakSubjects: Record<string, number> = {};
    const studentMap = Object.fromEntries(students.map(s => [s.id, s]));
    let totalPct = 0;
    let scoreSum = 0;

    for (const [sid, stats] of Object.entries(studentStats)) {
      const pct = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
      totalPct += pct;
      scoreSum += stats.marks.reduce((a, b) => a + b, 0) / (stats.marks.length || 1);
      const student = studentMap[sid] || { id: sid };
      if (pct < 40) {
        atRisk.push({ student_name: student.full_name || 'Unknown', student_id: sid, pass_rate: Math.round(pct), risk_level: 'critical', risk_score: 100 - Math.round(pct) });
      } else if (pct < 60) {
        atRisk.push({ student_name: student.full_name || 'Unknown', student_id: sid, pass_rate: Math.round(pct), risk_level: 'high', risk_score: 100 - Math.round(pct) });
      } else if (pct < 75) {
        atRisk.push({ student_name: student.full_name || 'Unknown', student_id: sid, pass_rate: Math.round(pct), risk_level: 'medium', risk_score: 100 - Math.round(pct) });
      }
    }

    for (const r of results) {
      if (!r.is_passed && r.subject?.name) {
        weakSubjects[r.subject.name] = (weakSubjects[r.subject.name] || 0) + 1;
      }
    }

    const studentCount = Object.keys(studentStats).length || 1;
    const avgPct = Math.round(totalPct / studentCount);
    const avgScore = Math.round((scoreSum / studentCount) * 100) / 100;
    const readinessScore = Math.min(100, Math.round(avgPct + (results.length > 0 ? 10 : 0) - (atRisk.length * 2)));

    const recommendations = [];
    if (avgPct < 60) recommendations.push('Overall pass rate is low — review teaching methodology and conduct remedial classes');
    if (atRisk.length > 5) recommendations.push(`${atRisk.length} students at risk — schedule intensive tutoring and parent meetings`);
    if (Object.keys(weakSubjects).length > 0) {
      const worst = Object.entries(weakSubjects).sort(([, a], [, b]) => b - a)[0];
      recommendations.push(`Weakest subject: ${worst[0]} with ${worst[1]} failures — focus on extra classes`);
    }
    recommendations.push('Create personalized study plans for below-average students');
    recommendations.push('Conduct weekly mock tests to improve exam readiness');

    return {
      atRiskStudents: atRisk.slice(0, 10),
      weakSubjects: Object.entries(weakSubjects).sort(([, a], [, b]) => b - a).slice(0, 5).map(([subject_name, failures]) => ({ subject_name, failures, avgScore: Math.round((failures / (studentCount || 1)) * 100) })),
      averagePassPercentage: avgPct,
      averageScore: avgScore,
      examReadinessScore: readinessScore,
      totalStudentsAnalyzed: Object.keys(studentStats).length,
      recommendations,
      totalExams: exams.length,
      completedExams: exams.filter(e => e.end_date && e.end_date < new Date().toISOString().split('T')[0]).length,
    };
  }

  async getReadinessScores(orgId: string) {
    const [resultsRes, attendanceRes, studentsRes] = await Promise.all([
      supabase.from('exam_results').select('student_id, marks_obtained, max_marks, percentage, is_passed').eq('organisation_id', orgId),
      supabase.from('attendance_records').select('student_id, status').eq('organisation_id', orgId),
      supabase.from('students').select('id, full_name').eq('organisation_id', orgId),
    ]);

    const results = resultsRes.data || [];
    const attendance = attendanceRes.data || [];
    const students = studentsRes.data || [];

    const studentResults: Record<string, number[]> = {};
    for (const r of results) {
      if (!studentResults[r.student_id]) studentResults[r.student_id] = [];
      const pct = r.percentage != null ? Number(r.percentage) : (r.max_marks ? (Number(r.marks_obtained) / Number(r.max_marks)) * 100 : 0);
      studentResults[r.student_id].push(pct);
    }
    const studentAtt: Record<string, number> = {};
    for (const a of attendance) {
      if (!studentAtt[a.student_id]) studentAtt[a.student_id] = 0;
      if (a.status === 'present') studentAtt[a.student_id]++;
    }
    const studentMap = Object.fromEntries(students.map(s => [s.id, s]));

    const scores = [];
    for (const [sid, marks] of Object.entries(studentResults)) {
      const academic = marks.reduce((s, m) => s + m, 0) / marks.length;
      const att = studentAtt[sid] || 0;
      const readiness_score = Math.min(100, Math.round(academic * 0.7 + Math.min(100, att * 10) * 0.3));
      scores.push({
        student_id: sid,
        student_name: studentMap[sid]?.full_name || 'Unknown',
        academic_score: Math.round(academic),
        attendance_score: Math.min(100, att * 10),
        readiness_score,
      });
    }
    return scores;
  }

  private calculateGrade(pct: number): string {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C+';
    if (pct >= 40) return 'C';
    return 'F';
  }

  async getInvigilators(orgId: string) {
    const { data } = await supabase.from('staff_records').select('id, full_name, email').eq('organisation_id', orgId).eq('status', 'active');
    return data || [];
  }

  async getGradeDefinitions(orgId: string) {
    const { data } = await supabase.from('exam_grade_definitions').select('*').eq('organisation_id', orgId).order('min_percentage', { ascending: false });
    return (data || []).map(g => ({ ...g, grade_points: g.grade_points ?? g.gpa ?? null }));
  }

  async saveGradeDefinitions(orgId: string, grades: any[]) {
    await supabase.from('exam_grade_definitions').delete().eq('organisation_id', orgId);
    const records = grades.map(g => ({ ...g, organisation_id: orgId, grade_points: g.grade_points ?? g.gpa ?? null }));
    const { data, error } = await supabase.from('exam_grade_definitions').insert(records).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  private mapExamRow(e: any) {
    return {
      ...e,
      title: e.title || e.name,
      class_name: e.class?.name || null,
      total_marks: e.total_marks ?? e.max_marks ?? 100,
      max_marks: e.max_marks ?? e.total_marks ?? 100,
    };
  }

  private mapScheduleRow(s: any) {
    return {
      ...s,
      subject_name: s.subject?.name || null,
      subject_code: s.subject?.code || null,
      invigilator_name: s.invigilator?.full_name || null,
      total_marks: s.max_marks ?? s.total_marks ?? 100,
    };
  }

  private mapResultRow(r: any) {
    return {
      ...r,
      student_name: r.student?.full_name || null,
      roll_number: r.student?.roll_number || null,
      class_id: r.student?.class_id || null,
      class_name: r.student?.classes?.name || null,
      subject_name: r.subject?.name || null,
      subject_code: r.subject?.code || null,
      total_marks: r.total_marks ?? r.max_marks ?? 100,
    };
  }
}

export const examService = new ExamService();
