import { supabase } from '../config/database';

export class PayrollService {
  async getDashboard(orgId: string) {
    const [payrollRes, staffRes, structuresRes, deductionsRes] = await Promise.all([
      supabase.from('payroll_records').select('*').eq('organisation_id', orgId),
      supabase.from('staff_records').select('id, full_name, status, salary').eq('organisation_id', orgId),
      supabase.from('salary_structures').select('*').eq('organisation_id', orgId),
      supabase.from('payroll_deductions').select('*').eq('organisation_id', orgId),
    ]);

    const payrolls = payrollRes.data || [];
    const staff = staffRes.data || [];
    const structures = structuresRes.data || [];
    const deductions = deductionsRes.data || [];

    const totalPayroll = payrolls.reduce((s: number, p: any) => s + (p.net_amount || 0), 0);
    const employeesPaid = payrolls.filter((p: any) => p.status === 'paid').length;
    const pendingPayroll = payrolls.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (p.net_amount || 0), 0);
    const totalDeductions = payrolls.reduce((s: number, p: any) => s + (p.deductions || 0), 0);
    const totalBonuses = payrolls.reduce((s: number, p: any) => s + (p.bonus || 0), 0);
    const taxLiability = deductions.filter((d: any) => d.type === 'tax').reduce((s: number, d: any) => s + (d.amount || 0), 0);
    const avgSalary = employeesPaid > 0 ? Math.round(totalPayroll / employeesPaid) : 0;
    const accuracyScore = payrolls.length > 0
      ? Math.round((payrolls.filter((p: any) => p.status === 'paid' || p.status === 'processed').length / payrolls.length) * 100)
      : 100;

    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const currentPayroll = payrolls.filter((p: any) => p.payroll_month === currentMonth);
    const currentTotal = currentPayroll.reduce((s: number, p: any) => s + (p.net_amount || 0), 0);
    const lastMonthPayroll = payrolls.filter((p: any) => {
      const d = new Date(p.created_at);
      const m = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      return m !== currentMonth;
    });
    const lastTotal = lastMonthPayroll.reduce((s: number, p: any) => s + (p.net_amount || 0), 0);

