import { supabase } from '../config/database';

export class RolesService {
  async getDashboard(orgId: string) {
    const [rolesRes, usersRes, permsRes, auditRes] = await Promise.all([
      supabase.from('roles').select('id, name, is_system').eq('organisation_id', orgId),
      supabase.from('users').select('id, role, status').eq('organisation_id', orgId),
      supabase.from('permissions').select('id, module').eq('organisation_id', orgId),
      supabase.from('role_audit_logs').select('id, created_at').eq('organisation_id', orgId),
    ]);

    const roles = rolesRes.data || [];
    const users = usersRes.data || [];
    const systemRoles = roles.filter((r: any) => r.is_system).length;
    const customRoles = roles.length - systemRoles;
    const activeUsers = users.filter((u: any) => u.status === 'active').length;
    const recentChanges = auditRes.data?.length || 0;

    return {
      totalRoles: roles.length,
      systemRoles,
      customRoles,
      totalUsers: users.length,
      activeUsers,
      disabledUsers: users.length - activeUsers,
      totalPermissions: permsRes.data?.length || 0,
      recentChanges,
    };
  }

  async getRoles(orgId: string) {
    const { data, error } = await supabase
      .from('roles')
      .select('*, role_permissions(permissions(*))')
      .eq('organisation_id', orgId)
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async createRole(orgId: string, body: any) {
    const { data, error } = await supabase.from('roles').insert({
      organisation_id: orgId,
      name: body.name,
      description: body.description,
      is_system: body.is_system || false,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateRole(id: string, body: any) {
    const { data, error } = await supabase.from('roles').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteRole(id: string) {
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  async assignPermissions(roleId: string, body: any) {
    const { permission_ids } = body;
    const { data: role } = await supabase
      .from('roles')
      .select('organisation_id')
      .eq('id', roleId)
      .maybeSingle();
    const organisation_id = role?.organisation_id;

    await supabase.from('role_permissions').delete().eq('role_id', roleId);
    if (permission_ids?.length) {
      const inserts = permission_ids.map((permission_id: string) => ({
        role_id: roleId,
        permission_id,
        organisation_id,
      }));
      const { error } = await supabase.from('role_permissions').insert(inserts);
      if (error) throw error;
    }
    return { assigned: true, organisation_id };
  }

  async getPermissions(orgId: string) {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('organisation_id', orgId)
      .order('module');
    if (error) throw error;
    return data || [];
  }

  async getUsers(orgId: string, filters?: any) {
    let query = supabase
      .from('users')
      .select('id, full_name, email, role, status, created_at, last_login')
      .eq('organisation_id', orgId);

    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) {
      const s = filters.search;
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async updateUserRole(userId: string, body: any) {
    const updates: any = {};
    if (body.role !== undefined) updates.role = body.role;
    if (body.status !== undefined) updates.status = body.status;
    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    if (error) throw error;

    await supabase.from('role_audit_logs').insert({
      organisation_id: data.organisation_id,
      user_id: userId,
      action: body.role ? 'role_changed' : 'status_changed',
      details: body.role ? { new_role: body.role } : { new_status: body.status },
    });

    return data;
  }

  async getAuditLogs(orgId: string) {
    const { data, error } = await supabase
      .from('role_audit_logs')
      .select('*, users(full_name, email)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  }

  async getAnalytics(orgId: string) {
    const [rolesRes, usersRes, auditRes] = await Promise.all([
      supabase.from('roles').select('id, name').eq('organisation_id', orgId),
      supabase.from('users').select('role, status').eq('organisation_id', orgId),
      supabase.from('role_audit_logs').select('created_at').eq('organisation_id', orgId).order('created_at'),
    ]);

    const users = usersRes.data || [];
    const roleDistribution = users.reduce((acc: any, u: any) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const auditLogs = auditRes.data || [];
    const changesByMonth: any = {};
    auditLogs.forEach((log: any) => {
      const month = new Date(log.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      changesByMonth[month] = (changesByMonth[month] || 0) + 1;
    });

    return {
      totalRoles: rolesRes.data?.length || 0,
      roleDistribution,
      activeUsers: users.filter((u: any) => u.status === 'active').length,
      pendingUsers: users.filter((u: any) => u.status === 'pending').length,
      changesByMonth,
    };
  }

  async getReports(orgId: string, type?: string) {
    const users = await this.getUsers(orgId);
    const roles = await this.getRoles(orgId);

    return {
      summary: {
        totalUsers: users.length,
        totalRoles: roles.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        roleBreakdown: users.reduce((acc: any, u: any) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          return acc;
        }, {}),
      },
      users,
      roles,
      generatedAt: new Date().toISOString(),
    };
  }

  async getSidebar(orgId: string) {
    const stats = await this.getDashboard(orgId);
    return {
      stats: [
        { label: 'Total Roles', value: stats.totalRoles, icon: 'Shield' },
        { label: 'Active Users', value: stats.activeUsers, icon: 'Users' },
        { label: 'Permissions', value: stats.totalPermissions, icon: 'Key' },
        { label: 'Recent Changes', value: stats.recentChanges, icon: 'Activity' },
      ],
    };
  }
}

export const rolesService = new RolesService();
