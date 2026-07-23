import { supabase } from '../config/database';

export class AcademicAnalyticsService {
  async getDashboard(orgId: string) {
    const [
      gradesRes, examsRes, attendanceRes, assignmentsRes,
      studentsRes, classesRes,
    ] = await Promise.all([
      supabase.from('grades').select('id, grade, score, subject_id').eq('organisation_id', orgId),
      supabase.from('exam_results').select('id, marks_obtained, total_marks, subject_id, exam_id').eq('organisation_id', orgId),
      supabase.from('attendance_records').select('id, status, date, student_id').eq('organisation_id', orgId),
      supabase.from('assignment_submissions').select('id, grade, status, is_late').eq('organisation_id', orgId),
      supabase.from('students').select('id, status').eq('organisation_id', orgId),
      supabase.from('classes').select('id, name').eq('organisation_id', orgId),
    ]);

    const grades = gradesRes.data || [];
    const examResults = examsRes.data || [];
    const attendance = attendanceRes.data || [];
    const submissions = assignmentsRes.data || [];
    const students = studentsRes.data || [];
    const classes = classesRes.data || [];

    const activeStudents = students.filter((s: any) => s.status === 'active');
    const totalStudents = activeStudents.length;

    const avgGradeScore = grades.length > 0
      ? grades.reduce((s: number, g: any) => s + Number(g.score || 0), 0) / grades.length : 0;

    const examScores = examResults.map((r: any) => ({
      pct: Number(r.total_marks) > 0 ? (Number(r.marks_obtained) / Number(r.total_marks)) * 100 : 0,
    }));
    const avgExamScore = examScores.length > 0
      ? examScores.reduce((s: number, r: any) => s + r.pct, 0) / examScores.length : 0;

    const passThreshold = 40;
    const passed = examScores.filter((r: any) => r.pct >= passThreshold).length;
    const passPct = examScores.length > 0 ? Math.round((passed / examScores.length) * 100) : 0;

    const presentCount = attendance.filter((a: any) => a.status === 'present').length;
    const totalAttendance = attendance.length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const submittedCount = submissions.filter((s: any) => s.status !== 'draft').length;
    const submissionRate = submissions.length > 0 ? Math.round((submittedCount / submissions.length) * 100) : 0;

    const gradedSubs = submissions.filter((s: any) => s.status === 'graded' || s.status === 'returned');
    const avgAssignmentScore = gradedSubs.length > 0
      ? gradedSubs.reduce((s: number, sb: any) => s + Number(sb.grade || 0), 0) / gradedSubs.length : 0;

    const atRiskAttendance = totalAttendance > 0
      ? students.filter((s: any) => {
        const stuAttendance = attendance.filter((a: any) => a.student_id === s.id);
        const stuPresent = stuAttendance.filter((a: any) => a.status === 'present').length;
        return stuAttendance.length > 0 && (stuPresent / stuAttendance.length) < 0.75;
      }).length : 0;

    const subjectPerf = await this.getSubjectPerformance(orgId);
    const classPerf = await this.getClassPerformance(orgId);
    const studentList = await this.getStudentAnalytics(orgId, {});
    const topStudents = [...studentList].sort((a: any, b: any) => (b.avgScore || 0) - (a.avgScore || 0)).slice(0, 5);
    const trend = await this.getPerformanceTrend(orgId);
    const gradeDist = await this.getGradeDistribution(orgId);
    const monthlyTrend = await this.getMonthlyTrend(orgId);

    const overallScore = (avgGradeScore * 0.25 + avgExamScore * 0.35 + avgAssignmentScore * 0.2 + attendanceRate * 0.2);

    return {
      summary: {
        avgAcademicScore: Math.round(overallScore),
        passPercentage: passPct,
        avgExamScore: Math.round(avgExamScore),
        avgGradeScore: Math.round(avgGradeScore),
        avgAssignmentScore: Math.round(avgAssignmentScore),
        attendanceRate,
        submissionRate,
        totalStudents,
        passRate: passPct,
        atRiskStudents: atRiskAttendance,
        topPerformingClass: classPerf.sort((a: any, b: any) => b.avgScore - a.avgScore)[0]?.class_name || '—',
        academicGrowthRate: trend.length > 1 ? ((trend[trend.length - 1].avgScore - trend[0].avgScore) / Math.max(1, trend[0].avgScore) * 100).toFixed(1) : '0',
      },
      subjectPerformance: subjectPerf,
      classPerformance: classPerf,
      studentAnalytics: studentList.slice(0, 50),
      topStudents,
      performanceTrend: trend,
      gradeDistribution: gradeDist,
      monthlyTrend,
      totalStudents,
    };
  }