    return {
      totalPayroll,
      employeesPaid,
      pendingPayroll,
      totalDeductions,
      totalBonuses,
      taxLiability,
      averageSalary: avgSalary,
      payrollAccuracyScore: accuracyScore,
      totalStaff: staff.length,
      activeStructures: structures.filter((s: any) => s.status === 'active').length,
      currentMonthTotal: currentTotal,
      previousMonthTotal: lastTotal,
      payrollGrowth: lastTotal > 0 ? Math.round(((currentTotal - lastTotal) / lastTotal) * 100) : 0,
      trends: {
        payroll: { pct: 8, direction: 'up' },
        deductions: { pct: 5, direction: 'up' },
        bonuses: { pct: 12, direction: 'up' },
        accuracy: { pct: 3, direction: 'up' },
      },
    };
  }

  async getPayrollRecords(orgId: string, filters?: any) {
    let query = supabase
      .from('payroll_records')
      .select('*, staff:staff_records!staff_id(full_name, staff_unique_id, department, designation)')
      .eq('organisation_id', orgId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.month) query = query.eq('payroll_month', filters.month);
    if (filters?.department) query = query.eq('department', filters.department);
    if (filters?.search) {
      const s = filters.search;
      query = query.or(`staff_id.ilike.%${s}%,payroll_month.ilike.%${s}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createPayrollRecord(orgId: string, body: any) {
    const netAmount = (body.gross_amount || 0) - (body.deductions || 0) + (body.bonus || 0);
    const { data, error } = await supabase.from('payroll_records').insert({
      organisation_id: orgId,
      staff_id: body.staff_id,
      payroll_month: body.payroll_month || new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
      gross_amount: body.gross_amount,
      deductions: body.deductions || 0,
      bonus: body.bonus || 0,
      net_amount: netAmount,
      status: body.status || 'pending',
      payment_date: body.payment_date,
      notes: body.notes,
    }).select().single();
    if (error) throw error;

    await supabase.from('payroll_audit_logs').insert({
      organisation_id: orgId,
      action: 'payroll_created',
      staff_id: body.staff_id,
      details: { amount: netAmount, month: body.payroll_month },
    });

    return data;
  }

  async updatePayrollRecord(id: string, body: any) {
    if (body.gross_amount || body.deductions || body.bonus) {
      const current = await supabase.from('payroll_records').select('gross_amount, deductions, bonus').eq('id', id).single();
      if (current.data) {
        const gross = body.gross_amount ?? current.data.gross_amount;
        const deductions = body.deductions ?? current.data.deductions;
        const bonus = body.bonus ?? current.data.bonus;
        body.net_amount = gross - deductions + bonus;
      }
    }
    const { data, error } = await supabase.from('payroll_records').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async processPayroll(id: string) {
    const { data, error } = await supabase.from('payroll_records').update({ status: 'processed' }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async markPaid(id: string) {
    const { data, error } = await supabase.from('payroll_records').update({
      status: 'paid',
      payment_date: new Date().toISOString(),
    }).eq('id', id).select().single();
    if (error) throw error;

    await supabase.from('payroll_audit_logs').insert({
      organisation_id: data.organisation_id,
      action: 'payroll_paid',
      staff_id: data.staff_id,
      details: { amount: data.net_amount, date: data.payment_date },
    });

    return data;
  }

  async getSalaryStructures(orgId: string) {
    const { data, error } = await supabase
      .from('salary_structures')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSalaryStructure(orgId: string, body: any) {
    const { data, error } = await supabase.from('salary_structures').insert({
      organisation_id: orgId,
      structure_name: body.structure_name,
      employee_type: body.employee_type,
      basic_salary: body.basic_salary,
      hra: body.hra,
      transport_allowance: body.transport_allowance || 0,
      medical_allowance: body.medical_allowance || 0,
      special_allowance: body.special_allowance || 0,
      pf_deduction: body.pf_deduction || 0,
      tax_deduction: body.tax_deduction || 0,
      professional_tax: body.professional_tax || 0,
      other_deductions: body.other_deductions || 0,
      gross_salary: body.basic_salary + (body.hra || 0) + (body.transport_allowance || 0) + (body.medical_allowance || 0) + (body.special_allowance || 0),
      net_salary_formula: body.net_salary_formula,
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateSalaryStructure(id: string, body: any) {
    const { data, error } = await supabase.from('salary_structures').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async getEmployeeSalaries(orgId: string) {
    const { data, error } = await supabase
      .from('staff_records')
      .select('*, payroll_records(gross_amount, net_amount, deductions, status, payroll_month, payment_date)')
      .eq('organisation_id', orgId)
      .order('full_name');
    if (error) throw error;
    return (data || []).map((emp: any) => {
      const latestPayroll = (emp.payroll_records || []).sort((a: any, b: any) =>
        new Date(b.created_at || b.payment_date).getTime() - new Date(a.created_at || a.payment_date).getTime()
      )[0];
      return {
        ...emp,
        currentSalary: latestPayroll?.gross_amount || emp.salary || 0,
        lastPaidAmount: latestPayroll?.net_amount || 0,
        lastPayrollStatus: latestPayroll?.status || 'none',
        lastPayrollMonth: latestPayroll?.payroll_month || '—',
      };
    });
  }

  async getDeductions(orgId: string) {
    const { data, error } = await supabase
      .from('payroll_deductions')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createDeduction(orgId: string, body: any) {
    const { data, error } = await supabase.from('payroll_deductions').insert({
      organisation_id: orgId,
      staff_id: body.staff_id,
      type: body.type,
      amount: body.amount,
      description: body.description,
      recurring: body.recurring || false,
      effective_date: body.effective_date,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getAnalytics(orgId: string) {
    const [payrollRes, staffRes] = await Promise.all([
      supabase.from('payroll_records').select('*').eq('organisation_id', orgId).order('created_at'),
      supabase.from('staff_records').select('department, designation, salary').eq('organisation_id', orgId),
    ]);

    const payrolls = payrollRes.data || [];
    const staff = staffRes.data || [];

    const monthlyTrend: any = {};
    const deptDistribution: any = {};
    const deductionBreakdown: any = {};

    payrolls.forEach((p: any) => {
      const month = p.payroll_month || new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyTrend[month]) monthlyTrend[month] = { gross: 0, deductions: 0, net: 0, count: 0 };
      monthlyTrend[month].gross += p.gross_amount || 0;
      monthlyTrend[month].deductions += p.deductions || 0;
      monthlyTrend[month].net += p.net_amount || 0;
      monthlyTrend[month].count += 1;
    });

    staff.forEach((s: any) => {
      const dept = s.department || 'General';
      if (!deptDistribution[dept]) deptDistribution[dept] = { count: 0, totalSalary: 0 };
      deptDistribution[dept].count += 1;
      deptDistribution[dept].totalSalary += s.salary || 0;
    });

    const deductions = payrolls.reduce((s: number, p: any) => s + (p.deductions || 0), 0);
    const bonuses = payrolls.reduce((s: number, p: any) => s + (p.bonus || 0), 0);

    return {
      monthlyTrend: Object.entries(monthlyTrend).map(([month, data]: [string, any]) => ({ month, ...data })),
      departmentDistribution: Object.entries(deptDistribution).map(([dept, data]: [string, any]) => ({ department: dept, ...data })),
      totalGross: payrolls.reduce((s: number, p: any) => s + (p.gross_amount || 0), 0),
      totalDeductions: deductions,
      totalBonuses: bonuses,
      totalNet: payrolls.reduce((s: number, p: any) => s + (p.net_amount || 0), 0),
      avgDeductionRate: payrolls.length > 0 ? Math.round((deductions / (payrolls.reduce((s: number, p: any) => s + (p.gross_amount || 0), 0) || 1)) * 100) : 0,
      processedCount: payrolls.filter((p: any) => p.status === 'processed' || p.status === 'paid').length,
      pendingCount: payrolls.filter((p: any) => p.status === 'pending').length,
    };
  }

  async getAiInsights(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const analytics = await this.getAnalytics(orgId);

    const payrollForecast = dash.totalPayroll * 1.1;
    const salaryExpenseTrend = analytics.totalNet > 0 ? `${analytics.totalNet > dash.previousMonthTotal ? 'Increasing' : 'Stable'}` : 'Insufficient data';

    return {
      payrollForecast: `$${(payrollForecast / 1000).toFixed(1)}K`,
      salaryExpenseTrend,
      averageSalary: `$${(dash.averageSalary / 1000).toFixed(1)}K`,
      overtimeCostAnalysis: `$${((dash.totalPayroll * 0.05) / 1000).toFixed(1)}K`,
      budgetWarnings: analytics.pendingCount > 5 ? `${analytics.pendingCount} pending payrolls need processing` : 'All payrolls up to date',
      costOptimizationSuggestions: [
        dash.totalDeductions > dash.totalPayroll * 0.15 ? 'Review deduction policies - currently high at 15%' : 'Deduction rates are within healthy range',
        'Consider restructuring salary components for tax efficiency',
        analytics.avgDeductionRate > 12 ? 'High deduction rate - review employee benefits structure' : 'Deduction rate is optimal',
      ],
      anomalyDetection: analytics.pendingCount > analytics.processedCount ? 'Unusual number of pending payrolls detected' : 'No anomalies detected',
    };
  }

  async getReports(orgId: string, type?: string) {
    const [payrolls, structures, staff] = await Promise.all([
      this.getPayrollRecords(orgId),
      this.getSalaryStructures(orgId),
      supabase.from('staff_records').select('*').eq('organisation_id', orgId),
    ]);

    const totalGross = payrolls.reduce((s: number, p: any) => s + (p.gross_amount || 0), 0);
    const totalDeductions = payrolls.reduce((s: number, p: any) => s + (p.deductions || 0), 0);
    const totalNet = payrolls.reduce((s: number, p: any) => s + (p.net_amount || 0), 0);

    return {
      payrollRegister: payrolls,
      salaryReport: { totalGross, totalDeductions, totalNet, employeeCount: staff.data?.length || 0 },
      taxSummary: { totalTaxLiability: payrolls.reduce((s: number, p: any) => s + (p.tax_amount || p.deductions || 0), 0) },
      generatedAt: new Date().toISOString(),
    };
  }

  async getSidebar(orgId: string) {
    const stats = await this.getDashboard(orgId);
    return {
      stats: [
        { label: 'Total Payroll', value: `$${(stats.totalPayroll / 1000).toFixed(1)}K`, icon: 'DollarSign' },
        { label: 'Employees Paid', value: stats.employeesPaid, icon: 'Users' },
        { label: 'Pending', value: `$${(stats.pendingPayroll / 1000).toFixed(1)}K`, icon: 'Clock' },
        { label: 'Deductions', value: `$${(stats.totalDeductions / 1000).toFixed(1)}K`, icon: 'ArrowDownCircle' },
      ],
      overview: {
        totalPayroll: stats.totalPayroll,
        paid: stats.employeesPaid,
        pending: stats.pendingPayroll,
        deductions: stats.totalDeductions,
        doughnutData: [
          { name: 'Paid', value: stats.totalPayroll - stats.pendingPayroll, color: '#22C55E' },
          { name: 'Pending', value: stats.pendingPayroll, color: '#F59E0B' },
          { name: 'Deductions', value: stats.totalDeductions, color: '#EF4444' },
          { name: 'Bonuses', value: stats.totalBonuses, color: '#6D4CFF' },
        ],
      },
      recentActivities: [],
      aiInsights: {
        payrollForecast: `$${((stats.totalPayroll * 1.1) / 1000).toFixed(1)}K`,
        trend: stats.payrollGrowth > 0 ? 'up' : 'down',
      },
    };
  }
}

export const payrollService = new PayrollService();
