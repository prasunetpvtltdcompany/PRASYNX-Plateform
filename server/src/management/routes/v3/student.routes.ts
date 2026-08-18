import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase, generatePassword } from '../../lib/backend-common';
import { createAuthUser } from '../../lib/auth-helper';
import { trackChange, notifyRole } from '../../utils/sync';

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

// POST /students - Create single student
router.post('/students', async (req: Request, res: Response) => {
  const { organisation_id, full_name, roll_number, student_class, section, phone, email, password, parent_email, parent_phone, parent_name, parent_relationship } = req.body;
  if (!organisation_id || !full_name || !roll_number) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    let createdUser = null;
    let authUserId: string | null = null;
    if (email && password) {
      const pwdHash = await bcrypt.hash(password, 10);
      const { data: user, error: userError } = await supabase.from('users').insert({
        organisation_id, full_name, email, password_hash: pwdHash, role: 'student', status: 'active'
      }).select().single();
      if (userError) throw userError;
      createdUser = user;
      try { authUserId = await createAuthUser(email, password, full_name, 'student', organisation_id); }
      catch (authError: any) {
        await supabase.from('users').delete().eq('id', user.id);
        throw authError;
      }
    }
    
    // Resolve student_class/section to UUIDs
    let resolvedClassId = null;
    let resolvedSectionId = null;
    if (student_class) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(student_class)) {
        resolvedClassId = student_class;
      } else {
        const { data: classData } = await supabase.from('classes').select('id').eq('name', student_class).eq('organisation_id', organisation_id).maybeSingle();
        resolvedClassId = classData?.id || null;
      }
    }
    if (section && resolvedClassId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(section)) {
        resolvedSectionId = section;
      } else {
        const { data: sectData } = await supabase.from('sections').select('id').eq('name', section).eq('class_id', resolvedClassId).maybeSingle();
        resolvedSectionId = sectData?.id || null;
      }
    }

    const { data, error } = await supabase.from('students').insert([{
      organisation_id, full_name, roll_number, class_id: resolvedClassId, section_id: resolvedSectionId, phone,
      user_id: createdUser?.id || null, email: email || null,
      parent_email, parent_name, parent_phone, parent_relationship: parent_relationship || 'parent', status: 'active'
    }]).select();
    if (error) {
      if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
      if (createdUser) await supabase.from('users').delete().eq('id', createdUser.id);
      throw error;
    }
    
    if (email && password) {
      res.status(201).json({ student: data?.[0], credentials: { email, password } });
      getOrgName(organisation_id).then(n => logCredential(organisation_id, n, full_name, email, 'student', 'Management Portal'));
    } else {
      res.status(201).json(data?.[0]);
    }
    if (data?.[0]?.id) {
      trackChange({ organisationId: organisation_id, tableName: 'students', operation: 'INSERT', recordId: data[0].id });
      if (parent_email) notifyRole(organisation_id, 'parent', 'Student Enrolled', `Student "${full_name}" has been enrolled.`);
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// POST /students/bulk - Bulk import students
router.post('/students/bulk', async (req: Request, res: Response) => {
  const { organisation_id, students } = req.body;
  if (!organisation_id || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'organisation_id and students array required' });
  }
  const results: any[] = [];
  let success = 0, failed = 0;
  for (const s of students) {
    try {
      if (!s.full_name || !s.roll_number) {
        failed++; results.push({ full_name: s.full_name || 'Unknown', roll_number: s.roll_number || '', status: 'failed', error: 'full_name and roll_number required' });
        continue;
      }
      let createdUserId = null, authUserId: string | null = null;
      if (s.email && s.password) {
        const pwdHash = await bcrypt.hash(s.password, 10);
        const { data: user, error: ue } = await supabase.from('users').insert({
          organisation_id, full_name: s.full_name, email: s.email, password_hash: pwdHash, role: 'student', status: 'active'
        }).select().single();
        if (ue) throw ue;
        createdUserId = user.id;
        try { authUserId = await createAuthUser(s.email, s.password, s.full_name, 'student', organisation_id); }
        catch (ae: any) { await supabase.from('users').delete().eq('id', user.id); throw ae; }
      }
      
      // Resolve student_class/section to UUIDs
      let resolvedClassId = null;
      let resolvedSectionId = null;
      if (s.student_class) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.student_class)) {
          resolvedClassId = s.student_class;
        } else {
          const { data: classData } = await supabase.from('classes').select('id').eq('name', s.student_class).eq('organisation_id', organisation_id).maybeSingle();
          resolvedClassId = classData?.id || null;
        }
      }
      if (s.section && resolvedClassId) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.section)) {
          resolvedSectionId = s.section;
        } else {
          const { data: sectData } = await supabase.from('sections').select('id').eq('name', s.section).eq('class_id', resolvedClassId).maybeSingle();
          resolvedSectionId = sectData?.id || null;
        }
      }

      const { data, error } = await supabase.from('students').insert([{
        organisation_id, full_name: s.full_name, roll_number: s.roll_number,
        class_id: resolvedClassId, section_id: resolvedSectionId,
        phone: s.phone || null, email: s.email || null,
        user_id: createdUserId, parent_email: s.parent_email || null,
        parent_phone: s.parent_phone || null, parent_name: s.parent_name || null,
        parent_relationship: s.parent_relationship || 'parent', status: 'active'
      }]).select();
      if (error) {
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        if (createdUserId) await supabase.from('users').delete().eq('id', createdUserId);
        throw error;
      }
      
      success++;
      const result: any = { full_name: s.full_name, roll_number: s.roll_number, status: 'success' };
      if (s.email) result.email = s.email;
      if (s.password) result.password = s.password;
      results.push(result);
      if (s.email && s.password) getOrgName(organisation_id).then(n => logCredential(organisation_id, n, s.full_name, s.email, 'student', 'Management Bulk Import'));
    } catch (e: any) {
      failed++;
      results.push({ full_name: s.full_name || 'Unknown', roll_number: s.roll_number || '', status: 'failed', error: e.message });
    }
  }
  res.json({ total: students.length, success_count: success, failed_count: failed, results });
});

export default router;
