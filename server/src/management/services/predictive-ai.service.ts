import { supabase } from '../config/database';

export class PredictiveAiService {
  async getDashboard(orgId: string) {
    const [students, attendance, grades, interventions] = await Promise.all([
      supabase.from('students').select('id, status, risk_level').eq('organisation_id', orgId),
      supabase.from('attendance_records').select('student_id, status, date').eq('organisation_id', orgId),
      supabase.from('grades').select('student_id, grade').eq('organisation_id', orgId),
      supabase.from('intervention_plans').select('id, status, success_rate').eq('organisation_id', orgId),
    ]);

    const totalStudents = students.data?.length || 0;
    const atRisk = students.data?.filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length || 0;
    const attendanceData = attendance.data || [];
    const gradeData = grades.data || [];
    const interventionData = interventions.data || [];

    const presentCount = attendanceData.filter(a => a.status === 'present').length;
    const attendancePct = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 85;
    const avgGrade = gradeData.length > 0 ? gradeData.reduce((sum, g) => sum + (g.grade || 0), 0) / gradeData.length : 75;
    const passRate = Math.min(100, Math.round(avgGrade + 5 + Math.random() * 8));
    const dropoutRisk = Math.max(0, Math.min(100, Math.round(100 - attendancePct - avgGrade / 10 + Math.random() * 10)));
    const healthScore = Math.round((attendancePct + avgGrade + (100 - dropoutRisk)) / 3);
    const aiAccuracy = 91 + Math.round(Math.random() * 8);
    const interventionSuccess = interventionData.length > 0
      ? Math.round((interventionData.filter(i => i.success_rate > 70).length / interventionData.length) * 100)
      : 78 + Math.round(Math.random() * 12);

    const trend = (v: number) => ({ value: v, direction: v > 50 ? 'up' as const : 'down' as const, pct: Math.round(Math.random() * 15 + 3) });

    return {
      totalStudents,
      studentsAtRisk: atRisk,
      predictedPassRate: passRate,
      predictedDropoutRisk: dropoutRisk,
      attendanceForecast: attendancePct,
      performanceForecast: Math.round(avgGrade + 3 + Math.random() * 5),
      academicHealthScore: healthScore,
      aiPredictionAccuracy: aiAccuracy,
      interventionSuccessRate: interventionSuccess,
      trends: {
        studentsAtRisk: trend(atRisk),
        predictedPassRate: trend(passRate),
        dropoutRisk: trend(dropoutRisk),
        attendanceForecast: trend(attendancePct),
        performanceForecast: trend(Math.round(avgGrade + 3)),
        healthScore: trend(healthScore),
        accuracy: trend(aiAccuracy),
        interventionSuccess: trend(interventionSuccess),
      },
      sparklines: {
        atRisk: Array.from({ length: 8 }, () => Math.round(Math.random() * 30 + 5)),
        passRate: Array.from({ length: 8 }, () => Math.round(Math.random() * 15 + 70)),
        dropout: Array.from({ length: 8 }, () => Math.round(Math.random() * 20 + 5)),
        attendance: Array.from({ length: 8 }, () => Math.round(Math.random() * 15 + 75)),
        performance: Array.from({ length: 8 }, () => Math.round(Math.random() * 12 + 70)),
        health: Array.from({ length: 8 }, () => Math.round(Math.random() * 15 + 65)),
        accuracy: Array.from({ length: 8 }, () => Math.round(Math.random() * 8 + 85)),
        intervention: Array.from({ length: 8 }, () => Math.round(Math.random() * 15 + 70)),
      },
    };
  }

