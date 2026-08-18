import bcrypt from 'bcrypt';
import { supabase } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { createAuthUser } from '../lib/auth-helper';
import { generatePassword } from '../lib/backend-common';

const ROLE_GROUPS: Record<string, string[]> = {
  student: ['student'],
  staff: ['staff', 'teacher'],
  management: ['management', 'admin', 'supervisor', 'owner'],
  parent: ['parent'],
};

const VALID_USER_STATUSES = ['active', 'blocked', 'suspended', 'inactive'];
const VALID_COMPANY_ADMIN_STATUSES = ['active', 'inactive', 'blocked'];

const isGroup = (group?: string): group is keyof typeof ROLE_GROUPS =>
  !!group && group in ROLE_GROUPS;

export class UserManagementService {
  async getStats() {
    const { data: users } = await supabase.from('users').select('role, status');
    const rows = users || [];
    const countByRole = (roles: string[]) => rows.filter(u => roles.includes(u.role)).length;

    const { count: companyAdmins } = await supabase
      .from('company_admins')
      .select('id', { head: true, count: 'exact' });

    const total = rows.length;
    const active = rows.filter(u => u.status === 'active').length;

    return {
      students: countByRole(ROLE_GROUPS.student),
      staff: countByRole(ROLE_GROUPS.staff),
      management: countByRole(['management', 'supervisor', 'owner']),
      admins: countByRole(['admin']),
      parents: countByRole(ROLE_GROUPS.parent),
      companyAdmins: companyAdmins || 0,
      total,
      active,
      blocked: total - active,
    };
  }

async getUsers(params: {
    group?: string;
    q?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const group = isGroup(params.group) ? params.group : null;
    const q = (params.q || '').trim();
    const status = params.status && params.status !== 'all' ? params.status : null;

    let query = supabase
      .from('users')
      .select('id, organisation_id, full_name, email, phone, role, status, last_login, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (group) query = query.in('role', ROLE_GROUPS[group]);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const { data: orgs } = await supabase.from('organisations').select('id, name, code');
    const orgMap = new Map<string, { name: string | null; code: string | null }>();
    (orgs || []).forEach(o => orgMap.set(o.id, { name: o.name, code: o.code }));
    const orgName = (id: string | null) => (id && orgMap.get(id)?.name) || null;
    const orgCode = (id: string | null) => (id && orgMap.get(id)?.code) || null;

    let rows = data || [];
    if (q) {
      const lower = q.toLowerCase();
      rows = rows.filter(u =>
        (u.full_name || '').toLowerCase().includes(lower) ||
        (u.email || '').toLowerCase().includes(lower) ||
        (u.phone || '').toLowerCase().includes(lower) ||
        (orgName(u.organisation_id) || '').toLowerCase().includes(lower) ||
        (orgCode(u.organisation_id) || '').toLowerCase().includes(lower)
      );
    }

    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const total = rows.length;
    const start = (page - 1) * pageSize;

    return {
      total,
      page,
      pageSize,
      users: rows.slice(start, start + pageSize).map(u => ({
        id: u.id,
        organisation_id: u.organisation_id,
        name: u.full_name || '—',
        email: u.email,
        phone: u.phone || null,
        role: u.role,
        status: u.status || 'active',
        organisation_name: orgName(u.organisation_id),
        organisation_code: orgCode(u.organisation_id),
        last_login: u.last_login,
        created_at: u.created_at,
      })),
    };
  }

  async createUser(body: any) {
    const full_name = (body.full_name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    if (!full_name) throw new BadRequestError('full_name is required');
    if (!email) throw new BadRequestError('email is required');
    if (!body.organisation_id) throw new BadRequestError('organisation_id is required');

    const role = body.role || 'student';
    const password = body.password || generatePassword();

    try {
      const id = await createAuthUser(email, password, full_name, role, body.organisation_id);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message);
      return { ...data, password };
} catch {
      // Auth provisioning can be disabled on some Supabase projects — fall back to a
      // local users row so the admin portal still has a record to manage.
      const password_hash = await bcrypt.hash(password, 10);
      const { data, error } = await supabase
        .from('users')
        .insert({
          organisation_id: body.organisation_id,
          full_name,
          email,
          phone: body.phone || null,
          password_hash,
          role,
          status: body.status || 'active',
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { ...data, password };
    }
  }

  async updateUserStatus(id: string, status: string) {
    if (!VALID_USER_STATUSES.includes(status)) {
      throw new BadRequestError('Invalid status');
    }
    const { data: existing } = await supabase.from('users').select('id').eq('id', id).single();
    if (!existing) throw new NotFoundError('User not found');

    const { data, error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteUser(id: string) {
    const { data: existing } = await supabase.from('users').select('id').eq('id', id).single();
    if (!existing) throw new NotFoundError('User not found');

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await supabase.auth.admin.deleteUser(id).catch(() => {});
    return { id, deleted: true };
  }

  async getCompanyAdmins() {
    const { data, error } = await supabase
      .from('company_admins')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async createCompanyAdmin(body: any) {
    const full_name = (body.full_name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    if (!full_name) throw new BadRequestError('full_name is required');
    if (!email) throw new BadRequestError('email is required');

    const { data, error } = await supabase
      .from('company_admins')
      .insert({
        full_name,
        email,
        phone: body.phone || null,
        designation: body.designation || null,
        status: VALID_COMPANY_ADMIN_STATUSES.includes(body.status) ? body.status : 'active',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateCompanyAdmin(id: string, body: any) {
    const { data: existing } = await supabase
      .from('company_admins')
      .select('id')
      .eq('id', id)
      .single();
    if (!existing) throw new NotFoundError('Company admin not found');

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.full_name !== undefined) patch.full_name = String(body.full_name).trim();
    if (body.email !== undefined) patch.email = String(body.email).trim().toLowerCase();
    if (body.phone !== undefined) patch.phone = body.phone || null;
    if (body.designation !== undefined) patch.designation = body.designation || null;
    if (body.status !== undefined && VALID_COMPANY_ADMIN_STATUSES.includes(body.status)) {
      patch.status = body.status;
    }

    const { data, error } = await supabase
      .from('company_admins')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteCompanyAdmin(id: string) {
    const { data: existing } = await supabase
      .from('company_admins')
      .select('id')
      .eq('id', id)
      .single();
    if (!existing) throw new NotFoundError('Company admin not found');

    const { error } = await supabase.from('company_admins').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { id, deleted: true };
  }
}
export const userManagementService = new UserManagementService();