  async getStudentAnalytics(orgId: string, filters: any) {
    const [studentsRes, gradesRes, examsRes, attendanceRes, subsRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, class_id, organisation_id').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('grades').select('student_id, score, grade'),
      supabase.from('exam_results').select('student_id, marks_obtained, total_marks'),
      supabase.from('attendance_records').select('student_id, status'),
      supabase.from('assignment_submissions').select('student_id, grade, status'),
    ]);

    const students = studentsRes.data || [];
    const allGrades = gradesRes.data || [];
    const allExams = examsRes.data || [];
    const allAttendance = attendanceRes.data || [];
    const allSubs = subsRes.data || [];

    return students.map((s: any) => {
      const sGrades = allGrades.filter((g: any) => g.student_id === s.id);
      const sExams = allExams.filter((e: any) => e.student_id === s.id);
      const sAttendance = allAttendance.filter((a: any) => a.student_id === s.id);
      const sSubs = allSubs.filter((sb: any) => sb.student_id === s.id);

      const avgGrade = sGrades.length > 0 ? sGrades.reduce((sum: number, g: any) => sum + Number(g.score || 0), 0) / sGrades.length : 0;
      const examPcts = sExams.map((e: any) => Number(e.total_marks) > 0 ? (Number(e.marks_obtained) / Number(e.total_marks)) * 100 : 0);
      const avgExam = examPcts.length > 0 ? examPcts.reduce((s: number, p: number) => s + p, 0) / examPcts.length : 0;
      const present = sAttendance.filter((a: any) => a.status === 'present').length;
      const attPct = sAttendance.length > 0 ? Math.round((present / sAttendance.length) * 100) : 0;
      const graded = sSubs.filter((sb: any) => sb.grade != null);
      const avgAssignment = graded.length > 0 ? graded.reduce((sum: number, sb: any) => sum + Number(sb.grade), 0) / graded.length : 0;
      const overallGpa = (avgGrade * 0.3 + avgExam * 0.4 + avgAssignment * 0.3) / 25;

      const riskLevel = attPct < 75 || overallGpa < 1.5 ? 'high' : attPct < 85 || overallGpa < 2.0 ? 'medium' : 'low';
      const growth = sGrades.length > 1 ? ((avgGrade - Number(sGrades[0]?.score || 0)) / Math.max(1, Number(sGrades[0]?.score || 1)) * 100).toFixed(1) : '0';

      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!s.full_name?.toLowerCase().includes(q) && !s.roll_number?.toLowerCase().includes(q)) return null;
      }

