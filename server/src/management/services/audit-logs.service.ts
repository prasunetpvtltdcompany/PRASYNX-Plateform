import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AuditLogsService {
  async getDashboard(orgId: string) {
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100);

    const all = logs || [];
    const total = all.length;

    const severityCounts = { info: 0, warning: 0, error: 0, critical: 0 };
    const actionCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};
    const entityCounts: Record<string, number> = {};

    for (const log of all) {
      severityCounts[log.severity as keyof typeof severityCounts] = (severityCounts[log.severity as keyof typeof severityCounts] || 0) + 1;
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      const day = new Date(log.created_at).toISOString().slice(0, 10);
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      if (log.entity_type) entityCounts[log.entity_type] = (entityCounts[log.entity_type] || 0) + 1;
    }

    const today = new Date().toISOString().slice(0, 10);

    return {
      summary: {
        totalLogs: total,
        todayLogs: dailyCounts[today] || 0,
        info: severityCounts.info,
        warning: severityCounts.warning,
        error: severityCounts.error,
        critical: severityCounts.critical,
        uniqueActions: Object.keys(actionCounts).length,
      },
      severityBreakdown: severityCounts,
      topActions: Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([action, count]) => ({ action, count })),
      entityBreakdown: Object.entries(entityCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([entity, count]) => ({ entity, count })),
      recentLogs: all.slice(0, 20).map(l => ({
        id: l.id,
        action: l.action,
        entity_type: l.entity_type,
        severity: l.severity,
        created_at: l.created_at,
        details: l.details,
      })),
    };
  }

  async getLogs(orgId: string, filters?: {
    action?: string;
    entityType?: string;
    severity?: string;
    userId?: string;
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('audit_logs')
      .select('*, users:user_id(email, full_name, role)', { count: 'exact' })
      .eq('organisation_id', orgId);

    if (filters?.action) query = query.ilike('action', `${filters.action}%`);
    if (filters?.entityType) query = query.eq('entity_type', filters.entityType);
    if (filters?.severity) query = query.eq('severity', filters.severity);
    if (filters?.userId) query = query.eq('user_id', filters.userId);
    if (filters?.from) query = query.gte('created_at', filters.from);
    if (filters?.to) query = query.lte('created_at', filters.to);
    if (filters?.search) {
      query = query.or(
        `action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%,entity_id.ilike.%${filters.search}%,users.email.ilike.%${filters.search}%,users.full_name.ilike.%${filters.search}%`
      );
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new BadRequestError(error.message);

    return {
      data: (data || []).map(l => ({
        ...l,
        user_name: l.users?.full_name || null,
        user_email: l.users?.email || null,
        users: undefined,
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getLogById(logId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, users:user_id(email, full_name)')
      .eq('id', logId)
      .single();
    if (error) throw new BadRequestError(error.message);
    const { users, ...rest } = data || {};
    return { ...rest, user_name: users?.full_name || null, user_email: users?.email || null };
  }

  async createLog(orgId: string, data: any) {
    const log = {
      organisation_id: orgId,
      user_id: data.user_id,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      details: data.details || {},
      ip_address: data.ip_address,
      severity: data.severity || 'info',
    };
    const { data: result, error } = await supabase.from('audit_logs').insert(log).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getDistinctActions(orgId: string) {
    const { data } = await supabase
      .from('audit_logs')
      .select('action')
      .eq('organisation_id', orgId);
    const actions = [...new Set((data || []).map(d => d.action))].sort();
    return actions;
  }

  async getDistinctEntityTypes(orgId: string) {
    const { data } = await supabase
      .from('audit_logs')
      .select('entity_type')
      .eq('organisation_id', orgId)
      .not('entity_type', 'is', null);
    const types = [...new Set((data || []).map(d => d.entity_type))].sort();
    return types;
  }

  async getRetentionConfig(orgId: string) {
    const { data } = await supabase
      .from('audit_retention_config')
      .select('*')
      .eq('organisation_id', orgId)
      .single();
    return data || { retention_days: 365, max_logs: 100000, auto_archive: false };
  }

  async updateRetentionConfig(orgId: string, data: any) {
    const config = {
      organisation_id: orgId,
      retention_days: data.retention_days || 365,
      max_logs: data.max_logs || 100000,
      auto_archive: data.auto_archive || false,
      archive_to: data.archive_to,
    };
    const { data: result, error } = await supabase
      .from('audit_retention_config')
      .upsert(config, { onConflict: 'organisation_id' })
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async purgeLogs(orgId: string, olderThanDays: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const { data: oldLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('organisation_id', orgId)
      .lt('created_at', cutoff.toISOString());

    if (oldLogs && oldLogs.length > 0) {
      const archiveEntries = oldLogs.map(l => ({
        organisation_id: l.organisation_id,
        user_id: l.user_id,
        action: l.action,
        entity_type: l.entity_type,
        entity_id: l.entity_id,
        details: l.details,
        ip_address: l.ip_address,
        severity: l.severity,
        original_created_at: l.created_at,
      }));
      await supabase.from('audit_log_archive').insert(archiveEntries);
      await supabase.from('audit_logs').delete().in('id', oldLogs.map(l => l.id));
    }

    return { purged: oldLogs?.length || 0, olderThanDays };
  }
}

export const auditLogsService = new AuditLogsService();