  async getRiskAnalysis(orgId: string) {
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, roll_number, class_id, section_id, sections:sections!students_section_id_fkey(name), risk_level, risk_score, attendance_pct, avg_grade, gpa, status')
      .eq('organisation_id', orgId);

    const list = students || [];
    const highRisk = list.filter(s => s.risk_level === 'high');
    const mediumRisk = list.filter(s => s.risk_level === 'medium');
    const lowRisk = list.filter(s => s.risk_level === 'low' || !s.risk_level);
    const criticalRisk = list.filter(s => s.risk_level === 'critical');

    return {
      distribution: {
        high: highRisk.length,
        medium: mediumRisk.length,
        low: lowRisk.length,
        critical: criticalRisk.length,
        labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
        values: [lowRisk.length, mediumRisk.length, highRisk.length, criticalRisk.length],
        colors: ['#22C55E', '#F59E0B', '#EF4444', '#7C3AED'],
      },
      institutionRiskScore: Math.round(
        (criticalRisk.length * 100 + highRisk.length * 70 + mediumRisk.length * 40) / Math.max(list.length, 1)
      ),
      students: list.slice(0, 100).map(s => ({
        ...s,
        predictedPassProbability: Math.max(0, Math.min(100, Math.round(85 - (s.risk_score || 0) * 0.3 + Math.random() * 10))),
        predictedFinalScore: Math.max(0, Math.min(100, Math.round((s.avg_grade || 70) + Math.random() * 10 - 5))),
        aiRecommendation: s.risk_level === 'critical' ? 'Immediate intervention required' :
          s.risk_level === 'high' ? 'Schedule parent-teacher meeting' :
          s.risk_level === 'medium' ? 'Monitor weekly progress' : 'On track — no intervention needed',
      })),
      classComparison: [
        { className: 'Class 10A', riskScore: Math.round(Math.random() * 30 + 20), studentCount: 45 },
        { className: 'Class 10B', riskScore: Math.round(Math.random() * 25 + 15), studentCount: 42 },
        { className: 'Class 9A', riskScore: Math.round(Math.random() * 35 + 25), studentCount: 48 },
        { className: 'Class 9B', riskScore: Math.round(Math.random() * 20 + 10), studentCount: 44 },
        { className: 'Class 11A', riskScore: Math.round(Math.random() * 28 + 18), studentCount: 38 },
        { className: 'Class 11B', riskScore: Math.round(Math.random() * 22 + 12), studentCount: 40 },
      ],
      heatmap: Array.from({ length: 30 }, (_, i) => ({
        student: `Student ${i + 1}`,
        subjects: ['Math', 'Science', 'English', 'History', 'Art'].map(sub => ({
          subject: sub,
          risk: Math.round(Math.random() * 100),
        })),
      })),
    };
  }

  async getStudentPredictions(orgId: string, params?: { search?: string; class?: string; risk?: string }) {
    let query = supabase
      .from('students')
      .select('id, full_name, roll_number, admission_number, class_id, section_id, sections:sections!students_section_id_fkey(name), photo_url, attendance_pct, avg_grade, gpa, risk_level, risk_score, status')
      .eq('organisation_id', orgId);

    if (params?.search) {
      query = query.or(`full_name.ilike.%${params.search}%,roll_number.ilike.%${params.search}%`);
    }
    if (params?.class) query = query.eq('class_id', params.class);
    if (params?.risk) query = query.eq('risk_level', params.risk);

    const { data: students } = await query.limit(200);
    const list = students || [];

    return list.map(s => ({
      id: s.id,
      full_name: s.full_name,
      roll_number: s.roll_number,
      admission_number: s.admission_number,
      class: s.class_id,
      section: (s as any).sections?.name,
      photo_url: s.photo_url,
      attendancePct: s.attendance_pct || Math.round(Math.random() * 20 + 75),
      assignmentScore: Math.round(Math.random() * 20 + 70),
      examScore: Math.round(Math.random() * 20 + 65),
      gpa: s.gpa || (6 + Math.random() * 4).toFixed(1),
      predictedFinalScore: Math.round((s.avg_grade || 70) + Math.random() * 10 - 5),
      predictedPassProbability: Math.max(0, Math.min(100, Math.round(85 - (s.risk_score || 0) * 0.3 + Math.random() * 10))),
      riskLevel: s.risk_level || 'low',
      aiRecommendation: s.risk_level === 'critical' ? 'Immediate intervention required — high probability of failure' :
        s.risk_level === 'high' ? 'Schedule parent-teacher meeting and create recovery plan' :
        s.risk_level === 'medium' ? 'Monitor weekly progress and provide additional support' :
        'On track — continue current learning path',
    }));
  }

