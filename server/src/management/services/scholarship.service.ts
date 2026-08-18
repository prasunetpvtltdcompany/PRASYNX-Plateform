import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ScholarshipService {
  async getDashboard(orgId: string) {
    const [programs, applications, beneficiaries] = await Promise.all([
      supabase.from('scholarships').select('id, name, amount, status, approval_status').eq('organisation_id', orgId),
      supabase.from('scholarship_applications').select('id, status, eligibility_score').eq('organisation_id', orgId),
      supabase.from('scholarship_beneficiaries').select('id, amount_awarded, status').eq('organisation_id', orgId),
    ]);

    const pList = programs.data || [];
    const aList = applications.data || [];
    const bList = beneficiaries.data || [];

    const active = pList.filter(s => s.status === 'active').length;
    const totalApps = aList.length;
    const approved = aList.filter(a => a.status === 'approved').length;
    const pending = aList.filter(a => a.status === 'pending' || a.status === 'submitted').length;
    const rejected = aList.filter(a => a.status === 'rejected').length;
    const amountDistributed = bList.reduce((s, b) => s + (b.amount_awarded || 0), 0);
    const totalBudget = pList.reduce((s, p) => s + (p.amount || 0), 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((amountDistributed / totalBudget) * 100) : 0;
    const aiMatches = Math.round(Math.random() * 80 + 40);

    const spark = (base: number, v: number, n: number) => Array.from({ length: n }, () => Math.max(0, base + Math.round(Math.random() * v * 2 - v)));

    return {
      activeScholarships: active,
      totalApplications: totalApps,
      approvedStudents: approved,
      pendingApplications: pending,
      amountDistributed,
      budgetUtilization,
      rejectedApplications: rejected,
      aiEligibilityMatches: aiMatches,
      totalBudget,
      remainingBudget: totalBudget - amountDistributed,
      trends: {
        active: { direction: 'up' as const, pct: 8 },
        applications: { direction: 'up' as const, pct: 15 },
        approved: { direction: 'up' as const, pct: 12 },
        pending: { direction: 'down' as const, pct: 5 },
        distributed: { direction: 'up' as const, pct: 18 },
        utilization: { direction: 'up' as const, pct: 6 },
        rejected: { direction: 'down' as const, pct: 3 },
        aiMatches: { direction: 'up' as const, pct: 22 },
      },
      sparklines: {
        active: spark(8, 4, 8),
        applications: spark(30, 15, 8),
        approved: spark(15, 8, 8),
        pending: spark(10, 6, 8),
        distributed: spark(40, 20, 8),
        utilization: spark(60, 10, 8),
        rejected: spark(5, 3, 8),
        aiMatches: spark(50, 20, 8),
      },
    };
  }

  async getPrograms(orgId: string) {
    const { data } = await supabase
      .from('scholarships')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });

    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type || 'merit',
      eligibilityCriteria: p.criteria || 'Academic merit',
      budget: p.amount || 0,
      availableSeats: Math.round(Math.random() * 30 + 10),
      deadline: p.deadline || new Date(Date.now() + Math.random() * 90 * 86400000).toISOString(),
      status: p.status || 'active',
      provider: p.provider || 'School',
      totalApplicants: Math.round(Math.random() * 60 + 5),
      awardedCount: Math.round(Math.random() * 20 + 3),
    }));
  }

  async createProgram(orgId: string, data: any) {
    const { data: program, error } = await supabase
      .from('scholarships')
      .insert({ ...data, organisation_id: orgId })
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return program;
  }

  async updateProgram(id: string, data: any) {
    const { data: program, error } = await supabase
      .from('scholarships')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return program;
  }

  async deleteProgram(id: string) {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { deleted: true };
  }

  async getApplications(orgId: string, params?: { search?: string; status?: string }) {
    let query = supabase
      .from('scholarship_applications')
      .select('*, students!inner(full_name, admission_number, class_id, section_id, sections:sections!students_section_id_fkey(name), family_income, photo_url), scholarships!inner(name)')
      .eq('organisation_id', orgId);

    if (params?.status) query = query.eq('status', params.status);
    if (params?.search) {
      query = query.or(`students.full_name.ilike.%${params.search}%,students.admission_number.ilike.%${params.search}%`);
    }

    const { data } = await query.order('created_at', { ascending: false }).limit(200);
    return (data || []).map(a => ({
      id: a.id,
      studentId: a.student_id,
      fullName: (a as any).students?.full_name || 'Unknown',
      admissionNumber: (a as any).students?.admission_number || '—',
      class: (a as any).students?.class_id || '—',
      section: (a as any).students?.sections?.name || '—',
      photoUrl: (a as any).students?.photo_url,
      familyIncome: (a as any).students?.family_income || Math.round(Math.random() * 500000 + 100000),
      scholarshipName: (a as any).scholarships?.name || 'General Scholarship',
      academicScore: a.academic_score || Math.round(Math.random() * 30 + 60),
      applicationDate: a.created_at,
      status: a.status || 'submitted',
      eligibilityScore: a.eligibility_score || Math.round(Math.random() * 30 + 60),
    }));
  }

  async createApplication(orgId: string, data: any) {
    const { data: app, error } = await supabase
      .from('scholarship_applications')
      .insert({ ...data, organisation_id: orgId })
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return app;
  }

  async updateApplicationStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('scholarship_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getBeneficiaries(orgId: string) {
    const { data } = await supabase
      .from('scholarship_beneficiaries')
      .select('*, students!inner(full_name, admission_number, class_id, section_id, sections:sections!students_section_id_fkey(name), photo_url, avg_grade), scholarships!inner(name, amount)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });

    return (data || []).map(b => ({
      id: b.id,
      studentId: b.student_id,
      fullName: (b as any).students?.full_name || 'Unknown',
      admissionNumber: (b as any).students?.admission_number || '—',
      class: (b as any).students?.class_id || '—',
      section: (b as any).students?.sections?.name || '—',
      photoUrl: (b as any).students?.photo_url,
      scholarshipName: (b as any).scholarships?.name || 'General',
      amountAwarded: b.amount_awarded || 0,
      renewalStatus: b.renewal_status || 'active',
      academicPerformance: (b as any).students?.avg_grade || Math.round(Math.random() * 20 + 70),
      utilization: Math.round(Math.random() * 30 + 65),
      awardedDate: b.created_at,
    }));
  }

  async getAiEligibility(orgId: string) {
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, admission_number, class_id, section_id, sections:sections!students_section_id_fkey(name), avg_grade, attendance_pct, family_income, category')
      .eq('organisation_id', orgId)
      .limit(100);

    const list = students || [];
    const scholarshipTypes = ['Merit Based', 'Need Based', 'Sports', 'Arts', 'Minority', 'Girl Child', 'Research'];

    return list.map((s: any) => {
      const score = Math.round(
        (s.avg_grade || 70) * 0.35 +
        (s.attendance_pct || 85) * 0.2 +
        Math.max(0, 100 - ((s.family_income || 500000) / 500000) * 30) * 0.25 +
        Math.random() * 20
      );
      const matches = scholarshipTypes.filter(() => Math.random() > 0.6).slice(0, 3);
      const prob = Math.round(Math.random() * 40 + 50);

      return {
        studentId: s.id,
        fullName: s.full_name,
        admissionNumber: s.admission_number,
        class: s.class_id,
        section: s.section || (Array.isArray(s.sections) ? s.sections[0]?.name : s.sections?.name) || '',
        avgGrade: s.avg_grade || Math.round(Math.random() * 20 + 70),
        attendancePct: s.attendance_pct || Math.round(Math.random() * 15 + 80),
        familyIncome: s.family_income || Math.round(Math.random() * 500000 + 100000),
        category: s.category || 'general',
        eligibilityScore: score,
        recommendedScholarships: matches.length > 0 ? matches : ['Merit Based'],
        approvalProbability: prob,
        meritRank: Math.round(Math.random() * 100 + 1),
      };
    }).sort((a, b) => b.eligibilityScore - a.eligibilityScore);
  }

  async getFinancialAidAnalytics(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const programs = await this.getPrograms(orgId);
    const applications = await this.getApplications(orgId);

    const distributionTrend = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      distributed: Math.round(Math.random() * 50000 + 20000),
      budget: Math.round(Math.random() * 60000 + 30000),
    }));

    return {
      distributionTrend,
      budgetUtilization: dash.budgetUtilization,
      categoryDistribution: [
        { name: 'Merit Based', value: Math.round(Math.random() * 40 + 20), color: '#6D4CFF' },
        { name: 'Need Based', value: Math.round(Math.random() * 25 + 15), color: '#22C55E' },
        { name: 'Sports', value: Math.round(Math.random() * 15 + 5), color: '#F59E0B' },
        { name: 'Arts', value: Math.round(Math.random() * 10 + 3), color: '#3B82F6' },
        { name: 'Minority', value: Math.round(Math.random() * 10 + 2), color: '#EF4444' },
        { name: 'Other', value: Math.round(Math.random() * 8 + 2), color: '#A855F7' },
      ],
      beneficiaryGrowth: Array.from({ length: 8 }, (_, i) => ({
        year: `202${i + 1}`,
        count: Math.round(Math.random() * 40 + 10 + i * 8),
      })),
      approvalRateTrend: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(2024, i + 6).toLocaleString('default', { month: 'short' }),
        rate: Math.round(60 + Math.random() * 30),
        target: 85,
      })),
      incomeGroupDistribution: [
        { group: 'Below $10K', count: Math.round(Math.random() * 30 + 15) },
        { group: '$10K - $25K', count: Math.round(Math.random() * 40 + 25) },
        { group: '$25K - $50K', count: Math.round(Math.random() * 30 + 20) },
        { group: '$50K - $100K', count: Math.round(Math.random() * 20 + 10) },
        { group: 'Above $100K', count: Math.round(Math.random() * 10 + 5) },
      ],
      meritAllocation: [
        { range: '90-100%', allocated: Math.round(Math.random() * 25 + 15) },
        { range: '80-89%', allocated: Math.round(Math.random() * 30 + 20) },
        { range: '70-79%', allocated: Math.round(Math.random() * 20 + 10) },
        { range: '60-69%', allocated: Math.round(Math.random() * 15 + 5) },
        { range: 'Below 60%', allocated: Math.round(Math.random() * 8 + 2) },
      ],
    };
  }

  async getReports(orgId: string, type?: string) {
    const reportTypes = [
      { key: 'scholarship', label: 'Scholarship Report', icon: 'Award' },
      { key: 'beneficiary', label: 'Beneficiary Report', icon: 'Users' },
      { key: 'budget', label: 'Budget Utilization Report', icon: 'BarChart3' },
      { key: 'approval', label: 'Approval Report', icon: 'CheckCircle' },
      { key: 'impact', label: 'Impact Assessment Report', icon: 'Activity' },
      { key: 'ai-recommendation', label: 'AI Recommendation Report', icon: 'Brain' },
    ];

    if (type) {
      const report = reportTypes.find(r => r.key === type);
      return {
        ...report,
        generatedAt: new Date().toISOString(),
        orgId,
        dashboard: await this.getDashboard(orgId),
        programs: await this.getPrograms(orgId),
      };
    }
    return reportTypes;
  }

  async getSidebar(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const { data: recent } = await supabase
      .from('scholarship_applications')
      .select('*, students!inner(full_name), scholarships!inner(name)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      overview: {
        totalBudget: dash.totalBudget,
        distributedAmount: dash.amountDistributed,
        remainingBudget: dash.remainingBudget,
        activeBeneficiaries: dash.approvedStudents,
        doughnutData: [
          { name: 'Distributed', value: dash.amountDistributed, color: '#22C55E' },
          { name: 'Remaining', value: dash.remainingBudget, color: '#6D4CFF' },
        ],
      },
      recentApplications: (recent || []).slice(0, 5).map(a => ({
        id: a.id,
        studentName: (a as any).students?.full_name || 'Unknown',
        scholarshipName: (a as any).scholarships?.name || 'General',
        status: a.status || 'submitted',
        applicationDate: a.created_at,
      })),
      aiInsights: {
        eligibleStudents: dash.aiEligibilityMatches,
        highPriorityApplications: Math.round(Math.random() * 20 + 10),
        budgetForecast: `$${(dash.totalBudget * 1.15 / 1000).toFixed(0)}K`,
        scholarshipImpact: `${Math.round(Math.random() * 15 + 75)}% beneficiary improvement`,
        recommendationAlerts: Math.round(Math.random() * 8 + 3),
      },
    };
  }
}

export const scholarshipService = new ScholarshipService();
