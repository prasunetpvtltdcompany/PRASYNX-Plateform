import { supabase } from '../config/database';

export class StaffExpensesService {
  async getExpenses(orgId: string, filters?: any) {
    let query = supabase
      .from('org_expenses')
      .select('*, staff:staff_records!org_expenses_staff_id_fkey(full_name, staff_unique_id, department, designation)')
      .eq('organisation_id', orgId);

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.from) query = query.gte('date', filters.from);
    if (filters?.to) query = query.lte('date', filters.to);

    const { data, error } = await query.order('date', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createExpense(orgId: string, body: any, userId?: string) {
    const { data, error } = await supabase.from('org_expenses').insert({
      organisation_id: orgId,
      staff_id: body.staff_id || null,
      category: body.category || 'Operations',
      item: body.item || body.description || '',
      amount: body.amount || 0,
      date: body.date || new Date().toISOString().slice(0, 10),
      status: body.status || 'pending',
      notes: body.notes || null,
      created_by: userId || null,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateExpense(id: string, body: any) {
    const updates: any = {};
    if (body.status) updates.status = body.status;
    if (body.category) updates.category = body.category;
    if (body.item !== undefined) updates.item = body.item;
    if (body.amount !== undefined) updates.amount = body.amount;
    if (body.date) updates.date = body.date;
    if (body.notes !== undefined) updates.notes = body.notes;

    const { data, error } = await supabase.from('org_expenses').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteExpense(id: string) {
    const { error } = await supabase.from('org_expenses').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  async getSummary(orgId: string) {
    const rows = await this.getExpenses(orgId);
    const num = (v: any) => Number(v) || 0;
    const total = rows.reduce((s: number, r: any) => s + num(r.amount), 0);

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    rows.forEach((r: any) => {
      const c = r.category || 'Other';
      byCategory[c] = (byCategory[c] || 0) + num(r.amount);
      byStatus[r.status || 'pending'] = (byStatus[r.status || 'pending'] || 0) + 1;
      const m = r.date ? String(r.date).slice(0, 7) : '—';
      monthly[m] = (monthly[m] || 0) + num(r.amount);
    });

    return {
      total,
      count: rows.length,
      approvedCount: byStatus.approved || 0,
      pendingCount: byStatus.pending || 0,
      rejectedCount: byStatus.rejected || 0,
      avgPerEntry: rows.length ? Math.round(total / rows.length) : 0,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      byStatus,
      monthly: Object.entries(monthly).map(([month, value]) => ({ month, value })).sort((a, b) => a.month.localeCompare(b.month)),
    };
  }
}

export const staffExpensesService = new StaffExpensesService();