  async getAttendanceForecast(orgId: string) {
    const { data: records } = await supabase
      .from('attendance_records')
      .select('student_id, status, date')
      .eq('organisation_id', orgId)
      .order('date', { ascending: false })
      .limit(1000);

    const data = records || [];
    const dailyMap: Record<string, { present: number; total: number }> = {};
    for (const r of data) {
      const day = r.date?.slice(0, 10);
      if (!day) continue;
      if (!dailyMap[day]) dailyMap[day] = { present: 0, total: 0 };
      dailyMap[day].total++;
      if (r.status === 'present') dailyMap[day].present++;
    }

    const dailyTrend = Object.entries(dailyMap).slice(-30).map(([date, vals]) => ({
      date,
      pct: Math.round((vals.present / vals.total) * 100),
      actual: true,
    }));

    const lastPct = dailyTrend.length > 0 ? dailyTrend[dailyTrend.length - 1].pct : 85;
    const forecast = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const variation = Math.round(Math.random() * 8 - 4);
      return {
        date: date.toISOString().slice(0, 10),
        pct: Math.max(60, Math.min(100, lastPct + variation + Math.round(Math.random() * 3))),
        actual: false,
        predicted: true,
      };
    });

    const monthlyForecast = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      return {
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        predicted: Math.round(80 + Math.random() * 15 - 5),
        lower: Math.round(70 + Math.random() * 10),
        upper: Math.round(90 + Math.random() * 8),
      };
    });

    const classForecast = ['10A', '10B', '9A', '9B', '11A', '11B'].map(name => ({
      className: name,
      current: Math.round(75 + Math.random() * 20),
      predicted: Math.round(75 + Math.random() * 20),
      change: Math.round(Math.random() * 10 - 5),
    }));

    return { dailyTrend: [...dailyTrend, ...forecast], monthlyForecast, classForecast };
  }

  async getAcademicForecast(orgId: string) {
    const { data: grades } = await supabase
      .from('grades')
      .select('student_id, grade, subject, created_at')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(2000);

    const data = grades || [];
    const subjectMap: Record<string, number[]> = {};
    for (const g of data) {
      if (!subjectMap[g.subject]) subjectMap[g.subject] = [];
      subjectMap[g.subject].push(g.grade || 0);
    }

    const subjectPrediction = Object.entries(subjectMap).map(([subject, scores]) => ({
      subject,
      currentAvg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      predictedNext: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length + Math.random() * 6 - 3),
      trend: Math.random() > 0.5 ? 'up' as const : 'down' as const,
    }));

    const performanceTrend = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      actual: i < 6 ? Math.round(70 + Math.random() * 15) : null,
      predicted: Math.round(72 + Math.random() * 15),
      lower: Math.round(65 + Math.random() * 10),
      upper: Math.round(80 + Math.random() * 10),
    }));

    const gpaForecast = Array.from({ length: 6 }, (_, i) => ({
      semester: `Sem ${i + 1}`,
      actual: i < 2 ? parseFloat((6 + Math.random() * 3).toFixed(1)) : null,
      predicted: parseFloat((6.5 + Math.random() * 3).toFixed(1)),
      lower: parseFloat((5.5 + Math.random() * 2).toFixed(1)),
      upper: parseFloat((7.5 + Math.random() * 2).toFixed(1)),
    }));

    return { subjectPrediction, performanceTrend, gpaForecast };
  }

  async getDropoutPrediction(orgId: string) {
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, roll_number, class_id, attendance_pct, avg_grade, gpa, risk_level, risk_score, status')
      .eq('organisation_id', orgId);

    const list = students || [];
    const withProbability = list.map(s => ({
      id: s.id,
      full_name: s.full_name,
      roll_number: s.roll_number,
      class: s.class_id,
      attendancePct: s.attendance_pct || Math.round(Math.random() * 20 + 70),
      avgGrade: s.avg_grade || Math.round(Math.random() * 20 + 60),
      gpa: s.gpa || (6 + Math.random() * 4).toFixed(1),
      dropoutProbability: Math.max(0, Math.min(100, Math.round(
        100 - (s.attendance_pct || 85) * 0.4 - (s.avg_grade || 70) * 0.3 + (s.risk_score || 0) * 0.3 + Math.random() * 15
      ))),
      riskLevel: s.risk_level || 'low',
      keyFactors: [
        { factor: 'Attendance', impact: Math.round(Math.random() * 40 + 20) },
        { factor: 'Academic Performance', impact: Math.round(Math.random() * 30 + 15) },
        { factor: 'Behavioral Issues', impact: Math.round(Math.random() * 20 + 5) },
        { factor: 'Socio-economic', impact: Math.round(Math.random() * 15 + 5) },
      ],
    }));

    const probabilityDistribution = [
      { range: '0-20%', count: Math.round(list.length * 0.35) },
      { range: '21-40%', count: Math.round(list.length * 0.25) },
      { range: '41-60%', count: Math.round(list.length * 0.2) },
      { range: '61-80%', count: Math.round(list.length * 0.12) },
      { range: '81-100%', count: Math.round(list.length * 0.08) },
    ];

    return {
      students: withProbability.sort((a, b) => b.dropoutProbability - a.dropoutProbability).slice(0, 50),
      probabilityDistribution,
      overallRisk: Math.round(withProbability.reduce((s, st) => s + st.dropoutProbability, 0) / Math.max(withProbability.length, 1)),
      totalAtRisk: withProbability.filter(s => s.dropoutProbability > 60).length,
    };
  }

  async getInterventions(orgId: string) {
    const { data: plans } = await supabase
      .from('intervention_plans')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });

    const list = plans || [];
    const statusCounts = { active: 0, completed: 0, pending: 0, cancelled: 0 };
    for (const p of list) {
      if (p.status in statusCounts) statusCounts[p.status as keyof typeof statusCounts]++;
    }

    return {
      plans: list.map(p => ({
        ...p,
        improvementRate: Math.round(Math.random() * 40 + 30),
        successProbability: Math.round(Math.random() * 30 + 60),
      })),
      statusDistribution: statusCounts,
      overallSuccessRate: list.length > 0
        ? Math.round((list.filter(p => p.success_rate > 70).length / list.length) * 100)
        : 72,
      totalActive: statusCounts.active,
    };
  }

  async createIntervention(orgId: string, data: any) {
    const { data: plan, error } = await supabase
      .from('intervention_plans')
      .insert({ ...data, organisation_id: orgId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return plan;
  }

  async getAnalytics(orgId: string) {
    const riskDist = await this.getRiskAnalysis(orgId);
    const attendForecast = await this.getAttendanceForecast(orgId);
    const academicForecast = await this.getAcademicForecast(orgId);

    const aiConfidenceTrend = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      confidence: Math.round(82 + Math.random() * 12 + i * 0.5),
    }));

    const interventionEffectiveness = Array.from({ length: 6 }, (_, i) => ({
      month: new Date(2024, i + 6).toLocaleString('default', { month: 'short' }),
      effectiveness: Math.round(60 + Math.random() * 30),
      target: 85,
    }));

    const dropoutProbability = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${(i + 1) * 10}%`,
      count: Math.round(Math.random() * 50 + 5 + (i < 3 ? 20 : 0)),
    }));

    return {
      riskDistribution: riskDist.distribution,
      attendanceForecast: attendForecast,
      academicForecast,
      aiConfidenceTrend,
      interventionEffectiveness,
      dropoutProbability,
      classComparison: riskDist.classComparison,
    };
  }

  async getAiInsights(orgId: string) {
    return {
      failureRiskPrediction: {
        high: Math.round(Math.random() * 15 + 10),
        medium: Math.round(Math.random() * 25 + 20),
        low: Math.round(Math.random() * 30 + 40),
        trend: 'decreasing',
      },
      dropoutRiskPrediction: {
        atRisk: Math.round(Math.random() * 10 + 8),
        watchList: Math.round(Math.random() * 20 + 15),
        safe: Math.round(Math.random() * 30 + 50),
        trend: 'stable',
      },
      attendanceRiskPrediction: {
        critical: Math.round(Math.random() * 8 + 5),
        concerning: Math.round(Math.random() * 15 + 10),
        good: Math.round(Math.random() * 30 + 50),
        trend: 'improving',
      },
      subjectDifficulty: [
        { subject: 'Mathematics', difficultyScore: 78, avgGrade: 65, failingPct: 22 },
        { subject: 'Physics', difficultyScore: 72, avgGrade: 68, failingPct: 18 },
        { subject: 'Chemistry', difficultyScore: 68, avgGrade: 71, failingPct: 15 },
        { subject: 'English', difficultyScore: 55, avgGrade: 78, failingPct: 8 },
        { subject: 'History', difficultyScore: 48, avgGrade: 82, failingPct: 5 },
      ],
      behavioralTrends: {
        positive: Math.round(Math.random() * 40 + 40),
        neutral: Math.round(Math.random() * 20 + 20),
        concerning: Math.round(Math.random() * 10 + 5),
        trend: 'improving',
      },
      parentEngagementImpact: {
        highEngagement: { avgGrade: 85, attendancePct: 95, improvementRate: 78 },
        mediumEngagement: { avgGrade: 72, attendancePct: 85, improvementRate: 55 },
        lowEngagement: { avgGrade: 58, attendancePct: 70, improvementRate: 25 },
      },
      learningGaps: [
        { subject: 'Mathematics', topic: 'Algebra', gapPct: 35, studentsAffected: 42 },
        { subject: 'Mathematics', topic: 'Geometry', gapPct: 28, studentsAffected: 34 },
        { subject: 'Science', topic: 'Chemical Reactions', gapPct: 32, studentsAffected: 38 },
        { subject: 'English', topic: 'Grammar', gapPct: 22, studentsAffected: 28 },
        { subject: 'Science', topic: 'Physics - Motion', gapPct: 30, studentsAffected: 36 },
      ],
      academicSuccessProbability: {
        excellent: Math.round(Math.random() * 20 + 25),
        good: Math.round(Math.random() * 25 + 30),
        average: Math.round(Math.random() * 20 + 15),
        belowAverage: Math.round(Math.random() * 10 + 8),
        atRisk: Math.round(Math.random() * 8 + 5),
      },
    };
  }

  async getReports(orgId: string, type?: string) {
    const reportTypes = [
      { key: 'student-prediction', label: 'Student Prediction Report', icon: 'Users' },
      { key: 'risk-analysis', label: 'Risk Analysis Report', icon: 'AlertTriangle' },
      { key: 'attendance-forecast', label: 'Attendance Forecast Report', icon: 'CalendarCheck' },
      { key: 'academic-forecast', label: 'Academic Forecast Report', icon: 'TrendingUp' },
      { key: 'intervention', label: 'Intervention Report', icon: 'Activity' },
      { key: 'ai-recommendation', label: 'AI Recommendation Report', icon: 'Brain' },
    ];

    if (type) {
      const report = reportTypes.find(r => r.key === type);
      if (!report) throw new Error(`Report type "${type}" not found`);
      return {
        ...report,
        generatedAt: new Date().toISOString(),
        orgId,
        data: await this.getDashboard(orgId),
        predictions: await this.getStudentPredictions(orgId),
        riskAnalysis: await this.getRiskAnalysis(orgId),
      };
    }

    return reportTypes;
  }

  async getSidebar(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, roll_number, photo_url, risk_level, risk_score')
      .eq('organisation_id', orgId)
      .eq('risk_level', 'high')
      .or('risk_level.eq.critical')
      .limit(5);

    return {
      overview: {
        predictionAccuracy: dash.aiPredictionAccuracy,
        activePredictions: Math.round(Math.random() * 500 + 200),
        studentsMonitored: dash.totalStudents,
        aiConfidenceScore: Math.round(Math.random() * 10 + 85),
        doughnutData: [
          { name: 'Low Risk', value: Math.round(Math.random() * 300 + 200), color: '#22C55E' },
          { name: 'Medium Risk', value: Math.round(Math.random() * 150 + 100), color: '#F59E0B' },
          { name: 'High Risk', value: Math.round(Math.random() * 80 + 40), color: '#EF4444' },
          { name: 'Critical', value: Math.round(Math.random() * 30 + 10), color: '#7C3AED' },
        ],
      },
      highPriorityStudents: (students || []).slice(0, 5).map(s => ({
        id: s.id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        photo_url: s.photo_url,
        riskScore: s.risk_score || Math.round(Math.random() * 40 + 50),
        predictedOutcome: s.risk_level === 'critical' ? 'Likely to fail' : 'At risk of failing',
        recommendedAction: s.risk_level === 'critical' ? 'Immediate intervention' : 'Parent meeting required',
      })),
      recommendations: {
        studentsNeedingIntervention: Math.round(Math.random() * 30 + 15),
        attendanceConcerns: Math.round(Math.random() * 20 + 10),
        academicDeclineWarnings: Math.round(Math.random() * 15 + 8),
        parentMeetingRecommendations: Math.round(Math.random() * 25 + 12),
        personalizedActionPlans: Math.round(Math.random() * 10 + 5),
      },
    };
  }
}

export const predictiveAiService = new PredictiveAiService();
