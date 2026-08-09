import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

interface TeacherMetrics {
  effectivenessScore: number;
  engagementScore: number;
  punctualityScore: number;
  studentFeedbackAvg: number;
  observationAvg: number;
  compositeScore: number;
}

export class TeacherPerformanceService {
  async getTeachers(orgId: string) {
    const { data } = await supabase
      .from('staff_records')
      .select('*, users!inner(full_name, email, phone)')
      .eq('organisation_id', orgId)
      .eq('status', 'active');

    return (data || []).map(t => ({
      id: t.id,
      fullName: t.full_name,
      teacherCode: t.staff_unique_id,
      email: t.email || t.users?.email,
      phone: t.phone || t.users?.phone,
      subject: t.subject,
      qualification: t.qualification,
      joinDate: t.join_date,
      status: t.status,
    }));
  }

  private computeComposite(effectiveness: number, engagement: number, feedback: number, observation: number): number {
    return Math.round((effectiveness * 0.3 + engagement * 0.2 + feedback * 0.25 + observation * 0.25) * 100) / 100;
  }

  private getPerformanceLevel(score: number): string {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    if (score >= 30) return 'below_average';
    return 'poor';
  }

  private generateRecommendations(metrics: TeacherMetrics): string[] {
    const recs: string[] = [];
    if (metrics.effectivenessScore < 60) recs.push('Consider pedagogical training workshops to improve teaching effectiveness');
    if (metrics.engagementScore < 60) recs.push('Implement more interactive teaching methods to boost student engagement');
    if (metrics.studentFeedbackAvg < 3.5) recs.push('Review student feedback and work on areas identified for improvement');
    if (metrics.observationAvg < 3) recs.push('Schedule follow-up observations and mentoring sessions');
    if (metrics.compositeScore < 50) recs.push('Comprehensive performance improvement plan recommended');
    if (recs.length === 0) recs.push('Maintain current performance levels and explore advanced teaching certifications');
    return recs;
  }

