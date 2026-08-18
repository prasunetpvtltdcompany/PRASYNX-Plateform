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

const IMPORTANT_SEVERITIES = ['warning', 'error', 'critical'];
const IMPORTANT_ACTIONS = /impersonat|delet|purge|remove|role|password|suspend|block|deactivat|login|logout|failed|reset|admin|invit|permission|credential|transfer|payment|refund|terminate/i;

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/** Derive a short, human-friendly org id (e.g. org9237) from the UUID table id. */
function makeOrgId(id: string): string {
  if (!id) return 'org0000';
  const seed = id.replace(/-/g, '').slice(0, 12);
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `org${String(hash % 10000).padStart(4, '0')}`;
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    student: 'Student', teacher: 'Teacher', staff: 'Staff', admin: 'Admin',
    parent: 'Parent', management: 'Management', supervisor: 'Supervisor', owner: 'Owner',
  };
  return map[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User');
}

function initials(name?: string): string {
  const parts = (name || '?').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || '')).toUpperCase();
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
          org_id: makeOrgId(o.id),
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
        id: data.id,
        org_id: makeOrgId(data.id),
        name: data.name || 'Unknown',
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

  // ===================== ORG ADMINS =====================
  async getOrgAdmins(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, status, created_at, last_login')
        .eq('organisation_id', req.params.orgId)
        .in('role', ['management', 'admin', 'supervisor', 'owner'])
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      sendSuccess(res, {
        admins: (data || []).map((u: any) => ({
          id: u.id,
          name: u.full_name || 'Admin',
          email: u.email,
          role: u.role,
          status: u.status || 'active',
          created: u.created_at,
          lastLogin: u.last_login,
        })),
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch organisation admins');
    }
  }

  // ===================== ORG SECURITY LOGS =====================
  async getOrgSecurityLogs(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action, entity_type, details, ip_address, severity, created_at, users:user_id(full_name, email)')
        .eq('organisation_id', req.params.orgId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      const hasContext = (l: any) => !!(l.users?.full_name || l.users?.email || l.ip_address);

      sendSuccess(res, {
        logs: (data || [])
          .filter(hasContext)
          .slice(0, 30)
          .map((l: any) => ({
            id: l.id,
            action: l.action,
            entityType: l.entity_type || 'admin_action',
            method: l.details?.method || '',
            resource: l.details?.url || '',
            ip: l.ip_address || '',
            user: l.users?.full_name || null,
            userEmail: l.users?.email || null,
            severity: l.severity || 'info',
            status: l.details?.status_code || null,
            timestamp: l.created_at,
          })),
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch organisation security logs');
    }
  }

  // ===================== ORG AUDIT LOGS (important only) =====================
  async getOrgAuditLogs(req: AuthRequest, res: Response) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, users:user_id(email, full_name, role)')
        .eq('organisation_id', req.params.orgId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;

      const isImportant = (l: any) => {
        if (IMPORTANT_SEVERITIES.includes((l.severity || 'info').toLowerCase())) return true;
        return IMPORTANT_ACTIONS.test(String(l.action || ''));
      };
      const hasContext = (l: any) => !!(l.users?.full_name || l.users?.email || l.ip_address);

      const logs = (data || [])
        .filter(isImportant)
        .filter(hasContext)
        .slice(0, 25)
        .map((l: any) => ({
          id: l.id,
          action: l.action,
          entityType: l.entity_type || 'admin_action',
          entityId: l.entity_id || null,
          method: l.details?.method || '',
          resource: l.details?.url || '',
          severity: l.severity || 'info',
          ip: l.ip_address || '',
          user: l.users?.full_name || null,
          userEmail: l.users?.email || null,
          timestamp: l.created_at,
        }));

      sendSuccess(res, { logs, total: logs.length });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch organisation audit logs');
    }
  }

  // ===================== GLOBAL SEARCH =====================
  async globalSearch(req: AuthRequest, res: Response) {
    try {
      const q = (req.query.q as string || '').trim();
      const type = (req.query.type as string) || 'all';
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      if (!q || q.length < 2) return sendError(res, 'Search query must be at least 2 characters', 400);

      const results: any[] = [];
      const groups: Record<string, any[]> = { organizations: [], users: [], activity: [] };

      if (type === 'all' || type === 'organizations') {
        const { data, error } = await supabase
          .from('organisations')
          .select('id, name, email, status, created_at')
          .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(limit);
        if (error) throw error;
        (data || []).forEach((o: any) => {
          const row = {
            id: o.id, org_id: makeOrgId(o.id), name: o.name || 'Unknown', email: o.email || '',
            type: 'Organization', category: 'organizations', status: o.status || 'pending',
            created: o.created_at, avatar: (o.name || '?').trim().charAt(0).toUpperCase(),
          };
          results.push(row);
          groups.organizations.push(row);
        });
      }

      const roleFilters: Record<string, string[]> = {
        users: ['student', 'teacher', 'staff', 'admin', 'parent', 'management', 'supervisor', 'owner'],
        students: ['student'],
        staff: ['teacher', 'staff', 'admin'],
        parents: ['parent'],
        management: ['management'],
      };
      const roles = roleFilters[type];
      if (type === 'all' || roles) {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, role, status, organisation_id, created_at')
          .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(limit * 3);
        if (error) throw error;

        const orgIds = [...new Set((data || []).map((u: any) => u.organisation_id).filter(Boolean))] as string[];
        let orgMap: Record<string, string> = {};
        if (orgIds.length) {
          const { data: orgs } = await supabase.from('organisations').select('id, name').in('id', orgIds);
          if (orgs) orgMap = Object.fromEntries(orgs.map((o: any) => [o.id, o.name]));
        }

        (data || [])
          .filter((u: any) => !roles || roles.includes(u.role))
          .slice(0, limit)
          .forEach((u: any) => {
            const row = {
              id: u.id, name: u.full_name || 'User', email: u.email || '', role: u.role || 'user',
              type: roleLabel(u.role), category: 'users', status: u.status || 'active',
              organisation_id: u.organisation_id || null, org: orgMap[u.organisation_id] || '',
              created: u.created_at, avatar: initials(u.full_name),
            };
            results.push(row);
            groups.users.push(row);
          });
      }

      if (type === 'all' || type === 'activity') {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id, action, entity_type, entity_id, ip_address, severity, details, created_at, users:user_id(full_name, email)')
          .or(`action.ilike.%${q}%,entity_type.ilike.%${q}%,ip_address.ilike.%${q}%`)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        (data || []).forEach((l: any) => {
          const row = {
            id: l.id, type: 'Activity', category: 'activity',
            action: l.action || 'admin_action', entityType: l.entity_type || 'admin_action',
            method: l.details?.method || '', resource: l.details?.url || '',
            ip: l.ip_address || '', severity: l.severity || 'info', status: l.details?.status_code || null,
            user: l.users?.full_name || '', userEmail: l.users?.email || '',
            created: l.created_at,
          };
          results.push(row);
          groups.activity.push(row);
        });
      }

      sendSuccess(res, {
        query: q,
        type,
        results,
        groups,
        counts: {
          organizations: groups.organizations.length,
          users: groups.users.length,
          activity: groups.activity.length,
        },
        total: results.length,
      });
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
    try {
      const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const [usersRes, orgsRes, logsRes, studentsRes, staffRes, parentsRes, trafficRes] = await Promise.all([
        supabase.from('users').select('role, status, created_at'),
        supabase.from('organisations').select('*'),
        supabase
          .from('audit_logs')
          .select('id, action, entity_type, ip_address, severity, created_at, users:user_id(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('staff_records').select('*', { count: 'exact', head: true }),
        supabase.from('parents').select('*', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('created_at').gte('created_at', since24h),
      ]);
      if (usersRes.error) throw usersRes.error;
      if (orgsRes.error) throw orgsRes.error;
      if (logsRes.error) throw logsRes.error;
      if (trafficRes.error) throw trafficRes.error;

      const staffRoles = ['staff', 'teacher', 'admin'];
      const isStaff = (r: string) => staffRoles.includes(r);
      const isOrgAdmin = (r: string) => ['management'].includes(r);

      const portalUsers: Record<string, number> = {};
      const portalActive: Record<string, number> = {};
      for (const u of usersRes.data || []) {
        let key = 'other';
        if (u.role === 'student') key = 'student';
        else if (u.role === 'parent') key = 'parent';
        else if (isStaff(u.role)) key = 'staff';
        else if (isOrgAdmin(u.role)) key = 'org-admin';
        portalUsers[key] = (portalUsers[key] || 0) + 1;
        if (u.status === 'active') portalActive[key] = (portalActive[key] || 0) + 1;
      }

      const studentCount = Math.max(portalUsers.student || 0, studentsRes.count || 0);
      const staffCount = Math.max(portalUsers.staff || 0, staffRes.count || 0);
      const parentCount = Math.max(portalUsers.parent || 0, parentsRes.count || 0);

      const growth: Array<Record<string, any>> = [];
      const growthMap: Record<string, Record<string, any>> = {};
      const monthLabel = (d: Date) => d.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setUTCMonth(d.getUTCMonth() - i);
        const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
        growthMap[key] = { month: monthLabel(d), Student: 0, Staff: 0, Parents: 0, Management: 0 };
      }
      const portalKeyFor = (role: string) => {
        if (role === 'student') return 'Student';
        if (role === 'parent') return 'Parents';
        if (isStaff(role)) return 'Staff';
        if (isOrgAdmin(role)) return 'Management';
        return null;
      };
      for (const u of usersRes.data || []) {
        const portal = portalKeyFor(u.role);
        if (!portal || !u.created_at) continue;
        const d = new Date(u.created_at);
        const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
        if (growthMap[key]) growthMap[key][portal] += 1;
      }
      for (const k of Object.keys(growthMap).sort()) growth.push(growthMap[k]);

      const slots = [0, 4, 8, 12, 16, 20];
      const slotLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;
      const traffic = slots.map((start, i) => {
        const end = i === slots.length - 1 ? 24 : slots[i + 1];
        const events = (trafficRes.data || []).filter((l: any) => {
          const h = new Date(l.created_at).getHours();
          return h >= start && h < end;
        }).length;
        return { hour: slotLabel(start), Events: events };
      });

      const orgStatus = { active: 0, pending: 0, suspended: 0 };
      for (const o of orgsRes.data || []) {
        const s = ((o.status || 'pending') as string).toLowerCase();
        if (s in orgStatus) orgStatus[s as keyof typeof orgStatus] += 1;
        else orgStatus.pending += 1;
      }

      const recentOrganisations = (orgsRes.data || [])
        .slice()
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
        .map((o: any) => ({
          id: o.id,
          org_id: makeOrgId(o.id),
          name: o.name || 'Unknown',
          plan: o.plan || 'Starter',
          status: o.status || 'pending',
          region: o.region || '',
          created: o.created_at || new Date().toISOString(),
        }));

      const hasContext = (l: any) => !!(l.users?.full_name || l.users?.email || l.ip_address);
      const recentLogs = (logsRes.data || [])
        .filter(hasContext)
        .slice(0, 8)
        .map((l: any) => ({
          id: l.id,
          action: l.action,
          entityType: l.entity_type || 'admin_action',
          severity: l.severity || 'info',
          ip: l.ip_address || '',
          user: l.users?.full_name || null,
          userEmail: l.users?.email || null,
          timestamp: l.created_at,
        }));

      sendSuccess(res, {
        portals: [
          { key: 'student', name: 'Student Portal', users: studentCount, active: portalActive.student || 0 },
          { key: 'staff', name: 'Staff Portal', users: staffCount, active: portalActive.staff || 0 },
          { key: 'parent', name: 'Parent Portal', users: parentCount, active: portalActive.parent || 0 },
          { key: 'org-admin', name: 'Org Admin Portal', users: portalUsers['org-admin'] || 0, active: portalActive['org-admin'] || 0 },
        ],
        otherUsers: portalUsers.other || 0,
        entities: {
          students: studentsRes.count || 0,
          staff: staffRes.count || 0,
          parents: parentsRes.count || 0,
        },
        organisations: {
          total: orgsRes.data?.length || 0,
          active: orgStatus.active,
          pending: orgStatus.pending,
          suspended: orgStatus.suspended,
        },
        recentOrganisations,
        recentLogs,
        growth,
        traffic,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch portal statistics');
    }
  }

  // ===================== PORTAL USERS =====================
  async getPortalUsers(req: AuthRequest, res: Response) {
    try {
      const portal = (req.query.portal as string) || '';
      let roles: string[] = [];
      if (portal === 'student') roles = ['student'];
      else if (portal === 'staff') roles = ['staff', 'teacher', 'admin'];
      else if (portal === 'parent') roles = ['parent'];
      else if (portal === 'org-admin') roles = ['management'];
      else return sendError(res, 'Invalid portal. Use student, staff, parent or org-admin.', 400);

      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, status, created_at')
        .in('role', roles)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;

      sendSuccess(res, {
        portal,
        users: (data || []).map((u: any) => ({
          id: u.id,
          name: u.full_name || 'Unknown',
          email: u.email || '',
          role: u.role,
          status: u.status || 'active',
          created: u.created_at || new Date().toISOString(),
        })),
      });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch portal users');
    }
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
