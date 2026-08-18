import { supabase } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function lastMonths(n: number): { label: string; key: string }[] {
  const out: { label: string; key: string }[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ label: `${MONTHS[m.getMonth()]} ${String(m.getFullYear()).slice(2)}`, key: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}` });
  }
  return out;
}

function monthlyAmount(amount: number, cycle: string): number {
  return cycle === 'yearly' ? (amount || 0) / 12 : amount || 0;
}

// Next billing date: monthly = 30-day period, yearly = 12 months.
function addBillingPeriod(from: string | null | undefined, cycle: string): string {
  const d = from ? new Date(from) : new Date();
  if (cycle === 'yearly') d.setMonth(d.getMonth() + 12);
  else d.setDate(d.getDate() + 30);
  return d.toISOString();
}

const INV_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
// Invoice number format: INV- + 10 random alphanumeric digits.
function genInvoiceNumber(): string {
  let s = '';
  for (let i = 0; i < 10; i++) s += INV_CHARS[Math.floor(Math.random() * INV_CHARS.length)];
  return `INV-${s}`;
}

// New invoice columns added via migration — may not exist yet in some environments.
const NEW_INVOICE_COLS = ['transaction_type', 'payment_method', 'transaction_ref', 'bank_name', 'notes'];

// Insert an invoice row, progressively dropping columns that don't exist in the table yet.
async function insertInvoiceRow(row: Record<string, any>): Promise<{ data: any; error: any }> {
  let lastErr: any = null;
  for (let drop = 0; drop <= NEW_INVOICE_COLS.length; drop++) {
    const attempt = { ...row };
    for (let i = 0; i < drop; i++) delete attempt[NEW_INVOICE_COLS[i]];
    const { data, error } = await supabase.from('invoices').insert(attempt).select().single();
    if (!error) return { data, error: null };
    lastErr = error;
  }
  return { data: null, error: lastErr };
}

// Update an invoice row, progressively dropping columns that don't exist yet.
async function updateInvoiceRow(id: string, patch: Record<string, any>): Promise<{ data: any; error: any }> {
  let lastErr: any = null;
  for (let drop = 0; drop <= NEW_INVOICE_COLS.length; drop++) {
    const attempt = { ...patch };
    for (let i = 0; i < drop; i++) delete attempt[NEW_INVOICE_COLS[i]];
    const { data, error } = await supabase.from('invoices').update(attempt).eq('id', id).select().single();
    if (!error) return { data, error: null };
    lastErr = error;
  }
  return { data: null, error: lastErr };
}

export class BillingService {
  async getOverview() {
    const fallback = {
      totalRevenue: 0, mrr: 0, activeSubscriptions: 0, trialingSubscriptions: 0,
      pastDueSubscriptions: 0, cancelledSubscriptions: 0, newSubscriptions: 0,
      avgRevenuePerOrg: 0, currency: 'INR',
      revenueTrend: lastMonths(6).map(m => ({ month: m.label, amount: 0 })),
      revenueBreakdown: [],
      planPerformance: [],
      topPlans: [],
    };
    try {
      const { data: subs, error: sErr } = await supabase
        .from('subscriptions').select('id, organisation_id, plan_id, plan_key, status, billing_cycle, amount, currency, auto_renew, current_period_start, current_period_end, start_date, created_at');
      if (sErr) return fallback;

      const { data: plans, error: pErr } = await supabase
        .from('subscription_plans').select('id, plan_key, name, monthly_price, yearly_price, currency').order('sort_order', { ascending: true });
      if (pErr) return fallback;

const { data: invoices, error: iErr } = await supabase
        .from('invoices').select('amount, currency, status, issue_date, paid_at, transaction_type, organisation_id');
      if (iErr) return fallback;

      const list = subs || [];
      const active = list.filter(s => s.status === 'active');
      const mrr = active.reduce((sum, s) => sum + monthlyAmount(Number(s.amount) || 0, s.billing_cycle), 0);
      // Revenue counts every created invoice (any status except void) — no paid check.
      const invoiced = (invoices || []).filter(i => i.status !== 'void');
      const totalRevenue = invoiced.length
        ? invoiced.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
        : mrr * 12;

      const now = new Date();
      // Monthly revenue = invoices created this calendar month (any status except void).
      const monthlyRevenue = invoiced
        .filter(i => {
          const d = new Date(i.issue_date || Date.now());
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      const newSubscriptions = list.filter(s => {
        const st = s.current_period_start || s.start_date || s.created_at;
        return st && new Date(st).getMonth() === now.getMonth() && new Date(st).getFullYear() === now.getFullYear();
      }).length;

      const trendMap: Record<string, number> = {};
      lastMonths(6).forEach(m => { trendMap[m.key] = 0; });
      (invoices || []).forEach(inv => {
        if (inv.status === 'void') return;
        const d = new Date(inv.issue_date || Date.now());
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (trendMap[key] !== undefined) trendMap[key] += Number(inv.amount) || 0;
      });
      const revenueTrend = lastMonths(6).map(m => ({ month: m.label, amount: Math.round(trendMap[m.key] || 0) }));

      // Revenue breakdown by invoice type (subscription / admission / exam / etc.),
      // derived from created invoices rather than subscription plans.
      const typeLabels: Record<string, string> = {
        subscription: 'Subscription', admission: 'Admission', exam: 'Exam / Assessment',
        miscellaneous: 'Miscellaneous', other: 'Other',
      };
const byType: Record<string, { name: string; revenue: number; count: number }> = {};
      invoiced.forEach((inv: any) => {
        const type = inv.transaction_type || 'subscription';
        if (!byType[type]) byType[type] = { name: typeLabels[type] || type, revenue: 0, count: 0 };
        byType[type].revenue += Number(inv.amount) || 0;
        byType[type].count += 1;
      });
      const revenueBreakdown = Object.entries(byType).map(([key, v]) => ({
        plan_key: key, plan_name: v.name, revenue: Math.round(v.revenue), count: v.count,
        percent: totalRevenue > 0 ? Math.round((v.revenue / totalRevenue) * 100) : 0,
      })).sort((a, b) => b.revenue - a.revenue);

      const planPerformance = (plans || []).map(p => {
        const subsOfPlan = list.filter(s => (s.plan_id === p.id || s.plan_key === p.plan_key));
        const activeOfPlan = subsOfPlan.filter(s => s.status === 'active');
        const prevCount = subsOfPlan.filter(s => {
          const st = s.current_period_start || s.start_date || s.created_at;
          if (!st) return false;
          const d = new Date(st);
          const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d >= prev && d < new Date(now.getFullYear(), now.getMonth(), 1);
        }).length;
        const revenue = activeOfPlan.reduce((sum, s) => sum + monthlyAmount(Number(s.amount) || 0, s.billing_cycle), 0);
        return {
          plan_key: p.plan_key, plan_name: p.name,
          monthly_price: Number(p.monthly_price) || 0, yearly_price: Number(p.yearly_price) || 0,
          subscribers: activeOfPlan.length,
          revenue: Math.round(revenue),
          growth: Math.round(prevCount),
        };
      });

      return {
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        mrr: Math.round(mrr),
        activeSubscriptions: active.length,
        trialingSubscriptions: list.filter(s => s.status === 'trialing').length,
        pastDueSubscriptions: list.filter(s => s.status === 'past_due').length,
        cancelledSubscriptions: list.filter(s => s.status === 'cancelled').length,
        newSubscriptions,
        // Avg revenue per org = total billed revenue across invoiced organisations.
        avgRevenuePerOrg: (() => {
          const orgsWithRevenue = new Set(invoiced.map((i: any) => i.organisation_id)).size;
          return orgsWithRevenue ? Math.round(totalRevenue / orgsWithRevenue) : 0;
        })(),
        currency: 'INR',
        revenueTrend,
        revenueBreakdown,
        planPerformance,
        topPlans: revenueBreakdown.slice(0, 3),
      };
    } catch {
      return fallback;
    }
  }

  async getPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async createPlan(body: any) {
    const plan_key = String(body.plan_key || '').toLowerCase().trim();
    if (!plan_key) throw new BadRequestError('plan_key is required');
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
        plan_key,
        name: body.name || plan_key,
        description: body.description || '',
        currency: body.currency || 'INR',
        monthly_price: Number(body.monthly_price) || 0,
        yearly_price: Number(body.yearly_price) || 0,
        student_capacity: Number(body.student_capacity) || 500,
        max_admins: Number(body.max_admins) || 2,
        features: Array.isArray(body.features) ? body.features : [],
        status: body.status || 'active',
        sort_order: Number(body.sort_order) || 99,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updatePlan(id: string, body: any) {
    const { data: existing } = await supabase
      .from('subscription_plans').select('id').eq('id', id).single();
    if (!existing) throw new NotFoundError('Plan not found');

    const patch: Record<string, any> = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.description !== undefined) patch.description = body.description;
    if (body.currency !== undefined) patch.currency = body.currency;
    if (body.monthly_price !== undefined) patch.monthly_price = Number(body.monthly_price) || 0;
    if (body.yearly_price !== undefined) patch.yearly_price = Number(body.yearly_price) || 0;
    if (body.student_capacity !== undefined) patch.student_capacity = Number(body.student_capacity) || 0;
    if (body.max_admins !== undefined) patch.max_admins = Number(body.max_admins) || 0;
    if (body.features !== undefined) patch.features = Array.isArray(body.features) ? body.features : [];
    if (body.status !== undefined) patch.status = body.status;
    if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 99;
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('subscription_plans').update(patch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deletePlan(id: string) {
    const { data: existing } = await supabase
      .from('subscription_plans').select('id').eq('id', id).single();
    if (!existing) throw new NotFoundError('Plan not found');

    const { count } = await supabase
      .from('subscriptions').select('*', { head: true, count: 'exact' }).eq('plan_id', id);
    if (count && count > 0) {
      const { data, error } = await supabase
        .from('subscription_plans').update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return { ...data, archived: true };
    }
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id, deleted: true };
  }

  async deleteSubscription(id: string) {
    const { data: existing } = await supabase
      .from('subscriptions').select('id, organisation_id, plan_key').eq('id', id).single();
    if (!existing) throw new NotFoundError('Subscription not found');

    await supabase.from('invoices').delete().eq('organisation_id', existing.organisation_id);

    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id, deleted: true };
  }

  async getSubscriptions() {
    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const { data: orgs } = await supabase
      .from('organisations').select('id, name, code, email, status, created_at');
    const { data: plans } = await supabase
      .from('subscription_plans').select('id, plan_key, name, monthly_price, yearly_price');

    const orgMap = new Map((orgs || []).map(o => [o.id, o]));
    const planMap = new Map((plans || []).map(p => [p.id, p]));
    const planByKey = new Map((plans || []).map(p => [p.plan_key, p]));

    return (subs || []).map(s => {
      const org = orgMap.get(s.organisation_id);
      const plan = planMap.get(s.plan_id) || planByKey.get(s.plan_key);
      const cycle = s.billing_cycle || 'yearly';
      const catalogPrice = Number(plan?.[cycle === 'yearly' ? 'yearly_price' : 'monthly_price']) || 0;
      const nextBilling = s.current_period_end || addBillingPeriod(s.current_period_start || s.start_date, cycle);
      return {
        id: s.id,
        organisation_id: s.organisation_id,
        organisation_name: org?.name || 'Unknown school',
        organisation_code: org?.code || null,
        organisation_email: org?.email || '',
        organisation_status: org?.status || 'pending',
        plan_key: s.plan_key,
        plan_id: s.plan_id,
        plan_name: plan?.name || s.plan_key,
        status: s.status,
        billing_cycle: cycle,
        amount: catalogPrice || Number(s.amount) || 0,
        currency: s.currency || 'INR',
        auto_renew: s.auto_renew,
        start_date: s.start_date,
        current_period_start: s.current_period_start,
        current_period_end: s.current_period_end,
        next_billing_date: nextBilling,
        created_at: s.created_at,
      };
    });
  }

  async updateSubscription(id: string, body: any) {
    const { data: existing } = await supabase
      .from('subscriptions').select('*').eq('id', id).single();
    if (!existing) throw new NotFoundError('Subscription not found');

    const patch: Record<string, any> = {};
    if (body.status !== undefined) patch.status = body.status;
    if (body.auto_renew !== undefined) patch.auto_renew = Boolean(body.auto_renew);
    if (body.billing_cycle !== undefined) patch.billing_cycle = body.billing_cycle;
    if (body.current_period_end !== undefined) patch.current_period_end = body.current_period_end;
    else if (body.next_billing_date !== undefined) patch.current_period_end = body.next_billing_date;

    let plan = null;
    if (body.plan_key) {
      const { data: p } = await supabase
        .from('subscription_plans').select('*').eq('plan_key', body.plan_key).maybeSingle();
      plan = p;
    } else if (body.plan_id) {
      const { data: p } = await supabase
        .from('subscription_plans').select('*').eq('id', body.plan_id).maybeSingle();
      plan = p;
    }

    if (plan) {
      patch.plan_id = plan.id;
      patch.plan_key = plan.plan_key;
      const cycle = body.billing_cycle || existing.billing_cycle || 'yearly';
      patch.amount = cycle === 'yearly' ? Number(plan.yearly_price) || 0 : Number(plan.monthly_price) || 0;
      patch.currency = plan.currency || existing.currency || 'INR';
    } else if (body.amount !== undefined) {
      patch.amount = Number(body.amount) || 0;
    }

    // Recompute the next billing date when the cycle changed and no explicit date was provided.
    const newCycle = patch.billing_cycle || existing.billing_cycle || 'yearly';
    if (!patch.current_period_end && (patch.billing_cycle || plan)) {
      const base = body.current_period_start || existing.current_period_start || existing.start_date;
      patch.current_period_end = addBillingPeriod(base, newCycle);
    }
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('subscriptions').update(patch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const { data: orgs } = await supabase.from('organisations').select('id, name, code');
    const orgMap = new Map((orgs || []).map(o => [o.id, o]));

    return (data || []).map(inv => ({
      ...inv,
      organisation_name: orgMap.get(inv.organisation_id)?.name || 'Unknown school',
      organisation_code: orgMap.get(inv.organisation_id)?.code || null,
      amount: Number(inv.amount) || 0,
      items: Array.isArray(inv.items) ? inv.items : [],
    }));
  }

  async createInvoice(body: any) {
    if (!body.organisation_id) throw new BadRequestError('organisation_id is required');
    const { data: org } = await supabase
      .from('organisations').select('id').eq('id', body.organisation_id).single();
    if (!org) throw new NotFoundError('Organisation not found');

    const { data: sub } = await supabase
      .from('subscriptions').select('id').eq('organisation_id', body.organisation_id).maybeSingle();

    const amount = Number(body.amount) || 0;
    const type = ['subscription', 'other', 'admission', 'exam', 'miscellaneous'].includes(body.transaction_type)
      ? body.transaction_type
      : 'subscription';
    let invoice_number = body.invoice_number || '';
    if (!invoice_number) {
      for (let i = 0; i < 5; i++) {
        invoice_number = genInvoiceNumber();
        const { data: dup } = await supabase
          .from('invoices').select('id').eq('invoice_number', invoice_number).maybeSingle();
        if (!dup) break;
        invoice_number = '';
      }
      if (!invoice_number) throw new Error('Could not generate a unique invoice number');
    }

    const row: Record<string, any> = {
      organisation_id: body.organisation_id,
      subscription_id: body.subscription_id || sub?.id || null,
      invoice_number,
      amount,
      currency: body.currency || 'INR',
      status: body.status || 'pending',
      issue_date: body.issue_date || new Date().toISOString().slice(0, 10),
      due_date: body.due_date || null,
      items: Array.isArray(body.items) ? body.items : [{ description: 'Manual invoice', amount, period: 'Manual' }],
      transaction_type: type,
    };
    if (row.status === 'paid') row.paid_at = new Date().toISOString();

    const { data, error } = await insertInvoiceRow(row);
    if (error) throw new Error(error.message);
    return data;
  }

  async updateInvoiceStatus(id: string, status: string) {
    const allowed = ['paid', 'pending', 'overdue', 'failed', 'void'];
    if (!allowed.includes(status)) throw new BadRequestError('Invalid invoice status');
    const patch: Record<string, any> = { status };
    if (status === 'paid') patch.paid_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('invoices').update(patch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Auto-generate an invoice for an auto-renew subscription (monthly or yearly).
  // Exactly ONE invoice per organisation per billing period (monthly -> per calendar
  // month, yearly -> per calendar year). No duplicates.
  async ensureInvoiceForSubscription(sub: any) {
    if (!sub?.id || sub.auto_renew === false) return null;
    const amount = Number(sub.amount) || 0;
    if (amount <= 0) return null;

    const now = new Date();
    const isMonthly = sub.billing_cycle === 'monthly';
    const start = new Date(now.getFullYear(), isMonthly ? now.getMonth() : 0, 1);
    const end = new Date(now.getFullYear() + (isMonthly ? 0 : 1), isMonthly ? now.getMonth() + 1 : 0, 1);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const { data: existing } = await supabase
      .from('invoices').select('id')
      .eq('subscription_id', sub.id)
      .gte('issue_date', startStr)
      .lt('issue_date', endStr);
    if (existing && existing.length > 0) return null;

    let invoice_number = '';
    for (let i = 0; i < 5; i++) {
      invoice_number = genInvoiceNumber();
      const { data: dup } = await supabase
        .from('invoices').select('id').eq('invoice_number', invoice_number).maybeSingle();
      if (!dup) break;
      invoice_number = '';
    }
    if (!invoice_number) return null;

    const { data: planInfo } = await supabase
      .from('subscription_plans').select('name').eq('plan_key', sub.plan_key).maybeSingle();
    const { data, error } = await supabase.from('invoices').insert({
      organisation_id: sub.organisation_id,
      subscription_id: sub.id,
      invoice_number,
      amount,
      currency: sub.currency || 'INR',
      status: 'paid',
      issue_date: now.toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      paid_at: now.toISOString(),
      items: [{ description: `Subscription – ${planInfo?.name || sub.plan_key}`, amount, period: isMonthly ? 'Monthly' : 'Yearly' }],
    }).select().single();
    if (error) return null;
    return data;
  }

  async deleteInvoice(id: string) {
    const { data: existing } = await supabase.from('invoices').select('id').eq('id', id).single();
    if (!existing) throw new NotFoundError('Invoice not found');
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id, deleted: true };
  }

  // Remove the recorded transaction (payment details) from an invoice WITHOUT
  // deleting the invoice itself. Clears payment fields, marks it pending again.
  async deleteTransaction(id: string) {
    const { data: existing } = await supabase.from('invoices').select('id').eq('id', id).single();
    if (!existing) throw new NotFoundError('Transaction not found');

    const patch: Record<string, any> = {
      payment_method: null,
      transaction_ref: null,
      bank_name: null,
      notes: null,
      transaction_type: null,
      paid_at: null,
      status: 'pending',
    };
    const { data, error } = await updateInvoiceRow(id, patch);
    if (error) throw new Error(error.message);
    return { id, deleted: true };
  }

  // Record a payment received from a school (cash / bank transfer / online).
  // Stored in the same invoices table. Only allowed when the organisation already
  // has an invoice generated — admins cannot add transactions out of the blue.
  // Reuses an unpaid invoice for the current billing period when one exists.
  async recordTransaction(body: any) {
    if (!body.organisation_id) throw new BadRequestError('organisation_id is required');
    const { data: org } = await supabase
      .from('organisations').select('id').eq('id', body.organisation_id).single();
    if (!org) throw new NotFoundError('Organisation not found');

    const amount = Number(body.amount) || 0;
    if (amount <= 0) throw new BadRequestError('Amount must be greater than zero');
    const method = ['cash', 'bank_transfer', 'online'].includes(body.payment_method)
      ? body.payment_method
      : 'cash';
    const txType = ['subscription', 'other', 'admission', 'exam', 'miscellaneous'].includes(body.transaction_type)
      ? body.transaction_type
      : 'subscription';
    const txLabel: Record<string, string> = {
      subscription: 'Subscription', admission: 'Admission', exam: 'Exam / Assessment',
      miscellaneous: 'Miscellaneous', other: 'Other',
    };
    const txLabelText = txLabel[txType] || txType;

    // The transaction type comes from the invoice: an invoice of this exact type
    // must already exist before a transaction of that type can be recorded.
    const { data: allInvoices } = await supabase
      .from('invoices').select('*').eq('organisation_id', body.organisation_id);
    const typeMatches = (i: any) => (i.transaction_type || 'subscription') === txType;
    const typedInvoices = (allInvoices || []).filter(typeMatches);
    if (typedInvoices.length === 0) {
      throw new BadRequestError(
        `No ${txLabelText} invoice exists for this organisation yet. Generate an invoice first.`
      );
    }

    const { data: sub } = await supabase
      .from('subscriptions').select('id, plan_key, billing_cycle, currency').eq('organisation_id', body.organisation_id).maybeSingle();

    const now = new Date();
    const isMonthly = sub?.billing_cycle === 'monthly';
    const start = new Date(now.getFullYear(), isMonthly ? now.getMonth() : 0, 1);
    const end = new Date(now.getFullYear() + (isMonthly ? 0 : 1), isMonthly ? now.getMonth() + 1 : 0, 1);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const period = typedInvoices
      .filter((i: any) => i.issue_date >= startStr && i.issue_date < endStr)
      .sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));

    // One transaction per invoice: if this period's invoice of this type already
    // has a payment recorded, block duplicates instead of creating another invoice.
    const paidInPeriod = period.find((i: any) => i.status === 'paid');
    if (paidInPeriod) {
      throw new BadRequestError(
        `Invoice ${paidInPeriod.invoice_number} already has a transaction recorded. Edit it instead of adding a duplicate.`
      );
    }
    const target = period.find((i: any) => i.status !== 'paid') || null;

    const payPatch = {
      payment_method: method,
      transaction_ref: body.transaction_ref || null,
      bank_name: body.bank_name || null,
      notes: body.notes || null,
      transaction_type: txType,
      status: 'paid',
      paid_at: body.paid_at ? new Date(body.paid_at).toISOString() : now.toISOString(),
      due_date: body.due_date || new Date(now.getTime() + 15 * 86400000).toISOString().slice(0, 10),
    };

    if (target) {
      const { data, error } = await updateInvoiceRow(target.id, payPatch);
      if (error) throw new Error(error.message);
      return { transaction: data, updated: true };
    }

    let invoice_number = '';
    for (let i = 0; i < 5; i++) {
      invoice_number = genInvoiceNumber();
      const { data: dup } = await supabase
        .from('invoices').select('id').eq('invoice_number', invoice_number).maybeSingle();
      if (!dup) break;
      invoice_number = '';
    }
    if (!invoice_number) throw new Error('Could not generate a unique invoice number');

    const row: Record<string, any> = {
      organisation_id: body.organisation_id,
      subscription_id: sub?.id || null,
      invoice_number,
      amount,
      currency: body.currency || sub?.currency || 'INR',
      issue_date: body.issue_date || now.toISOString().slice(0, 10),
      items: [{
        description: txType === 'subscription' ? 'Subscription payment' : `Payment – ${txType}${body.notes ? ` (${body.notes})` : ''}`,
        amount,
        period: isMonthly ? 'Monthly' : 'Yearly',
      }],
      ...payPatch,
    };

    const { data, error } = await insertInvoiceRow(row);
    if (error) throw new Error(error.message);
    return { transaction: data, created: true };
  }

  // Edit an existing transaction (invoice payment details / purpose / amount).
  async updateTransaction(id: string, body: any) {
    const { data: existing } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (!existing) throw new NotFoundError('Transaction not found');

    const patch: Record<string, any> = {};
    if (body.amount !== undefined) patch.amount = Number(body.amount) || 0;
    if (body.status !== undefined) patch.status = body.status;
    if (body.paid_at !== undefined) patch.paid_at = body.paid_at || null;
    if (body.payment_method !== undefined) patch.payment_method = body.payment_method;
    if (body.transaction_ref !== undefined) patch.transaction_ref = body.transaction_ref || null;
    if (body.bank_name !== undefined) patch.bank_name = body.bank_name || null;
    if (body.notes !== undefined) patch.notes = body.notes || null;
    if (body.transaction_type !== undefined) patch.transaction_type = body.transaction_type;
    if (body.due_date !== undefined) patch.due_date = body.due_date || null;
    if (body.issue_date !== undefined) patch.issue_date = body.issue_date;

    // Recording/editing a transaction (any type) means the payment was received:
    // flip the invoice status pending -> paid so it counts as revenue.
    const hasPayment = body.payment_method !== undefined || !!existing.payment_method;
    if (body.status === undefined && hasPayment) {
      patch.status = 'paid';
      if (!existing.paid_at && patch.paid_at === undefined) patch.paid_at = new Date().toISOString();
    }

    const { data, error } = await updateInvoiceRow(id, patch);
    if (error) throw new Error(error.message);
    return data;
  }

  async getTransactions() {
    const { data: invoices, error } = await supabase
      .from('invoices').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const { data: orgs } = await supabase.from('organisations').select('id, name, code');
    const orgMap = new Map((orgs || []).map(o => [o.id, o]));

    return (invoices || []).map(inv => ({
      id: inv.id,
      transaction_id: `TXN-${String(inv.invoice_number).replace(/^INV-/, '').slice(0, 8)}`,
      organisation_id: inv.organisation_id,
      organisation_name: orgMap.get(inv.organisation_id)?.name || 'Unknown school',
      organisation_code: orgMap.get(inv.organisation_id)?.code || null,
      invoice_number: inv.invoice_number,
      amount: Number(inv.amount) || 0,
      currency: inv.currency || 'INR',
      status: inv.status,
      type: 'subscription',
      direction: inv.status === 'void' ? 'out' : 'in',
      payment_method: inv.payment_method || null,
      transaction_ref: inv.transaction_ref || null,
      bank_name: inv.bank_name || null,
      notes: inv.notes || null,
      transaction_type: inv.transaction_type || null,
      date: inv.paid_at || null,
      issue_date: inv.issue_date,
      paid_at: inv.paid_at,
    }));
  }

  async reconcile() {
    const { data: orgs, error: oErr } = await supabase
      .from('organisations').select('id');
    if (oErr) throw new Error(oErr.message);

    const { data: plans } = await supabase
      .from('subscription_plans').select('id, plan_key, monthly_price, yearly_price');

    let synced = 0;
    let invoicesCreated = 0;

    for (const org of orgs || []) {
      const { data: existing } = await supabase
        .from('subscriptions').select('id, plan_key, billing_cycle, current_period_start, start_date, current_period_end').eq('organisation_id', org.id).maybeSingle();

      const planKey = existing?.plan_key || 'starter';
      const cycle = existing?.billing_cycle || 'yearly';
      const plan = (plans || []).find(p => p.plan_key === planKey);
      const amount = cycle === 'yearly' ? Number(plan?.yearly_price) || 0 : Number(plan?.monthly_price) || 0;

      if (existing) {
        const nextBilling = existing.current_period_end || addBillingPeriod(existing.current_period_start || existing.start_date, cycle);
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_id: plan?.id || null,
            amount,
            currency: 'INR',
            current_period_end: nextBilling,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (!error) synced += 1;
      } else {
        const now = new Date().toISOString();
        const { error } = await supabase.from('subscriptions').insert({
          organisation_id: org.id,
          plan_id: plan?.id || null,
          plan_key: planKey,
          status: 'active',
          billing_cycle: cycle,
          amount,
          currency: 'INR',
          start_date: now,
          current_period_start: now,
          current_period_end: addBillingPeriod(now, cycle),
        });
        if (!error) synced += 1;
      }
    }

    const { data: subs } = await supabase
      .from('subscriptions').select('id, organisation_id, plan_key, billing_cycle, amount, currency, auto_renew').eq('status', 'active');
    for (const sub of subs || []) {
      const plan = (plans || []).find(p => p.plan_key === sub.plan_key);
      const amount = sub.billing_cycle === 'yearly' ? Number(plan?.yearly_price) || 0 : Number(plan?.monthly_price) || 0;
      if (Number(sub.amount) !== amount) {
        await supabase.from('subscriptions').update({ amount }).eq('id', sub.id);
      }

      const { data: mismatched } = await supabase
        .from('invoices').select('id').eq('subscription_id', sub.id).neq('amount', amount);
      for (const inv of mismatched || []) {
        await supabase.from('invoices')
          .update({ amount, currency: sub.currency || 'INR' })
          .eq('id', inv.id);
        invoicesCreated += 1;
      }

      if (amount <= 0 || sub.auto_renew === false) continue;
      const invoice = await this.ensureInvoiceForSubscription({ ...sub, amount });
      if (invoice) invoicesCreated += 1;
    }

    return { synced, invoicesCreated, organisations: (orgs || []).length };
  }
}

export const billingService = new BillingService();

