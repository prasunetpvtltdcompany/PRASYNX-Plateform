import { supabase } from '../config/database';

export class AccountsService {
  async getDashboard(orgId: string) {
    const [ledgersRes, journalRes, assetsRes, budgetsRes] = await Promise.all([
      supabase.from('chart_of_accounts').select('id, account_type, balance, status').eq('organisation_id', orgId),
      supabase.from('journal_entries').select('id, amount, entry_type, created_at, status').eq('organisation_id', orgId),
      supabase.from('assets').select('id, value, liability_amount, asset_type').eq('organisation_id', orgId),
      supabase.from('budgets').select('id, allocated, spent').eq('organisation_id', orgId),
    ]);

    const ledgers = ledgersRes.data || [];
    const journalEntries = journalRes.data || [];
    const assets = assetsRes.data || [];
    const budgetsList = budgetsRes.data || [];

    const totalRevenue = journalEntries.filter((j: any) => j.entry_type === 'credit').reduce((s: number, j: any) => s + (j.amount || 0), 0);
    const totalExpenses = journalEntries.filter((j: any) => j.entry_type === 'debit').reduce((s: number, j: any) => s + (j.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const receivables = ledgers.filter((l: any) => l.account_type === 'receivable').reduce((s: number, l: any) => s + (l.balance || 0), 0);
    const payables = ledgers.filter((l: any) => l.account_type === 'payable').reduce((s: number, l: any) => s + (l.balance || 0), 0);
    const cashBalance = ledgers.filter((l: any) => l.account_type === 'cash' || l.account_type === 'bank').reduce((s: number, l: any) => s + (l.balance || 0), 0);
    const totalAssets = assets.reduce((s: number, a: any) => s + (a.value || 0), 0);
    const totalLiabilities = assets.reduce((s: number, a: any) => s + (a.liability_amount || 0), 0);
    const activeLedgers = ledgers.filter((l: any) => l.status === 'active').length;
    const totalBudgetAllocated = budgetsList.reduce((s: number, b: any) => s + (b.allocated || 0), 0);
    const totalBudgetSpent = budgetsList.reduce((s: number, b: any) => s + (b.spent || 0), 0);
    const budgetUtilization = totalBudgetAllocated > 0 ? Math.round((totalBudgetSpent / totalBudgetAllocated) * 100) : 0;
    const healthScore = Math.min(100, Math.round(
      ((totalRevenue > 0 ? (netProfit / totalRevenue) * 40 : 0) +
      (totalAssets > 0 ? (1 - totalLiabilities / totalAssets) * 30 : 30) +
      (60 - budgetUtilization * 0.3)) / 1
    ));

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      outstandingReceivables: receivables,
      outstandingPayables: payables,
      cashBalance,
      activeLedgers,
      financialHealthScore: Math.max(0, healthScore),
      totalAssets,
      totalLiabilities,
      totalLedgers: ledgers.length,
      totalJournalEntries: journalEntries.length,
      totalBudgets: budgetsList.length,
      budgetUtilization,
      pendingEntries: journalEntries.filter((j: any) => j.status === 'pending').length,
      approvedEntries: journalEntries.filter((j: any) => j.status === 'approved').length,
      trends: {
        revenue: { pct: 12, direction: 'up' },
        expenses: { pct: 8, direction: 'up' },
        profit: { pct: 15, direction: 'up' },
        receivables: { pct: 5, direction: 'down' },
        payables: { pct: 3, direction: 'down' },
        cash: { pct: 7, direction: 'up' },
      },
    };
  }

  async getChartOfAccounts(orgId: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('organisation_id', orgId)
      .order('account_group', { ascending: true })
      .order('account_name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createAccount(orgId: string, body: any) {
    const { data, error } = await supabase.from('chart_of_accounts').insert({
      organisation_id: orgId,
      account_code: body.account_code,
      account_name: body.account_name,
      account_type: body.account_type,
      account_group: body.account_group,
      description: body.description,
      opening_balance: body.opening_balance || 0,
      balance: body.opening_balance || 0,
      currency: body.currency || 'USD',
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateAccount(id: string, body: any) {
    const { data, error } = await supabase.from('chart_of_accounts').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteAccount(id: string) {
    const { error } = await supabase.from('chart_of_accounts').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  async getLedgers(orgId: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*, journal_entries(amount, entry_type, created_at)')
      .eq('organisation_id', orgId)
      .order('account_name');
    if (error) throw error;
    return (data || []).map((ledger: any) => {
      const entries = ledger.journal_entries || [];
      const debitTotal = entries.filter((e: any) => e.entry_type === 'debit').reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const creditTotal = entries.filter((e: any) => e.entry_type === 'credit').reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const closingBalance = (ledger.opening_balance || 0) + debitTotal - creditTotal;
      return {
        ...ledger,
        debitTotal,
        creditTotal,
        closingBalance,
        lastEntry: entries.length > 0 ? entries[entries.length - 1]?.created_at : null,
      };
    });
  }

  async getJournalEntries(orgId: string, filters?: any) {
    let query = supabase
      .from('journal_entries')
      .select('*, debit_account:chart_of_accounts!debit_account_id(account_name, account_code), credit_account:chart_of_accounts!credit_account_id(account_name, account_code), entered_by:users(full_name)')
      .eq('organisation_id', orgId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.from_date) query = query.gte('entry_date', filters.from_date);
    if (filters?.to_date) query = query.lte('entry_date', filters.to_date);
    if (filters?.search) {
      const s = filters.search;
      query = query.or(`voucher_number.ilike.%${s}%,description.ilike.%${s}%`);
    }

    const { data, error } = await query.order('entry_date', { ascending: false }).limit(200);
    if (error) throw error;
    return data || [];
  }

  async createJournalEntry(orgId: string, body: any) {
    const voucherNumber = `JV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { data, error } = await supabase.from('journal_entries').insert({
      organisation_id: orgId,
      voucher_number: voucherNumber,
      entry_date: body.entry_date || new Date().toISOString(),
      description: body.description,
      debit_account_id: body.debit_account_id,
      credit_account_id: body.credit_account_id,
      amount: body.amount,
      entry_type: body.entry_type || 'debit',
      entered_by: body.entered_by,
      status: body.status || 'pending',
      reference: body.reference,
    }).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      organisation_id: orgId,
      action: 'journal_entry_created',
      entity_type: 'journal_entries',
      entity_id: data.id,
      details: { voucher_number: voucherNumber, amount: body.amount },
    });

    return data;
  }

  async updateJournalEntry(id: string, body: any) {
    const { data, error } = await supabase.from('journal_entries').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async approveJournalEntry(id: string) {
    const { data, error } = await supabase.from('journal_entries').update({ status: 'approved' }).eq('id', id).select().single();
    if (error) throw error;

    if (data && data.debit_account_id && data.credit_account_id) {
      await supabase.from('chart_of_accounts').update({ balance: supabase.rpc('increment', { x: data.amount }) }).eq('id', data.debit_account_id);
      await supabase.from('chart_of_accounts').update({ balance: supabase.rpc('decrement', { x: data.amount }) }).eq('id', data.credit_account_id);
    }
    return data;
  }

  async reverseJournalEntry(id: string) {
    const orig = await supabase.from('journal_entries').select('*').eq('id', id).single();
    if (orig.error) throw orig.error;
    const entry = orig.data;
    if (!entry) throw new Error('Entry not found');

    const reverseVoucher = `RV-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase.from('journal_entries').insert({
      organisation_id: entry.organisation_id,
      voucher_number: reverseVoucher,
      entry_date: new Date().toISOString(),
      description: `Reversal: ${entry.description}`,
      debit_account_id: entry.credit_account_id,
      credit_account_id: entry.debit_account_id,
      amount: entry.amount,
      entry_type: 'reversal',
      entered_by: 'system',
      status: 'approved',
      reference: `Reversing ${entry.voucher_number}`,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getTransactions(orgId: string, filters?: any) {
    let query = supabase
      .from('transactions')
      .select('*, account:chart_of_accounts(account_name, account_code)')
      .eq('organisation_id', orgId);

    if (filters?.type) query = query.eq('transaction_type', filters.type);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.from_date) query = query.gte('transaction_date', filters.from_date);
    if (filters?.to_date) query = query.lte('transaction_date', filters.to_date);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('transaction_date', { ascending: false }).limit(200);
    if (error) throw error;
    return data || [];
  }

  async createTransaction(orgId: string, body: any) {
    const txnId = `TXN-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase.from('transactions').insert({
      organisation_id: orgId,
      transaction_id: txnId,
      transaction_date: body.transaction_date || new Date().toISOString(),
      category: body.category,
      amount: body.amount,
      transaction_type: body.transaction_type,
      payment_method: body.payment_method,
      reference: body.reference,
      description: body.description,
      account_id: body.account_id,
      status: body.status || 'completed',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getAssets(orgId: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createAsset(orgId: string, body: any) {
    const { data, error } = await supabase.from('assets').insert({
      organisation_id: orgId,
      asset_name: body.asset_name,
      asset_type: body.asset_type,
      value: body.value,
      purchase_date: body.purchase_date,
      depreciation_method: body.depreciation_method || 'straight_line',
      depreciation_rate: body.depreciation_rate || 10,
      useful_life_years: body.useful_life_years,
      current_value: body.value,
      liability_amount: body.liability_amount || 0,
      description: body.description,
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateAssetValue(id: string, body: any) {
    const { data, error } = await supabase.from('assets').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async createLiability(orgId: string, body: any) {
    const { data, error } = await supabase.from('assets').insert({
      organisation_id: orgId,
      asset_name: body.liability_name,
      asset_type: 'liability',
      value: 0,
      liability_amount: body.amount,
      description: body.description,
      status: 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getBudgets(orgId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('organisation_id', orgId)
      .order('fiscal_year', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createBudget(orgId: string, body: any) {
    const { data, error } = await supabase.from('budgets').insert({
      organisation_id: orgId,
      fiscal_year: body.fiscal_year,
      department: body.department,
      category: body.category,
      allocated: body.allocated,
      spent: body.spent || 0,
      remaining: body.allocated - (body.spent || 0),
      description: body.description,
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateBudget(id: string, body: any) {
    if (body.allocated || body.spent) {
      const current = await supabase.from('budgets').select('allocated, spent').eq('id', id).single();
      if (current.data) {
        const allocated = body.allocated ?? current.data.allocated;
        const spent = body.spent ?? current.data.spent;
        body.remaining = allocated - spent;
      }
    }
    const { data, error } = await supabase.from('budgets').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async getAnalytics(orgId: string) {
    const [ledgersRes, journalRes, transactionsRes, budgetsRes] = await Promise.all([
      supabase.from('chart_of_accounts').select('account_type, balance, account_group').eq('organisation_id', orgId),
      supabase.from('journal_entries').select('amount, entry_type, created_at, entry_date').eq('organisation_id', orgId).order('entry_date'),
      supabase.from('transactions').select('amount, transaction_type, category, transaction_date').eq('organisation_id', orgId).order('transaction_date'),
      supabase.from('budgets').select('allocated, spent, department, category').eq('organisation_id', orgId),
    ]);

    const journalEntries = journalRes.data || [];
    const transactions = transactionsRes.data || [];
    const ledgers = ledgersRes.data || [];
    const budgetsList = budgetsRes.data || [];

    const revenueByMonth: any = {};
    const expensesByMonth: any = {};
    journalEntries.forEach((j: any) => {
      const month = new Date(j.entry_date || j.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (j.entry_type === 'credit') {
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (j.amount || 0);
      } else {
        expensesByMonth[month] = (expensesByMonth[month] || 0) + (j.amount || 0);
      }
    });

    const months = [...new Set([...Object.keys(revenueByMonth), ...Object.keys(expensesByMonth)])].sort();
    const revenueTrend = months.map(m => ({ month: m, revenue: revenueByMonth[m] || 0, expenses: expensesByMonth[m] || 0 }));

    const assetTypes = ledgers.filter((l: any) => l.account_type === 'asset' || l.account_type === 'cash' || l.account_type === 'bank')
      .reduce((acc: any, l: any) => { acc[l.account_group || l.account_type] = (acc[l.account_group || l.account_type] || 0) + (l.balance || 0); return acc; }, {});

    const liabilityTypes = ledgers.filter((l: any) => l.account_type === 'liability' || l.account_type === 'payable')
      .reduce((acc: any, l: any) => { acc[l.account_group || l.account_type] = (acc[l.account_group || l.account_type] || 0) + (l.balance || 0); return acc; }, {});

    const budgetUtilization = budgetsList.map((b: any) => ({
      department: b.department,
      allocated: b.allocated,
      spent: b.spent,
      utilization: b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0,
    }));

    const cashFlow = transactions.filter((t: any) => t.transaction_type === 'income' || t.transaction_type === 'expense')
      .reduce((acc: any, t: any) => {
        const month = new Date(t.transaction_date).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!acc[month]) acc[month] = { income: 0, expense: 0 };
        if (t.transaction_type === 'income') acc[month].income += t.amount || 0;
        else acc[month].expense += t.amount || 0;
        return acc;
      }, {});

    const cashFlowData = Object.entries(cashFlow).map(([month, data]: [string, any]) => ({ month, ...data }));
    const totalRevenue = journalEntries.filter((j: any) => j.entry_type === 'credit').reduce((s: number, j: any) => s + (j.amount || 0), 0);
    const totalExpenses = journalEntries.filter((j: any) => j.entry_type === 'debit').reduce((s: number, j: any) => s + (j.amount || 0), 0);

    return {
      revenueTrend,
      cashFlowData,
      assetDistribution: Object.entries(assetTypes).map(([k, v]) => ({ name: k, value: v })),
      liabilityBreakdown: Object.entries(liabilityTypes).map(([k, v]) => ({ name: k, value: v })),
      budgetUtilization,
      profitLoss: { revenue: totalRevenue, expenses: totalExpenses, netProfit: totalRevenue - totalExpenses },
      totals: {
        totalRevenue,
        totalExpenses,
        totalAssets: ledgers.filter((l: any) => ['asset', 'cash', 'bank'].includes(l.account_type)).reduce((s: number, l: any) => s + (l.balance || 0), 0),
        totalLiabilities: ledgers.filter((l: any) => ['liability', 'payable'].includes(l.account_type)).reduce((s: number, l: any) => s + (l.balance || 0), 0),
      },
    };
  }

  async getAiInsights(orgId: string) {
    const dashData = await this.getDashboard(orgId);
    const analytics = await this.getAnalytics(orgId);

    const revenueForecast = dashData.totalRevenue * 1.12;
    const expenseForecast = dashData.totalExpenses * 1.08;
    const cashFlowWarning = dashData.cashBalance < dashData.totalExpenses * 0.3 ? 'Low cash reserve detected' : 'Healthy cash position';
    const budgetAlerts = analytics.budgetUtilization.filter((b: any) => b.utilization > 85).map((b: any) =>
      `${b.department} budget at ${b.utilization}% utilization`
    );

    return {
      revenueForecast: `$${(revenueForecast / 1000).toFixed(1)}K`,
      expenseForecast: `$${(expenseForecast / 1000).toFixed(1)}K`,
      projectedNetProfit: `$${((revenueForecast - expenseForecast) / 1000).toFixed(1)}K`,
      cashFlowWarning,
      budgetAlerts: budgetAlerts.length > 0 ? budgetAlerts : ['All budgets within healthy range'],
      financialHealthScore: dashData.financialHealthScore,
      recommendations: [
        dashData.outstandingReceivables > dashData.totalRevenue * 0.2 ? 'Improve receivables collection' : 'Receivables are well managed',
        dashData.budgetUtilization > 80 ? 'Review budget allocation for next quarter' : 'Budget utilization is optimal',
        dashData.cashBalance < dashData.totalExpenses * 0.5 ? 'Build cash reserve for operational stability' : 'Cash reserve is adequate',
        'Consider investing surplus funds in short-term instruments',
      ],
      riskFactors: [
        { factor: 'Liquidity Risk', level: dashData.cashBalance < dashData.totalExpenses * 0.3 ? 'High' : 'Low', value: dashData.cashBalance },
        { factor: 'Credit Risk', level: dashData.outstandingReceivables > dashData.totalRevenue * 0.3 ? 'High' : 'Moderate', value: dashData.outstandingReceivables },
        { factor: 'Budget Risk', level: dashData.budgetUtilization > 85 ? 'High' : 'Low', value: dashData.budgetUtilization },
      ],
    };
  }

  async getReports(orgId: string, type?: string) {
    const [ledgers, journalEntries, assets, budgetsList] = await Promise.all([
      this.getLedgers(orgId),
      this.getJournalEntries(orgId),
      this.getAssets(orgId),
      this.getBudgets(orgId),
    ]);

    const debitTotal = journalEntries.filter((j: any) => j.entry_type === 'debit').reduce((s: number, j: any) => s + (j.amount || 0), 0);
    const creditTotal = journalEntries.filter((j: any) => j.entry_type === 'credit').reduce((s: number, j: any) => s + (j.amount || 0), 0);

    return {
      generalLedger: ledgers,
      trialBalance: { totalDebits: debitTotal, totalCredits: creditTotal, balanced: debitTotal === creditTotal },
      profitLoss: { revenue: creditTotal, expenses: debitTotal, netProfit: creditTotal - debitTotal },
      balanceSheet: {
        totalAssets: ledgers.filter((l: any) => ['asset', 'cash', 'bank'].includes(l.account_type)).reduce((s: number, l: any) => s + (l.balance || 0), 0),
        totalLiabilities: ledgers.filter((l: any) => ['liability', 'payable'].includes(l.account_type)).reduce((s: number, l: any) => s + (l.balance || 0), 0),
        equity: creditTotal - debitTotal,
      },
      assetReport: assets,
      budgetReport: budgetsList,
      generatedAt: new Date().toISOString(),
    };
  }

  async getSidebar(orgId: string) {
    const stats = await this.getDashboard(orgId);
    return {
      stats: [
        { label: 'Total Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: 'TrendingUp' },
        { label: 'Net Profit', value: `$${(stats.netProfit / 1000).toFixed(1)}K`, icon: 'DollarSign' },
        { label: 'Total Assets', value: `$${(stats.totalAssets / 1000).toFixed(1)}K`, icon: 'Building2' },
        { label: 'Health Score', value: `${stats.financialHealthScore}%`, icon: 'Activity' },
      ],
      overview: {
        revenue: stats.totalRevenue,
        expenses: stats.totalExpenses,
        assets: stats.totalAssets,
        liabilities: stats.totalLiabilities,
        doughnutData: [
          { name: 'Revenue', value: stats.totalRevenue, color: '#22C55E' },
          { name: 'Expenses', value: stats.totalExpenses, color: '#EF4444' },
          { name: 'Assets', value: stats.totalAssets, color: '#6D4CFF' },
          { name: 'Liabilities', value: stats.totalLiabilities, color: '#F59E0B' },
        ],
      },
      recentTransactions: [],
      aiInsights: {
        revenueForecast: `$${((stats.totalRevenue * 1.12) / 1000).toFixed(1)}K`,
        expenseForecast: `$${((stats.totalExpenses * 1.08) / 1000).toFixed(1)}K`,
        financialTrend: stats.netProfit > 0 ? 'up' : 'down',
      },
    };
  }
}

export const accountsService = new AccountsService();