  async analyzeTeacher(orgId: string, teacherId: string) {
    const { data: teacher } = await supabase
      .from('staff_records')
      .select('*')
      .eq('id', teacherId)
      .eq('organisation_id', orgId)
      .single();

    if (!teacher) throw new BadRequestError('Teacher not found');

    const [{ data: observations }, { data: feedback }, { data: metrics }, { data: attendance }] = await Promise.all([
      supabase.from('teacher_observations').select('*').eq('teacher_id', teacherId).eq('organisation_id', orgId),
      supabase.from('teacher_student_feedback').select('*').eq('teacher_id', teacherId).eq('organisation_id', orgId),
      supabase.from('teacher_performance_metrics').select('*').eq('teacher_id', teacherId).eq('organisation_id', orgId).order('period_end', { ascending: false }).limit(4),
      supabase.from('attendance_records').select('status, date').eq('teacher_id', teacherId),
    ]);

    const obsRatings = (observations || []).map(o => o.overall_rating).filter(Boolean);
    const observationAvg = obsRatings.length > 0 ? Math.round((obsRatings.reduce((a, b) => a + b, 0) / obsRatings.length) * 20) : 70;

    const feedbackByCat: Record<string, number[]> = {};
    for (const f of (feedback || [])) {
      if (!feedbackByCat[f.category]) feedbackByCat[f.category] = [];
      feedbackByCat[f.category].push(f.rating);
    }
    const feedbackAvg = (feedback || []).length > 0
      ? Math.round((feedback || []).reduce((s, f) => s + f.rating, 0) / (feedback || []).length * 20)
      : 75;

    const totalDays = attendance?.length || 0;
    const presentDays = attendance?.filter(a => a.status === 'present').length || 0;
    const punctualityScore = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 90;

    const recentMetrics = (metrics || []);
    const effectivenessScore = recentMetrics.find(m => m.metric_type === 'effectiveness')?.score || 70;
    const engagementScore = recentMetrics.find(m => m.metric_type === 'engagement')?.score || 70;

    const compositeScore = this.computeComposite(effectivenessScore, engagementScore, feedbackAvg, observationAvg);

    const performanceMetrics: TeacherMetrics = {
      effectivenessScore: Math.round(effectivenessScore),
      engagementScore: Math.round(engagementScore),
      punctualityScore,
      studentFeedbackAvg: Math.round(feedbackAvg),
      observationAvg: Math.round(observationAvg),
      compositeScore,
    };

    const recommendations = this.generateRecommendations(performanceMetrics);
    const level = this.getPerformanceLevel(compositeScore);

    await supabase.from('teacher_performance_metrics').insert({
      organisation_id: orgId,
      teacher_id: teacherId,
      metric_type: 'composite',
      score: compositeScore,
      period: new Date().toISOString().slice(0, 7),
      period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
      period_end: new Date().toISOString().slice(0, 10),
      factors: recommendations,
    });

    const strengthCount = observations?.reduce((s, o) => s + (o.strengths?.length || 0), 0) || 0;
    const improvementCount = observations?.reduce((s, o) => s + (o.areas_for_improvement?.length || 0), 0) || 0;

    return {
      teacher: {
        id: teacher.id,
        fullName: teacher.full_name,
        teacherCode: teacher.staff_unique_id,
        subject: teacher.subject,
        qualification: teacher.qualification,
        joinDate: teacher.join_date,
      },
      metrics: performanceMetrics,
      level,
      recommendations,
      observationCount: observations?.length || 0,
      feedbackCount: feedback?.length || 0,
      topStrengths: strengthCount > 0 ? observations?.flatMap(o => o.strengths || []).slice(0, 5) : [],
      topImprovements: improvementCount > 0 ? observations?.flatMap(o => o.areas_for_improvement || []).slice(0, 5) : [],
      recentObservations: (observations || []).slice(0, 5).map(o => ({
        id: o.id,
        date: o.observation_date,
        lessonTopic: o.lesson_topic,
        rating: o.overall_rating,
        strengths: o.strengths,
        improvements: o.areas_for_improvement,
      })),
      trend: (recentMetrics || []).map(m => ({ period: m.period, score: m.score, type: m.metric_type })),
    };
  }

