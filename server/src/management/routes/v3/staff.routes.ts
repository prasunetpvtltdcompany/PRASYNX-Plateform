import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase, generatePassword } from '../../lib/backend-common';
import { createAuthUser } from '../../lib/auth-helper';

const router = Router();

async function logCredential(orgId: string, orgName: string, fullName: string, email: string, role: string, createdBy: string) {
  try {
    await supabase.from('credential_history').insert({
      organisation_id: orgId, organisation_name: orgName, full_name: fullName, email, role, created_by: createdBy
    });
  } catch (_) {}
}

async function getOrgName(orgId: string): Promise<string> {
  try {
    const { data } = await supabase.from('organisations').select('name').eq('id', orgId).maybeSingle();
    return data?.name || '';
  } catch { return ''; }
}

// POST /staff - Create single staff
router.post('/staff', async (req: Request, res: Response) => {
  const { organisation_id, full_name, email, password, role, subject, phone } = req.body;
  if (!organisation_id || !full_name || !email) {
    return res.status(400).json({ error: 'Required fields: organisation_id, full_name, email' });
  }
  try {
    const pwd = password || generatePassword();
    const pwdHash = await bcrypt.hash(pwd, 10);
    const teacherCode = `STAFF-${Date.now()}`;
    const staffRole = role || 'staff';
    const { data: user, error: ue } = await supabase.from('users').insert({
      organisation_id, full_name, email, password_hash: pwdHash, role: staffRole, status: 'active'
    }).select().single();
    if (ue) throw ue;
    try { await createAuthUser(email, pwd, full_name, staffRole, organisation_id); }
    catch (ae: any) { await supabase.from('users').delete().eq('id', user.id); throw ae; }
    const { data: teacher, error: te } = await supabase.from('staff_records').insert({
      organisation_id, user_id: user.id, full_name, staff_unique_id: teacherCode, subject, phone, status: 'active'
    }).select().single();
    if (te) { await supabase.from('users').delete().eq('id', user.id); throw te; }
    getOrgName(organisation_id).then(n => logCredential(organisation_id, n, full_name, email, staffRole, 'Management Portal'));
    res.json({ success: true, credentials: { email, password: pwd, role: staffRole, staff_unique_id: teacherCode, full_name }, staff_id: teacher.id, user_id: user.id });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /staff/bulk - Bulk import staff
router.post('/staff/bulk', async (req: Request, res: Response) => {
  const { organisation_id, staff } = req.body;
  if (!organisation_id || !Array.isArray(staff) || staff.length === 0) {
    return res.status(400).json({ error: 'organisation_id and staff array required' });
  }
  const results: any[] = [];
  let success = 0, failed = 0;
  for (const s of staff) {
    try {
      if (!s.full_name || !s.email) {
        failed++; results.push({ full_name: s.full_name || 'Unknown', status: 'failed', error: 'full_name and email required' });
        continue;
      }
      const pwd = s.password || generatePassword();
      const pwdHash = await bcrypt.hash(pwd, 10);
      const teacherCode = `STAFF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const staffRole = s.role || 'staff';
      const { data: user, error: ue } = await supabase.from('users').insert({
        organisation_id, full_name: s.full_name, email: s.email, password_hash: pwdHash, role: staffRole, status: 'active'
      }).select().single();
      if (ue) throw ue;
      let authUserId: string | null = null;
      try { authUserId = await createAuthUser(s.email, pwd, s.full_name, staffRole, organisation_id); }
      catch (ae: any) { await supabase.from('users').delete().eq('id', user.id); throw ae; }
      const { error: te } = await supabase.from('staff_records').insert({
        organisation_id, user_id: user.id, full_name: s.full_name, staff_unique_id: teacherCode, subject: s.subject || null, status: 'active'
      });
      if (te) {
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        await supabase.from('users').delete().eq('id', user.id);
        throw te;
      }
      success++;
      results.push({ full_name: s.full_name, email: s.email, status: 'success', password: pwd });
      getOrgName(organisation_id).then(n => logCredential(organisation_id, n, s.full_name, s.email, staffRole, 'Management Bulk Import'));
    } catch (e: any) {
      failed++;
      results.push({ full_name: s.full_name || 'Unknown', status: 'failed', error: e.message });
    }
  }
  res.json({ total: staff.length, success_count: success, failed_count: failed, results });
});

export default router;
