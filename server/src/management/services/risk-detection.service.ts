import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

interface RiskFactors {
  attendancePct: number;
  avgGrade: number;
  behavioralIncidents: number;
  attendanceTrend: 'stable' | 'declining' | 'improving';
  gradeTrend: 'stable' | 'declining' | 'improving';
}

interface RiskThreshold {
  low_risk_max: number;
  medium_risk_max: number;
  high_risk_max: number;
  critical_risk_min: number;
}

export class RiskDetectionService {
  async getThresholds(orgId: string): Promise<Record<string, RiskThreshold>> {
    const { data } = await supabase
      .from('risk_thresholds')
      .select('*')
      .eq('organisation_id', orgId);

    const map: Record<string, RiskThreshold> = {};
    for (const t of (data || [])) {
      map[t.threshold_type] = t;
    }
    return map;
  }

  private computeRiskLevel(score: number, thresholds: RiskThreshold): string {
    if (score >= thresholds.critical_risk_min) return 'critical';
    if (score >= thresholds.high_risk_max) return 'high';
    if (score >= thresholds.medium_risk_max) return 'medium';
    return 'low';
  }

  async analyzeStudent(orgId: string, studentId: string) {
    const thresholds = await this.getThresholds(orgId);

    const [{ data: attendance }, { data: grades }, { data: incidents }] = await Promise.all([
      supabase.from('attendance_records').select('status, date').eq('student_id', studentId).eq('organisation_id', orgId).order('date', { ascending: false }),
      supabase.from('grades').select('grade, subject, created_at').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('behavioral_incidents').select('*').eq('student_id', studentId).eq('organisation_id', orgId),
    ]);

    const total = attendance?.length || 0;
    const present = attendance?.filter(a => a.status === 'present').length || 0;
    const attendancePct = total > 0 ? Math.round((present / total) * 100) : 100;

    let avgGrade = 0;
    if (grades && grades.length > 0) {
      const numeric = grades.map(g => parseInt(g.grade as string) || (g.grade === 'A' ? 90 : g.grade === 'B' ? 75 : g.grade === 'C' ? 60 : g.grade === 'D' ? 45 : g.grade === 'F' ? 30 : 50));
      avgGrade = Math.round(numeric.reduce((a, b) => a + b, 0) / numeric.length);
    }

    const behavioralCount = incidents?.length || 0;

    const recentAttendance = attendance?.slice(0, Math.min(20, total)) || [];
    const recentPresent = recentAttendance.filter(a => a.status === 'present').length;
    const recentPct = recentAttendance.length > 0 ? (recentPresent / recentAttendance.length) * 100 : 100;
    const olderAttendance = attendance?.slice(Math.min(20, total)) || [];
    const olderPresent = olderAttendance.filter(a => a.status === 'present').length;
    const olderPct = olderAttendance.length > 0 ? (olderPresent / olderAttendance.length) * 100 : 100;

    let attendanceTrend: 'stable' | 'declining' | 'improving' = 'stable';
    if (olderAttendance.length > 0 && recentAttendance.length > 0) {
      if (recentPct < olderPct - 10) attendanceTrend = 'declining';
      else if (recentPct > olderPct + 10) attendanceTrend = 'improving';
    }

    const halfGrades = grades || [];
    const mid = Math.ceil(halfGrades.length / 2);
    const firstHalf = halfGrades.slice(mid);
    const secondHalf = halfGrades.slice(0, mid);
    let gradeTrend: 'stable' | 'declining' | 'improving' = 'stable';
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((s, g) => s + (parseInt(g.grade as string) || 50), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, g) => s + (parseInt(g.grade as string) || 50), 0) / secondHalf.length;
      if (secondAvg < firstAvg - 10) gradeTrend = 'declining';
      else if (secondAvg > firstAvg + 10) gradeTrend = 'improving';
    }

    const factors: RiskFactors = { attendancePct, avgGrade, behavioralIncidents: behavioralCount, attendanceTrend, gradeTrend };

    const attendanceScore = Math.max(0, (100 - attendancePct) * 0.35);
    const academicScore = avgGrade > 0 ? Math.max(0, (100 - avgGrade) * 0.4) : 0;
    const behavioralScore = Math.min(behavioralCount * 5, 20);
    const trendPenalty = (attendanceTrend === 'declining' ? 8 : attendanceTrend === 'improving' ? -5 : 0) + (gradeTrend === 'declining' ? 8 : gradeTrend === 'improving' ? -5 : 0);
    const compositeScore = Math.min(100, Math.max(0, Math.round(attendanceScore + academicScore + behavioralScore + trendPenalty)));

    const attendanceLevel = this.computeRiskLevel(attendanceScore, thresholds['attendance'] || thresholds['composite']);
    const academicLevel = this.computeRiskLevel(academicScore, thresholds['academic'] || thresholds['composite']);
    const compositeLevel = this.computeRiskLevel(compositeScore, thresholds['composite']);

    const reasons: string[] = [];
    if (attendancePct < 75) reasons.push(`Attendance is low (${attendancePct}%)`);
    if (attendanceTrend === 'declining') reasons.push('Attendance is declining');
    if (avgGrade < 40) reasons.push(`Grades are critically low (${avgGrade}%)`);
    else if (avgGrade < 60) reasons.push(`Grades are below average (${avgGrade}%)`);
    if (gradeTrend === 'declining') reasons.push('Academic performance is declining');
    if (behavioralCount > 3) reasons.push(`${behavioralCount} behavioral incidents recorded`);

    let recommendation = 'On track — no intervention needed';
    if (compositeLevel === 'critical') recommendation = 'Immediate intervention required — schedule parent meeting, counseling, and academic support plan';
    else if (compositeLevel === 'high') recommendation = 'Monitor closely — assign mentor and provide additional academic support';
    else if (compositeLevel === 'medium') recommendation = 'Keep watch —定期 review progress and offer extra help sessions';

    const assessment = {
      studentId,
      organisationId: orgId,
      riskScore: compositeScore,
      riskLevel: compositeLevel,
      assessmentType: 'composite',
      factors: reasons,
      attendancePct,
      avgGrade,
      behavioralIncidents: behavioralCount,
      recommendation,
      attendanceScore: Math.round(attendanceScore),
      academicScore: Math.round(academicScore),
      behavioralScore: Math.round(behavioralScore),
      attendanceLevel,
      academicLevel,
      attendanceTrend,
      gradeTrend,
    };

    await supabase.from('risk_assessments').insert({
      organisation_id: orgId,
      student_id: studentId,
      risk_score: compositeScore,
      risk_level: compositeLevel,
      assessment_type: 'composite',
      factors: reasons,
      attendance_pct: attendancePct,
      avg_grade: avgGrade,
      behavioral_incidents: behavioralCount,
      recommendation,
    });

    return assessment;
  }

  async analyzeAllStudents(orgId: string) {
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, roll_number, class_id, section_id, classes:classes!students_class_id_fkey(name), sections:sections!students_section_id_fkey(name)')
      .eq('organisation_id', orgId);

    if (!students) return { students: [], summary: { total: 0, atRisk: 0, critical: 0, high: 0, medium: 0, low: 0 } };

    const results = await Promise.allSettled(
      students.map(s => this.analyzeStudent(orgId, s.id).then(r => ({ ...r, student: { id: s.id, fullName: s.full_name, rollNumber: s.roll_number, class: (s as any).classes?.name, section: (s as any).sections?.name } })))
    );

    const assessments = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<any>).value);

    const summary = {
      total: students.length,
      atRisk: assessments.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length,
      critical: assessments.filter(a => a.riskLevel === 'critical').length,
      high: assessments.filter(a => a.riskLevel === 'high').length,
      medium: assessments.filter(a => a.riskLevel === 'medium').length,
      low: assessments.filter(a => a.riskLevel === 'low').length,
    };

    return { students: assessments, summary };
  }

  async getAlerts(orgId: string, options?: { severity?: string; resolved?: boolean }) {
    let query = supabase
      .from('risk_alerts')
      .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
      .eq('organisation_id', orgId);

    if (options?.severity) query = query.eq('severity', options.severity);
    if (options?.resolved !== undefined) query = query.eq('is_resolved', options.resolved);

    query = query.order('created_at', { ascending: false }).limit(50);

    const { data } = await query;
    return data || [];
  }

  async generateAlerts(orgId: string) {
    const { students } = await this.analyzeAllStudents(orgId);
    const alerts: any[] = [];

    for (const s of students) {
      if (s.riskLevel === 'critical' || s.riskLevel === 'high') {
        const existing = await supabase
          .from('risk_alerts')
          .select('id')
          .eq('student_id', s.student.id)
          .eq('is_resolved', false)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (existing.data && existing.data.length > 0) continue;

        const alert = {
          organisation_id: orgId,
          student_id: s.student.id,
          alert_type: 'composite',
          severity: s.riskLevel,
          title: s.riskLevel === 'critical' ? 'Critical Risk Alert' : 'High Risk Alert',
          message: `${s.student.fullName} (${s.student.rollNumber || 'N/A'}) — Risk score: ${s.riskScore}. ${s.reasons.slice(0, 2).join(', ')}`,
          risk_score: s.riskScore,
          factors: s.reasons,
          suggested_action: s.recommendation,
        };

        const { data: inserted } = await supabase.from('risk_alerts').insert(alert).select().single();
        if (inserted) alerts.push(inserted);

        await supabase.from('notifications').insert({
          organisation_id: orgId,
          user_id: s.student.id,
          title: alert.title,
          message: alert.message,
          type: 'warning',
        });
      }
    }

    return alerts;
  }

  async resolveAlert(alertId: string, resolvedBy: string) {
    const { data } = await supabase
      .from('risk_alerts')
      .update({ is_resolved: true, resolved_by: resolvedBy, resolved_at: new Date().toISOString() })
      .eq('id', alertId)
      .select()
      .single();

    if (!data) throw new BadRequestError('Alert not found');
    return data;
  }

  async updateThresholds(orgId: string, thresholdType: string, thresholds: Partial<RiskThreshold>) {
    const { data } = await supabase
      .from('risk_thresholds')
      .update(thresholds)
      .eq('organisation_id', orgId)
      .eq('threshold_type', thresholdType)
      .select()
      .single();

    if (!data) throw new BadRequestError('Thresholds not found');
    return data;
  }

  async getStudentHistory(orgId: string, studentId: string) {
    const { data: assessments } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('student_id', studentId)
      .order('assessed_at', { ascending: false })
      .limit(20);

    const { data: alerts } = await supabase
      .from('risk_alerts')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      assessments: assessments || [],
      alerts: alerts || [],
    };
  }

  async getPredictiveInsights(orgId: string) {
    const { students } = await this.analyzeAllStudents(orgId);

    const decliningPerformance = students.filter(s => s.gradeTrend === 'declining');
    const attendanceIssues = students.filter(s => s.attendanceTrend === 'declining' || s.attendancePct < 75);
    const dropoutCandidates = students.filter(s => s.riskScore >= 60 && (s.riskLevel === 'high' || s.riskLevel === 'critical'));

    return {
      overview: {
        totalStudents: students.length,
        atRiskCount: students.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length,
        decliningCount: decliningPerformance.length,
        attendanceIssueCount: attendanceIssues.length,
        dropoutRiskCount: dropoutCandidates.length,
      },
      decliningPerformance: decliningPerformance.slice(0, 10).map(s => ({
        studentId: s.student.id,
        studentName: s.student.fullName,
        class: s.student.class,
        avgGrade: s.avgGrade,
        gradeTrend: s.gradeTrend,
        riskScore: s.riskScore,
      })),
      attendanceIssues: attendanceIssues.slice(0, 10).map(s => ({
        studentId: s.student.id,
        studentName: s.student.fullName,
        class: s.student.class,
        attendancePct: s.attendancePct,
        attendanceTrend: s.attendanceTrend,
        riskScore: s.riskScore,
      })),
      dropoutCandidates: dropoutCandidates.slice(0, 10).map(s => ({
        studentId: s.student.id,
        studentName: s.student.fullName,
        class: s.student.class,
        riskScore: s.riskScore,
        reasons: s.factors,
        recommendation: s.recommendation,
      })),
    };
  }
}

export const riskDetectionService = new RiskDetectionService();
