import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AssignmentService {
  async getDashboard(orgId: string) {
    const now = new Date().toISOString().split('T')[0];
    const monthStart = `${now.substring(0, 7)}-01`;

    const [assignmentsRes, submissionsRes, prevRes] = await Promise.all([
      supabase.from('assignments').select('id, status, due_date, total_students, submitted_count, graded_count, avg_score').eq('organisation_id', orgId),
      supabase.from('assignment_submissions').select('id, status, grade, submitted_at, is_late').eq('organisation_id', orgId),
      supabase.from('assignments').select('id, status').eq('organisation_id', orgId).lt('created_at', monthStart),
    ]);

    const assignments = assignmentsRes.data || [];
    const submissions = submissionsRes.data || [];
    const prevAssignments = prevRes.data || [];

    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter((a: any) => a.status === 'active').length;
    const closedAssignments = assignments.filter((a: any) => a.status === 'closed').length;
    const draftAssignments = assignments.filter((a: any) => a.status === 'draft').length;
    const overdueAssignments = assignments.filter((a: any) => a.status === 'active' && a.due_date && a.due_date < now).length;
    const submittedCount = submissions.filter((s: any) => s.status === 'submitted' || s.status === 'graded').length;
    const gradedCount = submissions.filter((s: any) => s.status === 'graded').length;
    const pendingSubmissions = Math.max(0, assignments.reduce((s: number, a: any) => s + (a.total_students || 0), 0) - submittedCount);
    const gradedAssignments = assignments.filter((a: any) => a.graded_count && a.graded_count > 0).length;
    const avgSubmissionRate = assignments.length > 0 ? Math.round((submittedCount / Math.max(1, assignments.reduce((s: number, a: any) => s + (a.total_students || 0), 0))) * 100) : 0;
    const totalSubmitted = assignments.reduce((s: number, a: any) => s + (a.submitted_count || 0), 0);
    const totalStudents = assignments.reduce((s: number, a: any) => s + (a.total_students || 0), 0);
    const submissionRate = totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0;
    const avgScore = assignments.reduce((s: number, a: any) => s + Number(a.avg_score || 0), 0) / Math.max(1, gradedAssignments);

    const prevCount = prevAssignments.length;
    const assignmentGrowth = prevCount > 0 ? ((totalAssignments - prevCount) / prevCount * 100).toFixed(1) : '0';

    const recentAssignments = await this.getRecentAssignments(orgId, 5);
    const upcomingDeadlines = await this.getUpcomingDeadlines(orgId, 5);
    const monthlyTrend = await this.getMonthlyTrend(orgId);
    const subjectPerformance = await this.getSubjectPerformance(orgId);

    return {
      summary: { totalAssignments, activeAssignments, closedAssignments, draftAssignments, overdueAssignments, submittedCount, pendingSubmissions, gradedCount, gradedAssignments, avgSubmissionRate, submissionRate, avgScore: avgScore.toFixed(1) },
      trends: { assignmentGrowth, submissionRate, avgScore: avgScore.toFixed(1) },
      recentAssignments,
      upcomingDeadlines,
      monthlyTrend,
      subjectPerformance,
    };
  }

  async getAssignments(orgId: string, filters: any) {
    let query = supabase.from('assignments').select('*, subject:subjects(*), class:classes!assignments_class_id_fkey(*), teacher:staff_records(*)', { count: 'exact' }).eq('organisation_id', orgId);
    if (filters.class_id) query = query.eq('class_id', filters.class_id);
    if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
    if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.assignment_type) query = query.eq('assignment_type', filters.assignment_type);
    if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
    if (filters.from) query = query.gte('due_date', filters.from);
    if (filters.to) query = query.lte('due_date', filters.to);
    if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async getAssignmentById(assignmentId: string) {
    const { data, error } = await supabase.from('assignments').select('*, subject:subjects(*), class:classes!assignments_class_id_fkey(*), teacher:staff_records(*)').eq('id', assignmentId).single();
    if (error) throw error;
    const { data: submissions } = await supabase.from('assignment_submissions').select('*, student:students(*)').eq('assignment_id', assignmentId).order('submitted_at', { ascending: false });
    const { data: rubrics } = await supabase.from('assignment_rubrics').select('*').eq('assignment_id', assignmentId);
    return { ...data, submissions: submissions || [], rubrics: rubrics || [] };
  }

  async createAssignment(orgId: string, body: any) {
    const payload: any = { organisation_id: orgId, ...body };
    if (!payload.status) payload.status = 'draft';
    if (!payload.assignment_type) payload.assignment_type = 'homework';
    if (!payload.difficulty) payload.difficulty = 'medium';
    if (!payload.max_score) payload.max_score = 100;
    if (!payload.passing_score) payload.passing_score = 40;
    if (body.attachment_urls && typeof body.attachment_urls === 'string') payload.attachment_urls = JSON.parse(body.attachment_urls);
    const { data, error } = await supabase.from('assignments').insert(payload).select('*, subject:subjects(*), class:classes!assignments_class_id_fkey(*), teacher:staff_records(*)').single();
    if (error) throw error;
    await this.logActivity(orgId, data.id, 'assignment_created', 'system', { title: payload.title });
    return data;
  }

  async updateAssignment(assignmentId: string, body: any) {
    if (body.attachment_urls && typeof body.attachment_urls === 'string') body.attachment_urls = JSON.parse(body.attachment_urls);
    const { data, error } = await supabase.from('assignments').update(body).eq('id', assignmentId).select('*, subject:subjects(*), class:classes!assignments_class_id_fkey(*), teacher:staff_records(*)').single();
    if (error) throw error;
    return data;
  }

  async deleteAssignment(assignmentId: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
    if (error) throw error;
    return true;
  }

  async publishAssignment(assignmentId: string) {
    const { data, error } = await supabase.from('assignments').update({
      status: 'active', is_published: true, published_at: new Date().toISOString(),
    }).eq('id', assignmentId).select('*, class:classes!assignments_class_id_fkey(*)').single();
    if (error) throw error;
    await this.logActivity(data.organisation_id, assignmentId, 'assignment_published', 'system', { title: data.title });
    return data;
  }

  async closeAssignment(assignmentId: string) {
    const { data, error } = await supabase.from('assignments').update({ status: 'closed' }).eq('id', assignmentId).select().single();
    if (error) throw error;
    return data;
  }

  async duplicateAssignment(assignmentId: string) {
    const { data: orig, error } = await supabase.from('assignments').select('*').eq('id', assignmentId).single();
    if (error || !orig) throw new BadRequestError('Assignment not found');
    const { data, error: insError } = await supabase.from('assignments').insert({
      organisation_id: orig.organisation_id, teacher_id: orig.teacher_id, subject_id: orig.subject_id, class_id: orig.class_id,
      title: `${orig.title} (Copy)`, description: orig.description, due_date: orig.due_date,
      max_score: orig.max_score, instructions: orig.instructions,
      academic_year: orig.academic_year, assignment_type: orig.assignment_type, difficulty: orig.difficulty,
      attachment_urls: orig.attachment_urls, status: 'draft',
    }).select().single();
    if (insError) throw insError;
    return data;
  }

  async getSubmissions(orgId: string, filters: any) {
    let query = supabase.from('assignment_submissions').select('*, assignment:assignments(*), student:students(*)', { count: 'exact' }).eq('organisation_id', orgId);
    if (filters.assignment_id) query = query.eq('assignment_id', filters.assignment_id);
    if (filters.student_id) query = query.eq('student_id', filters.student_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.is_late !== undefined) query = query.eq('is_late', filters.is_late === 'true');
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to).order('submitted_at', { ascending: false });
    if (error) throw error;
    return { data: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async gradeSubmission(submissionId: string, body: any) {
    const { grade, feedback, rubric_scores } = body;
    const { data: sub, error: subErr } = await supabase.from('assignment_submissions').select('*, assignment:assignments(*)').eq('id', submissionId).single();
    if (subErr || !sub) throw new BadRequestError('Submission not found');

    const payload: any = { grade, feedback, status: 'graded', graded_at: new Date().toISOString() };
    if (rubric_scores) payload.grading_rubric = rubric_scores;

    const { data, error } = await supabase.from('assignment_submissions').update(payload).eq('id', submissionId).select('*, assignment:assignments(*), student:students(*)').single();
    if (error) throw error;

    const { data: gradedList } = await supabase.from('assignment_submissions').select('grade').eq('assignment_id', sub.assignment_id).eq('status', 'graded');
    const grades = (gradedList || []).map((g: any) => Number(g.grade)).filter((g: number) => !isNaN(g));
    const avg = grades.length > 0 ? grades.reduce((s: number, g: number) => s + g, 0) / grades.length : 0;

    await supabase.from('assignments').update({
      graded_count: grades.length,
      avg_score: Math.round(avg * 100) / 100,
    }).eq('id', sub.assignment_id);

    await this.logActivity(sub.organisation_id, sub.assignment_id, 'submission_graded', 'system', { submission_id: submissionId, grade });
    return data;
  }

  async bulkGrade(orgId: string, body: any) {
    const { assignment_id, grades } = body;
    if (!assignment_id || !grades || !Array.isArray(grades)) throw new BadRequestError('Invalid bulk grade data');
    const results: any[] = [];
    for (const g of grades) {
      if (g.submission_id && g.grade !== undefined) {
        try {
          const r = await this.gradeSubmission(g.submission_id, g);
          results.push(r);
        } catch (e: any) {
          results.push({ submission_id: g.submission_id, error: e.message });
        }
      }
    }
    return { graded: results.length };
  }

  async publishGrades(assignmentId: string) {
    const { data, error } = await supabase.from('assignment_submissions').update({ status: 'returned' }).eq('assignment_id', assignmentId).eq('status', 'graded');
    if (error) throw error;
    await this.logActivity('', assignmentId, 'grades_published', 'system', {});
    return { published: (data || []).length };
  }

  async getStudentPerformance(orgId: string, studentId: string) {
    const { data: submissions } = await supabase.from('assignment_submissions').select('*, assignment:assignments(*)').eq('organisation_id', orgId).eq('student_id', studentId).order('submitted_at', { ascending: false });
    const items = submissions || [];
    const total = items.length;
    const graded = items.filter((s: any) => s.status === 'graded' || s.status === 'returned');
    const avgGrade = graded.length > 0 ? graded.reduce((s: number, g: any) => s + Number(g.grade || 0), 0) / graded.length : 0;
    const submitted = items.filter((s: any) => s.status !== 'draft').length;
    const late = items.filter((s: any) => s.is_late).length;
    const onTime = submitted - late;
    const subjectBreakdown: Record<string, { count: number; totalGrade: number }> = {};
    items.forEach((s: any) => {
      const subj = s.assignment?.subject_id || 'unknown';
      if (!subjectBreakdown[subj]) subjectBreakdown[subj] = { count: 0, totalGrade: 0 };
      subjectBreakdown[subj].count += 1;
      if (s.grade) subjectBreakdown[subj].totalGrade += Number(s.grade);
    });
    return {
      totalAssignments: total, submitted, graded: graded.length, pending: total - submitted,
      avgGrade: avgGrade.toFixed(1), lateSubmissions: late, onTimeSubmissions: onTime,
      subjectPerformance: Object.entries(subjectBreakdown).map(([subject_id, data]) => ({ subject_id, average: data.count > 0 ? (data.totalGrade / data.count).toFixed(1) : 0, count: data.count })),
      recentSubmissions: items.slice(0, 10),
    };
  }

  async getAnalytics(orgId: string) {
    const [monthlyTrend, subjectPerformance, classPerformance, gradeDist, participation, difficultyAnalysis, monthlyStats] = await Promise.all([
      this.getMonthlyTrend(orgId),
      this.getSubjectPerformance(orgId),
      this.getClassPerformance(orgId),
      this.getGradeDistribution(orgId),
      this.getParticipationRate(orgId),
      this.getDifficultyAnalysis(orgId),
      this.getMonthlyStats(orgId),
    ]);
    return { monthlyTrend, subjectPerformance, classPerformance, gradeDistribution: gradeDist, participationRate: participation, difficultyAnalysis, monthlyStats };
  }

  async getAiInsights(orgId: string) {
    const [atRiskStudents, lowSubmissionClasses, completionRate, recommendations] = await Promise.all([
      this.getAtRiskStudents(orgId),
      this.getLowSubmissionClasses(orgId),
      this.getCompletionRate(orgId),
      this.getRecommendations(orgId),
    ]);
    return { atRiskStudents, lowSubmissionClasses, completionRate, recommendations };
  }

  async getRubrics(assignmentId: string) {
    const { data, error } = await supabase.from('assignment_rubrics').select('*').eq('assignment_id', assignmentId).order('created_at');
    if (error) throw error;
    return data || [];
  }

  async saveRubrics(orgId: string, assignmentId: string, rubrics: any[]) {
    await supabase.from('assignment_rubrics').delete().eq('assignment_id', assignmentId);
    if (rubrics.length > 0) {
      const entries = rubrics.map((r: any) => ({ organisation_id: orgId, assignment_id: assignmentId, ...r }));
      const { error } = await supabase.from('assignment_rubrics').insert(entries);
      if (error) throw error;
    }
    return this.getRubrics(assignmentId);
  }

  async getReports(orgId: string, type: string, filters: any) {
    switch (type) {
      case 'assignment': {
        const { data } = await supabase.from('assignments').select('*, subject:subjects(name), class:classes!assignments_class_id_fkey(name), teacher:staff_records(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
        return { assignments: data || [], total: (data || []).length };
      }
      case 'submission': {
        const { data } = await supabase.from('assignment_submissions').select('*, assignment:assignments(title), student:students(full_name, roll_number)').eq('organisation_id', orgId).order('submitted_at', { ascending: false });
        const total = (data || []).length;
        const submitted = (data || []).filter((s: any) => s.status !== 'draft').length;
        const graded = (data || []).filter((s: any) => s.status === 'graded' || s.status === 'returned').length;
        return { submissions: data || [], total, submitted, graded, pending: total - submitted };
      }
      case 'student-performance': {
        return this.getStudentPerformanceReport(orgId);
      }
      case 'class-performance': {
        return this.getClassPerformanceReport(orgId);
      }
      default:
        throw new BadRequestError('Unknown report type');
    }
  }

  async exportReport(orgId: string, type: string, format: string) {
    const data = await this.getReports(orgId, type, {});
    return { data, format, generatedAt: new Date().toISOString() };
  }

  private async getRecentAssignments(orgId: string, limit: number) {
    const { data } = await supabase.from('assignments').select('title, status, due_date, subject:subjects(name), class:classes!assignments_class_id_fkey(name)').eq('organisation_id', orgId).order('created_at', { ascending: false }).limit(limit);
    return data || [];
  }

  private async getUpcomingDeadlines(orgId: string, limit: number) {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('assignments').select('title, due_date, status, subject:subjects(name), class:classes!assignments_class_id_fkey(name)').eq('organisation_id', orgId).eq('status', 'active').gte('due_date', today).order('due_date', { ascending: true }).limit(limit);
    return (data || []).map((a: any) => {
      const due = new Date(a.due_date);
      const now = new Date();
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      return { ...a, remainingDays: diffDays, remainingLabel: diffDays <= 0 ? 'Due today' : diffDays === 1 ? '1 day left' : `${diffDays} days left` };
    });
  }

  private async getMonthlyTrend(orgId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { data } = await supabase.from('assignments').select('created_at, status').eq('organisation_id', orgId).gte('created_at', sixMonthsAgo.toISOString());
    const grouped: Record<string, { created: number; closed: number }> = {};
    (data || []).forEach((a: any) => {
      const month = a.created_at?.substring(0, 7);
      if (!month) return;
      if (!grouped[month]) grouped[month] = { created: 0, closed: 0 };
      grouped[month].created += 1;
      if (a.status === 'closed') grouped[month].closed += 1;
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([month, counts]) => ({ month, ...counts }));
  }

  private async getSubjectPerformance(orgId: string) {
    const { data } = await supabase.from('assignments').select('subject_id, subject:subjects(name), avg_score, submitted_count, total_students').eq('organisation_id', orgId).not('avg_score', 'is', null);
    const grouped: Record<string, { name: string; totalScore: number; count: number; totalSubmitted: number; totalStudents: number }> = {};
    (data || []).forEach((a: any) => {
      const sid = a.subject_id;
      if (!sid) return;
      if (!grouped[sid]) grouped[sid] = { name: a.subject?.name || 'Unknown', totalScore: 0, count: 0, totalSubmitted: 0, totalStudents: 0 };
      grouped[sid].totalScore += Number(a.avg_score || 0);
      grouped[sid].count += 1;
      grouped[sid].totalSubmitted += a.submitted_count || 0;
      grouped[sid].totalStudents += a.total_students || 0;
    });
    return Object.entries(grouped).map(([subject_id, data]) => ({
      subject_id, subject_name: data.name, avgScore: data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0,
      submissionRate: data.totalStudents > 0 ? Math.round((data.totalSubmitted / data.totalStudents) * 100) : 0, count: data.count,
    }));
  }

  private async getClassPerformance(orgId: string) {
    const { data } = await supabase.from('assignments').select('class_id, class:classes!assignments_class_id_fkey(name), avg_score, submitted_count, total_students').eq('organisation_id', orgId).not('avg_score', 'is', null);
    const grouped: Record<string, { name: string; totalScore: number; count: number; totalSubmitted: number; totalStudents: number }> = {};
    (data || []).forEach((a: any) => {
      const cid = a.class_id;
      if (!cid) return;
      if (!grouped[cid]) grouped[cid] = { name: a.class?.name || 'Unknown', totalScore: 0, count: 0, totalSubmitted: 0, totalStudents: 0 };
      grouped[cid].totalScore += Number(a.avg_score || 0);
      grouped[cid].count += 1;
      grouped[cid].totalSubmitted += a.submitted_count || 0;
      grouped[cid].totalStudents += a.total_students || 0;
    });
    return Object.entries(grouped).map(([class_id, data]) => ({
      class_id, class_name: data.name, avgScore: data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0,
      submissionRate: data.totalStudents > 0 ? Math.round((data.totalSubmitted / data.totalStudents) * 100) : 0, count: data.count,
    }));
  }

  private async getGradeDistribution(orgId: string) {
    const { data } = await supabase.from('assignment_submissions').select('grade').eq('organisation_id', orgId).not('grade', 'is', null);
    const grades = (data || []).map((s: any) => Number(s.grade)).filter((g: number) => !isNaN(g));
    const ranges = [
      { label: 'A (90-100)', min: 90, max: 100, count: 0 },
      { label: 'B (75-89)', min: 75, max: 89, count: 0 },
      { label: 'C (60-74)', min: 60, max: 74, count: 0 },
      { label: 'D (40-59)', min: 40, max: 59, count: 0 },
      { label: 'F (0-39)', min: 0, max: 39, count: 0 },
    ];
    grades.forEach((g: number) => {
      const range = ranges.find(r => g >= r.min && g <= r.max);
      if (range) range.count += 1;
    });
    return ranges.map(r => ({ ...r, percentage: grades.length > 0 ? Math.round((r.count / grades.length) * 100) : 0 }));
  }

  private async getParticipationRate(orgId: string) {
    const { data } = await supabase.from('assignments').select('total_students, submitted_count').eq('organisation_id', orgId);
    const total = (data || []).reduce((s: number, a: any) => s + (a.total_students || 0), 0);
    const submitted = (data || []).reduce((s: number, a: any) => s + (a.submitted_count || 0), 0);
    return { total, submitted, rate: total > 0 ? Math.round((submitted / total) * 100) : 0 };
  }

  private async getDifficultyAnalysis(orgId: string) {
    const { data } = await supabase.from('assignments').select('difficulty, avg_score').eq('organisation_id', orgId).not('avg_score', 'is', null);
    const grouped: Record<string, { totalScore: number; count: number }> = {};
    (data || []).forEach((a: any) => {
      const d = a.difficulty || 'medium';
      if (!grouped[d]) grouped[d] = { totalScore: 0, count: 0 };
      grouped[d].totalScore += Number(a.avg_score || 0);
      grouped[d].count += 1;
    });
    return Object.entries(grouped).map(([difficulty, data]) => ({
      difficulty, avgScore: data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0, count: data.count,
    }));
  }

  private async getMonthlyStats(orgId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { data } = await supabase.from('assignments').select('created_at, status, total_students, submitted_count').eq('organisation_id', orgId).gte('created_at', sixMonthsAgo.toISOString());
    const grouped: Record<string, { count: number; totalStudents: number; submitted: number }> = {};
    (data || []).forEach((a: any) => {
      const month = a.created_at?.substring(0, 7);
      if (!month) return;
      if (!grouped[month]) grouped[month] = { count: 0, totalStudents: 0, submitted: 0 };
      grouped[month].count += 1;
      grouped[month].totalStudents += a.total_students || 0;
      grouped[month].submitted += a.submitted_count || 0;
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => ({
      month, count: data.count, totalStudents: data.totalStudents, submitted: data.submitted,
      rate: data.totalStudents > 0 ? Math.round((data.submitted / data.totalStudents) * 100) : 0,
    }));
  }

  private async getAtRiskStudents(orgId: string) {
    const { data } = await supabase.from('assignment_submissions').select('student_id, student:students(full_name, roll_number), status, grade, is_late').eq('organisation_id', orgId);
    const grouped: Record<string, { student: any; total: number; missing: number; late: number; avgGrade: number; graded: number }> = {};
    (data || []).forEach((s: any) => {
      const sid = s.student_id;
      if (!sid) return;
      if (!grouped[sid]) grouped[sid] = {
        student: s.student || { full_name: sid.slice(0, 8) }, total: 0, missing: 0, late: 0, avgGrade: 0, graded: 0,
      };
      grouped[sid].total += 1;
      if (s.status === 'draft') grouped[sid].missing += 1;
      if (s.is_late) grouped[sid].late += 1;
      if (s.grade) { grouped[sid].avgGrade += Number(s.grade); grouped[sid].graded += 1; }
    });
    return Object.entries(grouped).map(([student_id, data]) => ({
      student_id, student_name: data.student?.full_name, roll_number: data.student?.roll_number,
      total: data.total, missing: data.missing, late: data.late,
      avgGrade: data.graded > 0 ? (data.avgGrade / data.graded).toFixed(1) : 0,
      riskScore: Math.round((data.missing / Math.max(1, data.total)) * 100),
    })).filter((s: any) => s.riskScore > 30).sort((a: any, b: any) => b.riskScore - a.riskScore);
  }

  private async getLowSubmissionClasses(orgId: string) {
    const { data } = await supabase.from('assignments').select('class_id, class:classes!assignments_class_id_fkey(name), total_students, submitted_count').eq('organisation_id', orgId);
    const grouped: Record<string, { name: string; total: number; submitted: number }> = {};
    (data || []).forEach((a: any) => {
      const cid = a.class_id;
      if (!cid) return;
      if (!grouped[cid]) grouped[cid] = { name: a.class?.name || 'Unknown', total: 0, submitted: 0 };
      grouped[cid].total += a.total_students || 0;
      grouped[cid].submitted += a.submitted_count || 0;
    });
    return Object.entries(grouped).map(([class_id, data]) => ({
      class_id, class_name: data.name,
      rate: data.total > 0 ? Math.round((data.submitted / data.total) * 100) : 0,
      total: data.total, submitted: data.submitted,
    })).filter((c: any) => c.rate < 60).sort((a: any, b: any) => a.rate - b.rate);
  }

  private async getCompletionRate(orgId: string) {
    const { data } = await supabase.from('assignments').select('total_students, submitted_count, graded_count').eq('organisation_id', orgId);
    const totalStudents = (data || []).reduce((s: number, a: any) => s + (a.total_students || 0), 0);
    const submitted = (data || []).reduce((s: number, a: any) => s + (a.submitted_count || 0), 0);
    const graded = (data || []).reduce((s: number, a: any) => s + (a.graded_count || 0), 0);
    return {
      submissionRate: totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0,
      gradingRate: submitted > 0 ? Math.round((graded / submitted) * 100) : 0,
      totalStudents, submitted, graded,
    };
  }

  private async getRecommendations(orgId: string) {
    const { data: lowPerf } = await supabase.from('assignments').select('title, subject:subjects(name), avg_score').eq('organisation_id', orgId).not('avg_score', 'is', null).lte('avg_score', 50).order('avg_score', { ascending: true }).limit(5);
    const { data: upcoming } = await supabase.from('assignments').select('title, due_date').eq('organisation_id', orgId).eq('status', 'active').gte('due_date', new Date().toISOString().split('T')[0]).order('due_date', { ascending: true }).limit(3);
    return {
      lowPerformingAssignments: lowPerf || [],
      upcomingDeadlines: upcoming || [],
      suggestions: [
        'Consider extending deadlines for low-submission assignments',
        'Send reminders for upcoming due dates',
        'Review grading rubrics for consistency',
        'Encourage peer review for submitted assignments',
      ],
    };
  }

  private async getStudentPerformanceReport(orgId: string) {
    const { data: submissions } = await supabase.from('assignment_submissions').select('student_id, student:students(full_name, roll_number), status, grade, is_late').eq('organisation_id', orgId);
    const grouped: Record<string, any> = {};
    (submissions || []).forEach((s: any) => {
      const sid = s.student_id;
      if (!sid) return;
      if (!grouped[sid]) grouped[sid] = { student_id: sid, student_name: s.student?.full_name, roll_number: s.student?.roll_number, total: 0, submitted: 0, graded: 0, avgGrade: 0, late: 0 };
      grouped[sid].total += 1;
      if (s.status !== 'draft') grouped[sid].submitted += 1;
      if (s.status === 'graded' || s.status === 'returned') { grouped[sid].graded += 1; grouped[sid].avgGrade += Number(s.grade || 0); }
      if (s.is_late) grouped[sid].late += 1;
    });
    return Object.values(grouped).map((s: any) => ({ ...s, avgGrade: s.graded > 0 ? (s.avgGrade / s.graded).toFixed(1) : 0 }));
  }

  private async getClassPerformanceReport(orgId: string) {
    const { data } = await supabase.from('assignments').select('class_id, class:classes!assignments_class_id_fkey(name), total_students, submitted_count, graded_count, avg_score').eq('organisation_id', orgId);
    const grouped: Record<string, any> = {};
    (data || []).forEach((a: any) => {
      const cid = a.class_id;
      if (!cid) return;
      if (!grouped[cid]) grouped[cid] = { class_id: cid, class_name: a.class?.name, totalAssignments: 0, totalStudents: 0, totalSubmitted: 0, totalGraded: 0, totalScore: 0, avgCount: 0 };
      grouped[cid].totalAssignments += 1;
      grouped[cid].totalStudents += a.total_students || 0;
      grouped[cid].totalSubmitted += a.submitted_count || 0;
      grouped[cid].totalGraded += a.graded_count || 0;
      if (a.avg_score) { grouped[cid].totalScore += Number(a.avg_score); grouped[cid].avgCount += 1; }
    });
    return Object.values(grouped).map((c: any) => ({
      ...c, avgScore: c.avgCount > 0 ? (c.totalScore / c.avgCount).toFixed(1) : 0,
      submissionRate: c.totalStudents > 0 ? Math.round((c.totalSubmitted / c.totalStudents) * 100) : 0,
    }));
  }

  private async logActivity(orgId: string, assignmentId: string, action: string, performedBy: string, details: any) {
    if (!orgId) return;
    await supabase.from('assignment_activity_log').insert({
      organisation_id: orgId, assignment_id: assignmentId, action, performed_by: performedBy, details,
    });
  }
}

export const assignmentService = new AssignmentService();
