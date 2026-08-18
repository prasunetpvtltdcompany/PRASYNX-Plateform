import { supabase } from '../config/database';

export class InstitutionIntelligenceService {
  async getOverview(orgId: string) {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    const [
      { count: studentsCount },
      { count: teachersCount },
      { count: classesCount },
      { count: staffCount },
      { count: alumniCount },
      { data: attendance },
      { data: grades },
      { data: fees },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('staff_records').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('role', 'staff').eq('status', 'active'),
      supabase.from('alumni').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId),
      supabase.from('attendance_records').select('status').eq('organisation_id', orgId).gte('date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)),
      supabase.from('grades').select('grade, score').eq('organisation_id', orgId),
      supabase.from('fee_payments').select('amount_paid, payment_date').eq('organisation_id', orgId).gte('payment_date', new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10)),
    ]);

    const totalStudents = studentsCount || 0;
    const totalTeachers = teachersCount || 0;
    const avgClassSize = classesCount && classesCount > 0 ? Math.round((totalStudents / classesCount) * 10) / 10 : 0;
    const studentTeacherRatio = totalTeachers > 0 ? Math.round((totalStudents / totalTeachers) * 10) / 10 : 0;

    const attendancePresent = (attendance || []).filter(a => a.status === 'present').length;
    const attendanceTotal = (attendance || []).length;
    const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

    const numericGrades = (grades || []).map(g => parseInt(g.grade as string) || g.score || 0).filter(Boolean);
    const avgGrade = numericGrades.length > 0 ? Math.round(numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length * 10) / 10 : 0;
    const passRate = numericGrades.length > 0 ? Math.round(numericGrades.filter(g => g >= 40).length / numericGrades.length * 100) : 0;

    const totalFees = (fees || []).reduce((s, f) => s + (parseFloat(f.amount_paid) || 0), 0);

    const metrics = {
      totalStudents,
      totalTeachers,
      totalStaff: staffCount || 0,
      totalClasses: classesCount || 0,
      totalAlumni: alumniCount || 0,
      avgClassSize,
      studentTeacherRatio,
      attendanceRate,
      avgGrade,
      passRate,
      totalFeesCollected: Math.round(totalFees * 100) / 100,
    };

    const { data: prevSnapshot } = await supabase
      .from('institution_metrics_snapshots')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('period', lastMonth)
      .single();

    const changes: Record<string, { current: number; previous: number; change: number }> = {};
    if (prevSnapshot) {
      for (const key of Object.keys(metrics)) {
        const current = metrics[key as keyof typeof metrics] as number;
        const previous = prevSnapshot[key as keyof typeof prevSnapshot] as number || 0;
        changes[key] = { current, previous, change: previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0 };
      }
    }

    await supabase.from('institution_metrics_snapshots').upsert({
      organisation_id: orgId,
      snapshot_date: now.toISOString().slice(0, 10),
      period: currentMonth,
      total_students: metrics.totalStudents,
      total_teachers: metrics.totalTeachers,
      total_staff: metrics.totalStaff,
      total_classes: metrics.totalClasses,
      avg_class_size: avgClassSize,
      student_teacher_ratio: studentTeacherRatio,
      avg_attendance_pct: attendanceRate,
      avg_grade_score: avgGrade,
      pass_rate: passRate,
      fee_collection_rate: 0,
      total_fees_collected: metrics.totalFeesCollected,
      active_alumni_count: metrics.totalAlumni,
    }, { onConflict: 'organisation_id, period' });

    return { metrics, changes };
  }

  async getAcademicPerformance(orgId: string) {
    const { data: grades } = await supabase
      .from('grades')
      .select('grade, score, subject, student_id, created_at')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1000);

    const bySubject: Record<string, number[]> = {};
    for (const g of (grades || [])) {
      const val = parseInt(g.grade as string) || g.score || 0;
      if (!bySubject[g.subject]) bySubject[g.subject] = [];
      bySubject[g.subject].push(val);
    }

    const subjectPerformance = Object.entries(bySubject).map(([subject, scores]) => ({
      subject,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
      count: scores.length,
      passRate: Math.round(scores.filter(s => s >= 40).length / scores.length * 100),
    }));

    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('status, date')
      .eq('organisation_id', orgId)
      .order('date', { ascending: false })
      .limit(2000);

    const monthlyAttendance: Record<string, { present: number; total: number }> = {};
    for (const a of (attendance || [])) {
      const month = a.date?.slice(0, 7);
      if (!month) continue;
      if (!monthlyAttendance[month]) monthlyAttendance[month] = { present: 0, total: 0 };
      monthlyAttendance[month].total++;
      if (a.status === 'present') monthlyAttendance[month].present++;
    }

    const attendanceTrend = Object.entries(monthlyAttendance)
      .map(([month, data]) => ({ month, rate: Math.round((data.present / data.total) * 100) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const { data: exams } = await supabase
      .from('exam_results')
      .select('*')
      .eq('organisation_id', orgId)
      .limit(500);

    const examPerformance = (exams || []).reduce((acc: any, e: any) => {
      const name = e.exam_name || 'Unknown';
      if (!acc[name]) acc[name] = { total: 0, passed: 0, avgMarks: 0, marks: [] };
      acc[name].total++;
      const marks = parseFloat(e.marks_obtained) || 0;
      acc[name].marks.push(marks);
      if (marks >= 40) acc[name].passed++;
      return acc;
    }, {});

    const examStats = Object.entries(examPerformance).map(([exam, data]: [string, any]) => ({
      exam,
      totalStudents: data.total,
      passRate: Math.round((data.passed / data.total) * 100),
      averageMarks: Math.round(data.marks.reduce((a: number, b: number) => a + b, 0) / data.marks.length * 10) / 10,
    }));

    return { subjectPerformance, attendanceTrend, examStats };
  }

  async getOperationalMetrics(orgId: string) {
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name, capacity')
      .eq('organisation_id', orgId);

    const { data: students } = await supabase
      .from('students')
      .select('class_id, section_id, gender, classes:classes!students_class_id_fkey(name), sections:sections!students_section_id_fkey(name)')
      .eq('organisation_id', orgId)
      .eq('status', 'active');

    const classSizes = (classes || []).map(c => {
      const classStudents = (students || []).filter(s => (s as any).classes?.name === c.name);
      return { className: c.name, capacity: c.capacity, enrolled: classStudents.length, utilization: c.capacity ? Math.round((classStudents.length / c.capacity) * 100) : 0 };
    });

    const byGender: Record<string, number> = {};
    for (const s of (students || [])) {
      byGender[s.gender || 'unspecified'] = (byGender[s.gender || 'unspecified'] || 0) + 1;
    }
    const genderDistribution = Object.entries(byGender).map(([gender, count]) => ({ gender, count, pct: Math.round((count / (students?.length || 1)) * 100) }));

    const { count: totalStaff } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId)
      .eq('role', 'staff')
      .eq('status', 'active');

    const { data: feeData } = await supabase
      .from('student_fees')
      .select('total_amount, paid_amount, status')
      .eq('organisation_id', orgId);

    const totalFeeAmount = (feeData || []).reduce((s, f) => s + (parseFloat(f.total_amount) || 0), 0);
    const totalPaid = (feeData || []).reduce((s, f) => s + (parseFloat(f.paid_amount) || 0), 0);
    const feeCollectionRate = totalFeeAmount > 0 ? Math.round((totalPaid / totalFeeAmount) * 100) : 0;
    const pendingAmount = totalFeeAmount - totalPaid;

    const { data: library } = await supabase
      .from('library_books')
      .select('copies_total')
      .eq('organisation_id', orgId);

    const totalBooks = (library || []).reduce((s, b) => s + (b.copies_total || 0), 0);
    const booksPerStudent = (students?.length || 1) > 0 ? Math.round((totalBooks / (students?.length || 1)) * 10) / 10 : 0;

    return {
      classSizes,
      genderDistribution,
      staffCount: totalStaff || 0,
      feeCollection: { totalAmount: Math.round(totalFeeAmount * 100) / 100, totalPaid: Math.round(totalPaid * 100) / 100, pendingAmount: Math.round(pendingAmount * 100) / 100, collectionRate: feeCollectionRate },
      libraryStats: { totalBooks, booksPerStudent },
    };
  }

  async getBenchmarks(orgId: string) {
    const { data: metrics } = await supabase
      .from('institution_metrics_snapshots')
      .select('*')
      .eq('organisation_id', orgId)
      .order('snapshot_date', { ascending: false })
      .limit(1);

    const current = metrics?.[0];
    if (!current) return { benchmarks: [], overallScore: 0 };

    const { data: allSnapshots } = await supabase
      .from('institution_metrics_snapshots')
      .select('*')
      .eq('period', current.period);

    const peers = allSnapshots || [];

    const computeBenchmark = (metric: string, orgVal: number, higherIsBetter: boolean = true) => {
      const values = peers.map(p => parseFloat(p[metric as keyof typeof p] as string) || 0).filter(v => v > 0);
      if (values.length < 2) return { orgValue: orgVal, peerAvg: 0, percentileRank: 50, score: 50 };

      const sorted = [...values].sort((a, b) => higherIsBetter ? b - a : a - b);
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
      const rank = sorted.indexOf(orgVal);
      const pctRank = rank >= 0 ? Math.round((1 - rank / sorted.length) * 100) : 50;
      const min = sorted[sorted.length - 1];
      const max = sorted[0];
      const score = max !== min ? Math.round(((orgVal - min) / (max - min)) * 100) : 50;

      return {
        orgValue: Math.round(orgVal * 10) / 10,
        peerAvg: avg,
        peerMin: Math.round(min * 10) / 10,
        peerMax: Math.round(max * 10) / 10,
        percentileRank: Math.min(100, Math.max(0, pctRank)),
        score: Math.min(100, Math.max(0, higherIsBetter ? score : 100 - score)),
      };
    };

    const benchmarks = [
      { category: 'academic', metric: 'Student-Teacher Ratio', key: 'student_teacher_ratio', higherIsBetter: false },
      { category: 'academic', metric: 'Average Attendance', key: 'avg_attendance_pct', higherIsBetter: true },
      { category: 'academic', metric: 'Average Grade', key: 'avg_grade_score', higherIsBetter: true },
      { category: 'academic', metric: 'Pass Rate', key: 'pass_rate', higherIsBetter: true },
      { category: 'operational', metric: 'Average Class Size', key: 'avg_class_size', higherIsBetter: false },
      { category: 'operational', metric: 'Books Per Student', key: 'library_books_per_student', higherIsBetter: true },
      { category: 'financial', metric: 'Fee Collection Rate', key: 'fee_collection_rate', higherIsBetter: true },
    ];

    const results = benchmarks.map(b => ({
      category: b.category,
      metricName: b.metric,
      ...computeBenchmark(b.key, parseFloat(current[b.key as keyof typeof current] as string) || 0, b.higherIsBetter),
    }));

    const byCategory: Record<string, number[]> = {};
    for (const r of results) {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r.score);
    }
    const categoryScores = Object.entries(byCategory).map(([cat, scores]) => ({
      category: cat,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
    const overallScore = categoryScores.length > 0 ? Math.round(categoryScores.reduce((s, c) => s + c.score, 0) / categoryScores.length) : 0;

    await supabase.from('institution_benchmarks').upsert(
      results.map(r => ({
        organisation_id: orgId,
        benchmark_date: new Date().toISOString().slice(0, 10),
        category: r.category,
        metric_name: r.metricName,
        org_value: r.orgValue,
        peer_avg: r.peerAvg,
        peer_p25: r.peerMin,
        peer_p75: r.peerMax,
        percentile_rank: r.percentileRank,
        score: r.score,
      }))
    );

    return { benchmarks: results, categoryScores, overallScore };
  }

  async getTrends(orgId: string) {
    const { data: snapshots } = await supabase
      .from('institution_metrics_snapshots')
      .select('*')
      .eq('organisation_id', orgId)
      .order('snapshot_date', { ascending: true })
      .limit(24);

    if (!snapshots || snapshots.length < 2) {
      const now = new Date();
      const current = await this.getOverview(orgId);
      return {
        trends: [],
        currentSnapshot: current,
        projectNextQuarter: null,
      };
    }

    const trends = snapshots.map(s => ({
      period: s.period,
      totalStudents: s.total_students,
      totalTeachers: s.total_teachers,
      avgAttendance: s.avg_attendance_pct,
      avgGrade: s.avg_grade_score,
      passRate: s.pass_rate,
      feeCollectionRate: s.fee_collection_rate,
    }));

    const latest = snapshots[snapshots.length - 1];
    const earliest = snapshots[0];
    const monthsDiff = snapshots.length;
    const growthPerMonth = monthsDiff > 1 ? {
      students: (latest.total_students - earliest.total_students) / (monthsDiff - 1),
      teachers: (latest.total_teachers - earliest.total_teachers) / (monthsDiff - 1),
      attendance: (latest.avg_attendance_pct - earliest.avg_attendance_pct) / (monthsDiff - 1),
    } : { students: 0, teachers: 0, attendance: 0 };

    const projectNextQuarter = {
      projectedStudents: Math.round(latest.total_students + growthPerMonth.students * 3),
      projectedTeachers: Math.round(latest.total_teachers + growthPerMonth.teachers * 3),
      projectedAttendance: Math.min(100, Math.round((latest.avg_attendance_pct + growthPerMonth.attendance * 3) * 10) / 10),
    };

    return { trends, currentSnapshot: snapshots[snapshots.length - 1], projectNextQuarter };
  }

  async getPeerComparison(orgId: string) {
    const { data: org } = await supabase
      .from('organisations')
      .select('id, name')
      .eq('id', orgId)
      .single();

    const { data: allMetrics } = await supabase
      .from('institution_metrics_snapshots')
      .select('*, organisation:organisations(name)')
      .order('snapshot_date', { ascending: false });

    if (!allMetrics || allMetrics.length === 0) return { peers: [] };

    const latestByOrg: Record<string, any> = {};
    for (const m of allMetrics) {
      if (!latestByOrg[m.organisation_id]) latestByOrg[m.organisation_id] = m;
    }

    const peers = Object.values(latestByOrg)
      .filter((m: any) => m.organisation_id !== orgId)
      .slice(0, 10)
      .map((m: any) => ({
        id: m.organisation_id,
        name: m.organisation?.name || 'Unknown',
        totalStudents: m.total_students,
        totalTeachers: m.total_teachers,
        avgAttendance: m.avg_attendance_pct,
        avgGrade: m.avg_grade_score,
        passRate: m.pass_rate,
        studentTeacherRatio: m.student_teacher_ratio,
        avgClassSize: m.avg_class_size,
      }));

    const own = latestByOrg[orgId];
    const ownData = own ? {
      id: orgId,
      name: org?.name || 'My School',
      totalStudents: own.total_students,
      totalTeachers: own.total_teachers,
      avgAttendance: own.avg_attendance_pct,
      avgGrade: own.avg_grade_score,
      passRate: own.pass_rate,
      studentTeacherRatio: own.student_teacher_ratio,
      avgClassSize: own.avg_class_size,
    } : null;

    return { mySchool: ownData, peers };
  }

  async getIntelligenceDashboard(orgId: string) {
    const [overview, academic, operational, benchmarks, trends, peers] = await Promise.all([
      this.getOverview(orgId),
      this.getAcademicPerformance(orgId),
      this.getOperationalMetrics(orgId),
      this.getBenchmarks(orgId),
      this.getTrends(orgId),
      this.getPeerComparison(orgId),
    ]);

    return { overview, academic, operational, benchmarks, trends, peers };
  }
}

export const institutionIntelligenceService = new InstitutionIntelligenceService();