      return {
        id: s.id, full_name: s.full_name, roll_number: s.roll_number, class_id: s.class_id,
        avgGrade: Math.round(avgGrade), avgExamScore: Math.round(avgExam),
        attendancePct: attPct, avgAssignmentScore: Math.round(avgAssignment),
        gpa: overallGpa.toFixed(2), growth: Number(growth), riskLevel,
        totalExams: sExams.length, totalAssignments: sSubs.length, gradedAssignments: graded.length,
      };
    }).filter(Boolean);
  }

  async getClassAnalytics(orgId: string) {
    return this.getClassPerformance(orgId);
  }

  async getSubjectAnalytics(orgId: string) {
    return this.getSubjectPerformance(orgId);
  }

  async getExamAnalytics(orgId: string) {
    const { data: exams } = await supabase.from('exams').select('id, title, exam_type, total_marks').eq('organisation_id', orgId);
    const examIds = (exams || []).map((e: any) => e.id);
    if (examIds.length === 0) return [];

    const { data: results } = await supabase.from('exam_results').select('exam_id, marks_obtained, total_marks')
      .in('exam_id', examIds.length > 0 ? examIds : ['none']);
    const grouped: Record<string, { scores: number[]; total: number }> = {};
    (results || []).forEach((r: any) => {
      if (!grouped[r.exam_id]) grouped[r.exam_id] = { scores: [], total: 0 };
      const pct = Number(r.total_marks) > 0 ? (Number(r.marks_obtained) / Number(r.total_marks)) * 100 : 0;
      grouped[r.exam_id].scores.push(pct);
      grouped[r.exam_id].total += 1;
    });
    return (exams || []).map((e: any) => {
      const g = grouped[e.id];
      const avg = g && g.scores.length > 0 ? g.scores.reduce((s: number, p: number) => s + p, 0) / g.scores.length : 0;
      return {
        exam_id: e.id, exam_title: e.title, exam_type: e.exam_type, total_marks: e.total_marks,
        avgScore: Math.round(avg), passRate: g ? Math.round((g.scores.filter((s: number) => s >= 40).length / g.scores.length) * 100) : 0,
        totalStudents: g?.total || 0,
      };
    });
  }

  async getAttendanceAnalytics(orgId: string) {
    const { data: attendance } = await supabase.from('attendance_records').select('status, date').eq('organisation_id', orgId);
    const records = attendance || [];
    const total = records.length;
    const present = records.filter((r: any) => r.status === 'present').length;
    const absent = records.filter((r: any) => r.status === 'absent').length;
    const late = records.filter((r: any) => r.status === 'late').length;
    const halfDay = records.filter((r: any) => r.status === 'half_day').length;

    const grouped: Record<string, { present: number; total: number }> = {};
    records.forEach((r: any) => {
      const month = r.date?.substring(0, 7);
      if (!month) return;
      if (!grouped[month]) grouped[month] = { present: 0, total: 0 };
      grouped[month].total += 1;
      if (r.status === 'present') grouped[month].present += 1;
    });
    const monthlyTrend = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0 }));

    return {
      summary: { total, present, absent, late, halfDay, rate: total > 0 ? Math.round((present / total) * 100) : 0 },
      monthlyTrend,
    };
  }

  async getAiInsights(orgId: string) {
    const [studentsRes, attendanceRes, subsRes, examsRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('attendance_records').select('student_id, status'),
      supabase.from('assignment_submissions').select('student_id, grade, status'),
      supabase.from('exam_results').select('student_id, marks_obtained, total_marks'),
    ]);

    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];
    const submissions = subsRes.data || [];
    const examResults = examsRes.data || [];

    const atRisk = students.map((s: any) => {
      const sAtt = attendance.filter((a: any) => a.student_id === s.id);
      const sSubs = submissions.filter((sb: any) => sb.student_id === s.id);
      const sExams = examResults.filter((e: any) => e.student_id === s.id);
      const present = sAtt.filter((a: any) => a.status === 'present').length;
      const attPct = sAtt.length > 0 ? Math.round((present / sAtt.length) * 100) : 0;
      const examPcts = sExams.map((e: any) => Number(e.total_marks) > 0 ? (Number(e.marks_obtained) / Number(e.total_marks)) * 100 : 0);
      const avgExam = examPcts.length > 0 ? examPcts.reduce((s: number, p: number) => s + p, 0) / examPcts.length : 0;
      const graded = sSubs.filter((sb: any) => sb.grade != null);
      const avgAssign = graded.length > 0 ? graded.reduce((s: number, sb: any) => s + Number(sb.grade), 0) / graded.length : 0;
      const overallScore = (attPct * 0.2 + avgExam * 0.5 + avgAssign * 0.3);

      return {
        student_id: s.id, student_name: s.full_name, roll_number: s.roll_number,
        attendanceRate: attPct, avgExamScore: Math.round(avgExam), avgAssignmentScore: Math.round(avgAssign),
        overallScore: Math.round(overallScore),
        riskLevel: overallScore < 40 ? 'critical' : overallScore < 55 ? 'high' : overallScore < 70 ? 'medium' : 'low',
        missingAssignments: sSubs.filter((sb: any) => sb.status === 'draft').length,
        lateSubmissions: sSubs.filter((sb: any) => sb.is_late).length,
      };
    }).filter((s: any) => s.riskLevel === 'high' || s.riskLevel === 'critical')
      .sort((a: any, b: any) => a.overallScore - b.overallScore);

    const predictedFailures = atRisk.filter((s: any) => s.riskLevel === 'critical').length;

    const improvementSuggestions = [
      'Increase attendance monitoring for at-risk students',
      'Provide additional tutoring for low-performing subjects',
      'Implement early warning system for attendance drops',
      'Create personalized study plans based on weak areas',
    ];

    return {
      atRiskStudents: atRisk.slice(0, 20),
      predictedFailures,
      improvementSuggestions,
      totalAtRisk: atRisk.length,
    };
  }

  async getReports(orgId: string, type: string) {
    switch (type) {
      case 'student-performance': {
        const students = await this.getStudentAnalytics(orgId, {});
        return { students, total: students.length };
      }
      case 'class-performance': {
        const classes = await this.getClassPerformance(orgId);
        return { classes, total: classes.length };
      }
      case 'subject-performance': {
        const subjects = await this.getSubjectPerformance(orgId);
        return { subjects, total: subjects.length };
      }
      case 'examination': {
        const exams = await this.getExamAnalytics(orgId);
        return { exams, total: exams.length };
      }
      default: {
        const dash = await this.getDashboard(orgId);
        return dash;
      }
    }
  }

  async exportReport(orgId: string, type: string, format: string) {
    const data = await this.getReports(orgId, type);
    return { data, format, generatedAt: new Date().toISOString() };
  }

  private async getSubjectPerformance(orgId: string) {
    const [subjectsRes, gradesRes, examsRes] = await Promise.all([
      supabase.from('subjects').select('id, name').eq('organisation_id', orgId),
      supabase.from('grades').select('subject_id, score'),
      supabase.from('exam_results').select('subject_id, marks_obtained, total_marks'),
    ]);
    const subjects = subjectsRes.data || [];
    const allGrades = gradesRes.data || [];
    const allExams = examsRes.data || [];

    return subjects.map((sub: any) => {
      const sGrades = allGrades.filter((g: any) => g.subject_id === sub.id);
      const sExams = allExams.filter((e: any) => e.subject_id === sub.id);
      const avgGrade = sGrades.length > 0 ? sGrades.reduce((s: number, g: any) => s + Number(g.score || 0), 0) / sGrades.length : 0;
      const examPcts = sExams.map((e: any) => Number(e.total_marks) > 0 ? (Number(e.marks_obtained) / Number(e.total_marks)) * 100 : 0);
      const avgExam = examPcts.length > 0 ? examPcts.reduce((s: number, p: number) => s + p, 0) / examPcts.length : 0;
      const passed = examPcts.filter((p: number) => p >= 40).length;
      const passRate = examPcts.length > 0 ? Math.round((passed / examPcts.length) * 100) : 0;
      const overall = (avgGrade * 0.4 + avgExam * 0.6);
      const difficulty = overall > 75 ? 'easy' : overall > 55 ? 'medium' : 'hard';

      return {
        subject_id: sub.id, subject_name: sub.name,
        avgScore: Math.round(overall), avgGradeScore: Math.round(avgGrade), avgExamScore: Math.round(avgExam),
        passRate, totalStudents: Math.max(sGrades.length, sExams.length), difficulty,
      };
    });
  }

  private async getClassPerformance(orgId: string) {
    const [classesRes, studentsRes, gradesRes, examsRes, attendanceRes] = await Promise.all([
      supabase.from('classes').select('id, name').eq('organisation_id', orgId),
      supabase.from('students').select('id, class_id').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('grades').select('student_id, score'),
      supabase.from('exam_results').select('student_id, marks_obtained, total_marks'),
      supabase.from('attendance_records').select('student_id, status'),
    ]);

    const classes = classesRes.data || [];
    const students = studentsRes.data || [];
    const allGrades = gradesRes.data || [];
    const allExams = examsRes.data || [];
    const allAttendance = attendanceRes.data || [];

    return classes.map((cls: any) => {
      const clsStudents = students.filter((s: any) => s.class_id === cls.id);
      const clsStudentIds = clsStudents.map((s: any) => s.id);
      const clsGrades = allGrades.filter((g: any) => clsStudentIds.includes(g.student_id));
      const clsExams = allExams.filter((e: any) => clsStudentIds.includes(e.student_id));
      const clsAttendance = allAttendance.filter((a: any) => clsStudentIds.includes(a.student_id));

      const avgGrade = clsGrades.length > 0 ? clsGrades.reduce((s: number, g: any) => s + Number(g.score || 0), 0) / clsGrades.length : 0;
      const examPcts = clsExams.map((e: any) => Number(e.total_marks) > 0 ? (Number(e.marks_obtained) / Number(e.total_marks)) * 100 : 0);
      const avgExam = examPcts.length > 0 ? examPcts.reduce((s: number, p: number) => s + p, 0) / examPcts.length : 0;
      const present = clsAttendance.filter((a: any) => a.status === 'present').length;
      const attPct = clsAttendance.length > 0 ? Math.round((present / clsAttendance.length) * 100) : 0;
      const passed = examPcts.filter((p: number) => p >= 40).length;
      const passRate = examPcts.length > 0 ? Math.round((passed / examPcts.length) * 100) : 0;
      const overall = (avgGrade * 0.3 + avgExam * 0.5 + attPct * 0.2);

      return {
        class_id: cls.id, class_name: cls.name,
        avgScore: Math.round(overall), avgExamScore: Math.round(avgExam), avgGradeScore: Math.round(avgGrade),
        attendanceRate: attPct, passRate, studentCount: clsStudents.length,
      };
    });
  }

  private async getPerformanceTrend(orgId: string) {
    const { data: snapshots } = await supabase.from('class_performance_snapshots')
      .select('term, academic_year, avg_score, pass_rate').eq('organisation_id', orgId)
      .order('created_at', { ascending: true });

    return (snapshots || []).map((s: any) => ({
      label: `${s.term} ${s.academic_year}`,
      avgScore: Math.round(Number(s.avg_score || 0)),
      passRate: Math.round(Number(s.pass_rate || 0)),
    }));
  }

  private async getGradeDistribution(orgId: string) {
    const { data: grades } = await supabase.from('grades').select('score').eq('organisation_id', orgId);
    const scores = (grades || []).map((g: any) => Number(g.score || 0));
    const ranges = [
      { label: 'A (90-100)', min: 90, max: 100 },
      { label: 'B (75-89)', min: 75, max: 89 },
      { label: 'C (60-74)', min: 60, max: 74 },
      { label: 'D (40-59)', min: 40, max: 59 },
      { label: 'F (0-39)', min: 0, max: 39 },
    ];
    return ranges.map(r => ({
      ...r,
      count: scores.filter((s: number) => s >= r.min && s <= r.max).length,
      percentage: scores.length > 0 ? Math.round((scores.filter((s: number) => s >= r.min && s <= r.max).length / scores.length) * 100) : 0,
    }));
  }

  private async getMonthlyTrend(orgId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const [examRes, attendanceRes] = await Promise.all([
      supabase.from('exam_results').select('marks_obtained, total_marks, created_at')
        .eq('organisation_id', orgId).gte('created_at', sixMonthsAgo.toISOString()),
      supabase.from('attendance_records').select('status, date')
        .eq('organisation_id', orgId).gte('date', sixMonthsAgo.toISOString().split('T')[0]),
    ]);
    const exams = examRes.data || [];
    const attendance = attendanceRes.data || [];

    const examGrouped: Record<string, { total: number; sum: number }> = {};
    exams.forEach((e: any) => {
      const month = e.created_at?.substring(0, 7);
      if (!month) return;
      if (!examGrouped[month]) examGrouped[month] = { total: 0, sum: 0 };
      examGrouped[month].total += 1;
      examGrouped[month].sum += Number(e.total_marks) > 0 ? (Number(e.marks_obtained) / Number(e.total_marks)) * 100 : 0;
    });
    const attGrouped: Record<string, { present: number; total: number }> = {};
    attendance.forEach((a: any) => {
      const month = a.date?.substring(0, 7);
      if (!month) return;
      if (!attGrouped[month]) attGrouped[month] = { present: 0, total: 0 };
      attGrouped[month].total += 1;
      if (a.status === 'present') attGrouped[month].present += 1;
    });
    const months = new Set([...Object.keys(examGrouped), ...Object.keys(attGrouped)]);
    return Array.from(months).sort().map(m => ({
      month: m,
      examScore: examGrouped[m] ? Math.round(examGrouped[m].sum / examGrouped[m].total) : 0,
      attendanceRate: attGrouped[m] ? Math.round((attGrouped[m].present / attGrouped[m].total) * 100) : 0,
    }));
  }
}

export const academicAnalyticsService = new AcademicAnalyticsService();
