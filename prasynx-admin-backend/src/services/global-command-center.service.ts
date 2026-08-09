import crypto from 'crypto';
import { Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

interface ImpersonationSession {
  id: string;
  userId: string;
  role: string;
  organisationId: string;
  orgName: string;
  userName: string;
  startedBy: string;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'ended';
}

const sessions: ImpersonationSession[] = [];

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export class GlobalCommandCenterService {
  // ===================== OVERVIEW =====================
  async getOverview(req: AuthRequest, res: Response) {
    try {
      const [orgs, students, staff, parents] = await Promise.all([
        supabase.from('organisations').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('staff_records').select('*', { count: 'exact', head: true }),
        supabase.from('parents').select('*', { count: 'exact', head: true }),
      ]);
      sendSuccess(res, {
        totalOrganisations: orgs.count || 0,
        totalStudents: students.count || 0,
        totalStaff: staff.count || 0,
        totalParents: parents.count || 0,
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch overview');
    }
  }

  // ===================== ORGANISATIONS =====================
  async listOrganisations(req: AuthRequest, res: Response) {
    try {
      const params = {
        q: req.query.q as string | undefined,
        status: req.query.status as string | undefined,
        plan: req.query.plan as string | undefined,
        region: req.query.region as string | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      };

      let query = supabase.from('organisations').select('*', { count: 'exact' });

      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }
      if (params.q) {
        query = query.or(`name.ilike.%${params.q}%,id.ilike.%${params.q}%`);
      }

      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

      if (error) throw error;

      sendSuccess(res, {
        organisations: (data || []).map((o: any) => ({
          id: o.id,
          name: o.name || 'Unknown',
          plan: o.plan || 'Starter',
          status: o.status || 'pending',
          region: o.region || '',
          created: o.created_at || new Date().toISOString(),
          tier: o.tier || 'silver',
        })),
        total: count || 0,
        page: params.page,
        limit: params.limit,
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch organisations');
    }
  }

  async getOrganisation(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase.from('organisations').select('*').eq('id', req.params.id).maybeSingle();
      if (error) throw error;
      if (!data) return sendError(res, 'Organisation not found', 404);
      sendSuccess(res, {
        id: data.id, name: data.name || 'Unknown',
        plan: data.plan || 'Starter', status: data.status || 'pending',
        region: data.region || '',
        created: data.created_at || new Date().toISOString(),
        tier: data.tier || 'silver',
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch organisation');
    }
  }

  // ===================== PORTAL USERS =====================
  async getStudents(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, status, created_at')
        .eq('organisation_id', req.params.orgId)
        .eq('role', 'student')
        .limit(50);
      if (error) throw error;
      sendSuccess(res, {
        students: (data || []).map((u: any) => ({
          id: u.id, name: u.full_name || 'Student', email: u.email, status: u.status || 'active',
        })),
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch students');
    }
  }

  async getStaff(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, status, created_at')
        .eq('organisation_id', req.params.orgId)
        .in('role', ['teacher', 'staff', 'admin'])
        .limit(50);
      if (error) throw error;
      sendSuccess(res, {
        staff: (data || []).map((u: any) => ({
          id: u.id, name: u.full_name || 'Staff', email: u.email, status: u.status || 'active',
        })),
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch staff');
    }
  }

  async getParents(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, status, created_at')
        .eq('organisation_id', req.params.orgId)
        .eq('role', 'parent')
        .limit(50);
      if (error) throw error;
      sendSuccess(res, {
        parents: (data || []).map((u: any) => ({
          id: u.id, name: u.full_name || 'Parent', email: u.email, status: u.status || 'active',
        })),
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch parents');
    }
  }

  // ===================== GLOBAL SEARCH =====================
  async globalSearch(req: AuthRequest, res: Response) {
    try {
      const q = req.query.q as string;
      const type = (req.query.type as string) || 'all';
      const limit = Number(req.query.limit) || 10;
      if (!q || q.length < 2) return sendError(res, 'Search query must be at least 2 characters', 400);

      const results: any[] = [];

      if (type === 'all' || type === 'organizations') {
        const { data } = await supabase
          .from('organisations')
          .select('id, name, email, status')
          .or(`name.ilike.%${q}%,id.ilike.%${q}%`)
          .limit(limit);
        if (data) {
          data.forEach(o => results.push({ id: o.id, name: o.name, email: o.email, type: 'Organization', status: o.status }));
        }
      }

      if (type === 'all' || type === 'students') {
        const { data } = await supabase
          .from('users')
          .select('id, full_name, email, status')
          .eq('role', 'student')
          .ilike('full_name', `%${q}%`)
          .limit(limit);
        if (data) {
          data.forEach(u => results.push({ id: u.id, name: u.full_name, email: u.email, type: 'Student', status: u.status }));
        }
      }

      if (type === 'all' || type === 'staff') {
        const { data } = await supabase
          .from('users')
          .select('id, full_name, email, status')
          .in('role', ['teacher', 'staff', 'admin'])
          .ilike('full_name', `%${q}%`)
          .limit(limit);
        if (data) {
          data.forEach(u => results.push({ id: u.id, name: u.full_name, email: u.email, type: 'Staff', status: u.status }));
        }
      }

      if (type === 'all' || type === 'parents') {
        const { data } = await supabase
          .from('users')
          .select('id, full_name, email, status')
          .eq('role', 'parent')
          .ilike('full_name', `%${q}%`)
          .limit(limit);
        if (data) {
          data.forEach(u => results.push({ id: u.id, name: u.full_name, email: u.email, type: 'Parent', status: u.status }));
        }
      }

      sendSuccess(res, { results: results.slice(0, limit) });
    } catch (err: any) {
      sendError(res, err.message || 'Search failed');
    }
  }

  // ===================== IMPERSONATION =====================
  async startImpersonation(req: AuthRequest, res: Response) {
    try {
      const { userId, role, organisationId, orgName, userName } = req.body;
      const startedBy = req.user?.email || req.user?.userId || 'Unknown Admin';

      const session: ImpersonationSession = {
        id: generateId('IMP'),
        userId, role, organisationId, orgName, userName,
        startedBy,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: 'active',
      };
      sessions.unshift(session);

      await supabase.from('gcc_impersonation_logs').insert({
        session_id: session.id, user_id: userId, user_name: userName,
        role, organisation_id: organisationId, org_name: orgName,
        started_by: startedBy, started_at: session.startedAt,
        expires_at: session.expiresAt, status: 'active',
      });

      sendSuccess(res, session, 'Impersonation session started');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to start impersonation');
    }
  }

  async stopImpersonation(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.params.sessionId;
      const idx = sessions.findIndex(s => s.id === sessionId && s.status === 'active');
      if (idx === -1) return sendError(res, 'Active session not found', 404);

      sessions[idx].status = 'ended';

      await supabase.from('gcc_impersonation_logs')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('session_id', sessionId);

      sendSuccess(res, sessions[idx], 'Impersonation session ended');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to stop impersonation');
    }
  }

  async getImpersonationSessions(req: AuthRequest, res: Response) {
    try {
      const active = sessions.filter(s => s.status === 'active').map(s => ({
        id: s.id, user: s.userName, role: s.role, org: s.orgName,
        time: this.timeAgo(s.startedAt), by: s.startedBy,
        duration: this.formatDuration(s.startedAt), status: s.status,
      }));
      sendSuccess(res, { sessions: active });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to list sessions');
    }
  }

  // ===================== MONITORING =====================
  async getMonitoring(req: AuthRequest, res: Response) {
    sendSuccess(res, { metrics: [], alerts: [] });
  }

  // ===================== AUDIT LOGS =====================
  async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { data, error, count } = await supabase
        .from('gcc_audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      sendSuccess(res, {
        logs: data || [],
        total: count || 0,
        page,
        limit,
      });
    } catch (err: any) {
      sendSuccess(res, { logs: [], total: 0, page: 1, limit: 20 });
    }
  }

  // ===================== RBAC =====================
  async getRBAC(req: AuthRequest, res: Response) {
    try {
      const { data } = await supabase.from('admin_roles').select('*').limit(50);
      sendSuccess(res, { roles: data || [] });
    } catch {
      sendSuccess(res, { roles: [] });
    }
  }

  // ===================== COMPLIANCE =====================
  async getCompliance(req: AuthRequest, res: Response) {
    sendSuccess(res, { certifications: [] });
  }

  // ===================== PORTAL STATS =====================
  async getPortalStats(req: AuthRequest, res: Response) {
    sendSuccess(res, { portals: [] });
  }

  // ===================== HELPERS =====================
  private timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} day${hrs >= 48 ? 's' : ''} ago`;
  }

  private formatDuration(start: string): string {
    const diff = Date.now() - new Date(start).getTime();
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }
}

export const globalCommandCenterService = new GlobalCommandCenterService();