  async analyzeAllTeachers(orgId: string) {
    const teachers = await this.getTeachers(orgId);
    const results = await Promise.allSettled(
      teachers.map(t => this.analyzeTeacher(orgId, t.id))
    );

    const analyses = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<any>).value);

    const summary = {
      totalTeachers: teachers.length,
      excellent: analyses.filter(a => a.level === 'excellent').length,
      good: analyses.filter(a => a.level === 'good').length,
      average: analyses.filter(a => a.level === 'average').length,
      belowAverage: analyses.filter(a => a.level === 'below_average').length,
      poor: analyses.filter(a => a.level === 'poor').length,
      averageScore: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.metrics.compositeScore, 0) / analyses.length) : 0,
    };

    return { teachers: analyses, summary };
  }

  async createObservation(orgId: string, data: any) {
    const obs = {
      organisation_id: orgId,
      teacher_id: data.teacher_id,
      observer_id: data.observer_id,
      observation_date: data.observation_date,
      lesson_topic: data.lesson_topic,
      teaching_methods: data.teaching_methods || [],
      strengths: data.strengths || [],
      areas_for_improvement: data.areas_for_improvement || [],
      overall_rating: data.overall_rating,
      notes: data.notes,
      status: data.status || 'completed',
    };

    const { data: result, error } = await supabase.from('teacher_observations').insert(obs).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getObservations(orgId: string, teacherId?: string) {
    let query = supabase
      .from('teacher_observations')
      .select('*, teacher:staff_records(full_name, subject)')
      .eq('organisation_id', orgId)
      .order('observation_date', { ascending: false });

    if (teacherId) query = query.eq('teacher_id', teacherId);

    const { data } = await query;
    return (data || []).map(o => ({
      ...o,
      teacherName: o.teacher?.full_name,
      teacherSubject: o.teacher?.subject,
    }));
  }

  async submitFeedback(orgId: string, data: any) {
    const fb = {
      organisation_id: orgId,
      teacher_id: data.teacher_id,
      student_id: data.student_id,
      rating: data.rating,
      category: data.category,
      comment: data.comment || '',
      is_anonymous: data.is_anonymous !== false,
    };

    const { data: result, error } = await supabase.from('teacher_student_feedback').insert(fb).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getFeedbackSummary(orgId: string, teacherId?: string) {
    let query = supabase
      .from('teacher_student_feedback')
      .select('*, teacher:staff_records(full_name), student:students(full_name)')
      .eq('organisation_id', orgId);

    if (teacherId) query = query.eq('teacher_id', teacherId);
    query = query.order('created_at', { ascending: false }).limit(100);

    const { data } = await query;
    const allFeedback = data || [];

    const byCategory: Record<string, number[]> = {};
    for (const f of allFeedback) {
      if (!byCategory[f.category]) byCategory[f.category] = [];
      byCategory[f.category].push(f.rating);
    }

    const averages = Object.entries(byCategory).map(([cat, ratings]) => ({
      category: cat,
      average: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      count: ratings.length,
    }));

    return {
      total: allFeedback.length,
      overallAverage: allFeedback.length > 0
        ? Math.round((allFeedback.reduce((s, f) => s + f.rating, 0) / allFeedback.length) * 10) / 10
        : 0,
      byCategory: averages,
      recent: allFeedback.slice(0, 20).map(f => ({
        id: f.id,
        teacherName: f.teacher?.full_name,
        studentName: f.is_anonymous ? 'Anonymous' : f.student?.full_name,
        category: f.category,
        rating: f.rating,
        comment: f.comment,
        date: f.created_at,
      })),
    };
  }

  async predictRetention(orgId: string, teacherId: string) {
    const analysis = await this.analyzeTeacher(orgId, teacherId);
    const { metrics } = analysis;

    let retentionScore = metrics.compositeScore;
    if (metrics.punctualityScore < 60) retentionScore -= 10;
    if (metrics.engagementScore < 50) retentionScore -= 10;
    if (analysis.observationCount === 0) retentionScore -= 5;

    retentionScore = Math.max(0, Math.min(100, Math.round(retentionScore)));

    let riskLevel: string;
    let recommendation: string;
    if (retentionScore < 30) {
      riskLevel = 'critical';
      recommendation = 'Immediate intervention needed — schedule retention meeting and address concerns';
    } else if (retentionScore < 50) {
      riskLevel = 'high';
      recommendation = 'Develop retention plan — offer professional development and mentoring support';
    } else if (retentionScore < 70) {
      riskLevel = 'medium';
      recommendation = 'Monitor engagement — conduct regular check-ins and provide growth opportunities';
    } else {
      riskLevel = 'low';
      recommendation = 'No immediate retention risk — continue providing growth opportunities';
    }

    const factors: string[] = [];
    if (metrics.effectivenessScore < 60) factors.push('Low teaching effectiveness score');
    if (metrics.engagementScore < 50) factors.push('Low student engagement score');
    if (metrics.studentFeedbackAvg < 3) factors.push('Below average student feedback');
    if (metrics.punctualityScore < 70) factors.push('Attendance/punctuality concerns');
    if (analysis.observationCount < 2) factors.push('Insufficient classroom observations');

    const { data: existing } = await supabase
      .from('teacher_retention_predictions')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('organisation_id', orgId)
      .order('predicted_at', { ascending: false })
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from('teacher_retention_predictions').insert({
        organisation_id: orgId,
        teacher_id: teacherId,
        retention_score: retentionScore,
        risk_level: riskLevel,
        factors,
        recommendation,
      });
    }

    return {
      teacherId,
      teacherName: analysis.teacher.fullName,
      retentionScore,
      riskLevel,
      factors,
      recommendation,
      compositeScore: metrics.compositeScore,
    };
  }

  async predictAllRetention(orgId: string) {
    const teachers = await this.getTeachers(orgId);
    const results = await Promise.allSettled(
      teachers.map(t => this.predictRetention(orgId, t.id))
    );

    const predictions = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<any>).value);

    return {
      predictions,
      summary: {
        total: predictions.length,
        critical: predictions.filter(p => p.riskLevel === 'critical').length,
        high: predictions.filter(p => p.riskLevel === 'high').length,
        medium: predictions.filter(p => p.riskLevel === 'medium').length,
        low: predictions.filter(p => p.riskLevel === 'low').length,
        averageRetentionScore: predictions.length > 0
          ? Math.round(predictions.reduce((s, p) => s + p.retentionScore, 0) / predictions.length)
          : 0,
      },
    };
  }

  async createPerformanceReview(orgId: string, data: any) {
    const review = {
      organisation_id: orgId,
      teacher_id: data.teacher_id,
      reviewer_id: data.reviewer_id,
      review_period: data.review_period,
      rating: data.rating,
      effectiveness_score: data.effectiveness_score,
      engagement_score: data.engagement_score,
      student_feedback_avg: data.student_feedback_avg,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      goals: data.goals || [],
      comments: data.comments,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase.from('teacher_performance_reviews').insert(review).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getPerformanceReviews(orgId: string, teacherId?: string) {
    let query = supabase
      .from('teacher_performance_reviews')
      .select('*, teacher:staff_records(full_name, subject), reviewer:users(full_name)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });

    if (teacherId) query = query.eq('teacher_id', teacherId);

    const { data } = await query;
    return (data || []).map(r => ({
      ...r,
      teacherName: r.teacher?.full_name,
      teacherSubject: r.teacher?.subject,
      reviewerName: r.reviewer?.full_name,
    }));
  }

  async getInsights(orgId: string) {
    const { teachers, summary } = await this.analyzeAllTeachers(orgId);

    const topPerformers = [...teachers]
      .sort((a, b) => b.metrics.compositeScore - a.metrics.compositeScore)
      .slice(0, 5)
      .map(t => ({
        teacherId: t.teacher.id,
        teacherName: t.teacher.fullName,
        subject: t.teacher.subject,
        compositeScore: t.metrics.compositeScore,
        level: t.level,
      }));

    const needsSupport = [...teachers]
      .filter(t => t.level === 'below_average' || t.level === 'poor')
      .sort((a, b) => a.metrics.compositeScore - b.metrics.compositeScore)
      .slice(0, 5)
      .map(t => ({
        teacherId: t.teacher.id,
        teacherName: t.teacher.fullName,
        subject: t.teacher.subject,
        compositeScore: t.metrics.compositeScore,
        level: t.level,
        recommendations: t.recommendations.slice(0, 2),
      }));

    return {
      summary,
      topPerformers,
      needsSupport,
      averageScores: {
        effectiveness: teachers.length > 0 ? Math.round(teachers.reduce((s, t) => s + t.metrics.effectivenessScore, 0) / teachers.length) : 0,
        engagement: teachers.length > 0 ? Math.round(teachers.reduce((s, t) => s + t.metrics.engagementScore, 0) / teachers.length) : 0,
        punctuality: teachers.length > 0 ? Math.round(teachers.reduce((s, t) => s + t.metrics.punctualityScore, 0) / teachers.length) : 0,
        studentFeedback: teachers.length > 0 ? Math.round(teachers.reduce((s, t) => s + t.metrics.studentFeedbackAvg, 0) / teachers.length) : 0,
        observation: teachers.length > 0 ? Math.round(teachers.reduce((s, t) => s + t.metrics.observationAvg, 0) / teachers.length) : 0,
        composite: summary.averageScore,
      },
    };
  }
}

export const teacherPerformanceService = new TeacherPerformanceService();
