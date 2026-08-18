import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase, generatePassword } from '../lib/backend-common';
import { createAuthUser } from '../lib/auth-helper';
import { verifyManagementAuth, enforceOrgAccess } from '../middleware/verifyAuth';
import { auditLog } from '../middleware/audit';
import { credentialLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import {
  createStudentSchema,
  createStaffSchema,
  createParentSchema,
  bulkCreateSchema,
  updateUserStatusSchema
} from '../validators/credentials.validator';

const router = Router();

async function logCredential(orgId: string, orgName: string, fullName: string, email: string, role: string, createdBy: string) {
  try {
    await supabase.from('credential_history').insert({
      organisation_id: orgId,
      organisation_name: orgName,
      full_name: fullName,
      email,
      role,
      created_by: createdBy
    });
  } catch (_) {}
}

async function getOrgName(orgId: string): Promise<string> {
  try {
    const { data } = await supabase.from('organisations').select('name').eq('id', orgId).maybeSingle();
    return data?.name || '';
  } catch { return ''; }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(v: any): boolean {
  return typeof v === 'string' && UUID_RE.test(v);
}

// Apply authentication + org access control + rate limit + audit to all routes

// URL param org_id/organisation_id must match JWT
router.param('organisation_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('org_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.use(verifyManagementAuth);
router.use(enforceOrgAccess());
router.use(credentialLimiter);
router.use(auditLog('credential_operation'));

router.get('/history/:org_id', async (req, res) => {
  const { org_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('credential_history')
      .select('*')
      .eq('organisation_id', org_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ history: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create student credentials
router.post('/create-student', validateBody(createStudentSchema), async (req, res) => {
  const { organisation_id, full_name, student_class, section, roll_number } = req.body;

  try {
    const password = generatePassword();
    const email = `${roll_number}@student.local`;
    const password_hash = await bcrypt.hash(password, 10);

    // Create user account
    const { data: user, error: userError } = await supabase.from('users').insert({
      organisation_id,
      full_name,
      email,
      password_hash,
      role: 'student',
      status: 'active'
    }).select().single();

    if (userError) throw userError;

    // Create auth user
    let authUserId: string | null = null;
    try {
      authUserId = await createAuthUser(email, password, full_name, 'student', organisation_id);
    } catch (authError: any) {
      await supabase.from('users').delete().eq('id', user.id);
      throw authError;
    }

    // Resolve class_id and section_id
    let resolvedClassId: string | null = null;
    let resolvedSectionId: string | null = null;
    if (student_class) {
      const { data: classData } = await supabase.from('classes').select('id').eq('name', student_class).eq('organisation_id', organisation_id).maybeSingle();
      resolvedClassId = classData?.id || null;
    }
    if (section && resolvedClassId) {
      const { data: sectData } = await supabase.from('sections').select('id').eq('name', section).eq('class_id', resolvedClassId).maybeSingle();
      resolvedSectionId = sectData?.id || null;
    }

    // Create student record
    const { data: student, error: studentError } = await supabase.from('students').insert({
      organisation_id,
      user_id: user.id,
      full_name,
      email,
      roll_number,
      class_id: resolvedClassId,
      section_id: resolvedSectionId,
      status: 'active'
    }).select().single();

    if (studentError) {
      if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
      await supabase.from('users').delete().eq('id', user.id);
      throw studentError;
    }

    if (resolvedClassId && student.id) {
      await supabase.from('class_student_map').upsert({
        class_id: resolvedClassId,
        student_id: student.id,
        organisation_id
      }, { onConflict: 'class_id,student_id' });
    }

    getOrgName(organisation_id).then(orgName => logCredential(organisation_id, orgName, full_name, email, 'student', 'Management Portal'));

    res.json({
      success: true,
      message: 'Student credentials created',
      credentials: {
        email,
        password,
        roll_number,
        full_name
      },
      student_id: student.id,
      user_id: user.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create staff credentials
router.post('/create-staff', validateBody(createStaffSchema), async (req, res) => {
  const { organisation_id, full_name, email, role, subject, phone } = req.body;

  try {
    const password = generatePassword();
    const password_hash = await bcrypt.hash(password, 10);
    const staff_unique_id = `STAFF-${Date.now()}`;
    const staffRole = role || 'staff';

    // Create user account
    const { data: user, error: userError } = await supabase.from('users').insert({
      organisation_id,
      full_name,
      email,
      password_hash,
      role: staffRole,
      status: 'active'
    }).select().single();

    if (userError) throw userError;

    // Create auth user
    let authUserId: string | null = null;
    try {
      authUserId = await createAuthUser(email, password, full_name, staffRole, organisation_id);
    } catch (authError: any) {
      await supabase.from('users').delete().eq('id', user.id);
      throw authError;
    }

    // Create staff record and link it to the user account
    const { data: teacher, error: teacherError } = await supabase.from('staff_records').insert({
      organisation_id,
      user_id: user.id,
      full_name,
      staff_unique_id,
      subject,
      phone,
      status: 'active'
    }).select().single();

    if (teacherError) {
      if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
      await supabase.from('users').delete().eq('id', user.id);
      throw teacherError;
    }

    getOrgName(organisation_id).then(orgName => logCredential(organisation_id, orgName, full_name, email, staffRole, 'Management Portal'));

    res.json({
      success: true,
      message: 'Staff credentials created',
      credentials: {
        email,
        password,
        role: staffRole,
        staff_unique_id,
        full_name
      },
      staff_id: teacher.id,
      user_id: user.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create parent credentials and link to student
router.post('/create-parent', validateBody(createParentSchema), async (req, res) => {
  const { organisation_id, full_name, email, phone, student_id } = req.body;

  try {
    const password = generatePassword();
    const password_hash = await bcrypt.hash(password, 10);

    // Create user account
    const { data: user, error: userError } = await supabase.from('users').insert({
      organisation_id,
      full_name,
      email,
      password_hash,
      role: 'parent',
      status: 'active'
    }).select().single();

    if (userError) throw userError;

    // Create auth user
    let authUserId: string | null = null;
    try {
      authUserId = await createAuthUser(email, password, full_name, 'parent', organisation_id);
    } catch (authError: any) {
      await supabase.from('users').delete().eq('id', user.id);
      throw authError;
    }

    // Create parent profile
    const { data: parent, error: parentError } = await supabase.from('parents').insert({
      organisation_id,
      full_name,
      email,
      phone,
      user_id: user.id,
      status: 'active'
    }).select().single();

    if (parentError) {
      if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
      await supabase.from('users').delete().eq('id', user.id);
      throw parentError;
    }

    // Also create parent_student_links for management portal listing
    await supabase.from('parent_student_links').insert({
      parent_id: user.id, student_id, relationship: 'guardian'
    }).select().single();

    getOrgName(organisation_id).then(orgName => logCredential(organisation_id, orgName, full_name, email, 'parent', 'Management Portal'));

    res.json({
      success: true,
      message: 'Parent credentials created and linked to student',
      credentials: {
        email,
        password,
        full_name,
        linked_student_id: student_id
      },
      parent_id: parent.id,
      user_id: user.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const parseCsvString = (csv: string) => {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
};

// Bulk create student credentials from CSV
router.post('/bulk-create-students', validateBody(bulkCreateSchema), async (req, res) => {
  const { organisation_id, csv } = req.body;

  const rows = parseCsvString(csv);
  const results: Array<{ row: number; error: string }> = [];
  let imported = 0;

  for (const [index, row] of rows.entries()) {
    const full_name = row.full_name?.trim();
    const student_class = row.student_class?.trim();
    const section = row.section?.trim();
    const roll_number = row.roll_number?.trim();

    if (!full_name || !roll_number) {
      results.push({ row: index + 2, error: 'Missing required full_name or roll_number' });
      continue;
    }

    try {
      const password = generatePassword();
      const email = `${roll_number}@student.local`;
      const password_hash = await bcrypt.hash(password, 10);

      const { data: user, error: userError } = await supabase.from('users').insert({
        organisation_id,
        full_name,
        email,
        password_hash,
        role: 'student',
        status: 'active'
      }).select().single();

      if (userError) throw userError;

      let authUserId: string | null = null;
      try {
        authUserId = await createAuthUser(email, password, full_name, 'student', organisation_id);
      } catch (authError: any) {
        await supabase.from('users').delete().eq('id', user.id);
        throw authError;
      }

      // Resolve class_id and section_id
      let resolvedClassId: string | null = null;
      let resolvedSectionId: string | null = null;
      if (student_class) {
        const { data: classData } = await supabase.from('classes').select('id').eq('name', student_class).eq('organisation_id', organisation_id).maybeSingle();
        resolvedClassId = classData?.id || null;
      }
      if (section && resolvedClassId) {
        const { data: sectData } = await supabase.from('sections').select('id').eq('name', section).eq('class_id', resolvedClassId).maybeSingle();
        resolvedSectionId = sectData?.id || null;
      }

      const { data: student, error: studentError } = await supabase.from('students').insert({
        organisation_id,
        user_id: user.id,
        full_name,
        email,
        roll_number,
        class_id: resolvedClassId,
        section_id: resolvedSectionId,
        status: 'active'
      }).select().single();

      if (studentError) {
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        await supabase.from('users').delete().eq('id', user.id);
        throw studentError;
      }

      if (resolvedClassId && student.id) {
        await supabase.from('class_student_map').upsert({
          class_id: resolvedClassId,
          student_id: student.id,
          organisation_id
        }, { onConflict: 'class_id,student_id' });
      }

      await supabase.from('students').update({ parent_email: email }).eq('id', student.id);
      imported += 1;
      getOrgName(organisation_id).then(orgName => logCredential(organisation_id, orgName, full_name, email, 'student', 'Management Bulk Import'));
    } catch (error: any) {
      results.push({ row: index + 2, error: error.message });
    }
  }

  res.json({ imported, errors: results, message: `Student import completed: ${imported} created, ${results.length} skipped.` });
});

// Bulk create staff credentials from CSV
router.post('/bulk-create-staff', validateBody(bulkCreateSchema), async (req, res) => {
  const { organisation_id, csv } = req.body;

  const rows = parseCsvString(csv);
  const results: Array<{ row: number; error: string }> = [];
  let imported = 0;

  for (const [index, row] of rows.entries()) {
    const full_name = row.full_name?.trim();
    const email = row.email?.trim();
    const role = row.role?.trim() || 'staff';
    const subject = row.subject?.trim();

    if (!full_name || !email) {
      results.push({ row: index + 2, error: 'Missing required full_name or email' });
      continue;
    }

    try {
      const password = generatePassword();
      const password_hash = await bcrypt.hash(password, 10);
      const staff_unique_id = `STAFF-${Date.now()}-${index}`;

      const { data: user, error: userError } = await supabase.from('users').insert({
        organisation_id,
        full_name,
        email,
        password_hash,
        role: role,
        status: 'active'
      }).select().single();

      if (userError) throw userError;

      let authUserId: string | null = null;
      try {
        authUserId = await createAuthUser(email, password, full_name, role, organisation_id);
      } catch (authError: any) {
        await supabase.from('users').delete().eq('id', user.id);
        throw authError;
      }

      const { error: teacherError } = await supabase.from('staff_records').insert({
        organisation_id,
        user_id: user.id,
        full_name,
        staff_unique_id,
        subject,
        status: 'active'
      });

      if (teacherError) {
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        await supabase.from('users').delete().eq('id', user.id);
        throw teacherError;
      }
      imported += 1;
      getOrgName(organisation_id).then(orgName => logCredential(organisation_id, orgName, full_name, email, role, 'Management Bulk Import'));
    } catch (error: any) {
      results.push({ row: index + 2, error: error.message });
    }
  }

  res.json({ imported, errors: results, message: `Staff import completed: ${imported} created, ${results.length} skipped.` });
});

// Bulk create parent credentials from CSV
router.post('/bulk-create-parents', validateBody(bulkCreateSchema), async (req, res) => {
  const { organisation_id, csv } = req.body;

  const rows = parseCsvString(csv);
  const results: Array<{ row: number; error: string }> = [];
  let imported = 0;

  for (const [index, row] of rows.entries()) {
    const full_name = row.full_name?.trim();
    const email = row.email?.trim();
    const phone = row.phone?.trim();
    const student_id = row.student_id?.trim();
    const student_roll_number = row.student_roll_number?.trim();

    if (!full_name || !email || (!student_id && !student_roll_number)) {
      results.push({ row: index + 2, error: 'Missing required full_name, email, or student_id/student_roll_number' });
      continue;
    }

    try {
      let resolvedStudentId = student_id;
      if (!resolvedStudentId && student_roll_number) {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('organisation_id', organisation_id)
          .eq('roll_number', student_roll_number)
          .maybeSingle();

        if (studentError) throw studentError;
        if (!studentData) {
          results.push({ row: index + 2, error: `Student not found for roll_number ${student_roll_number}` });
          continue;
        }

        resolvedStudentId = studentData.id;
      }

      const password = generatePassword();
      const password_hash = await bcrypt.hash(password, 10);

      const { data: user, error: userError } = await supabase.from('users').insert({
        organisation_id,
        full_name,
        email,
        password_hash,
        role: 'parent',
        status: 'active'
      }).select().single();

      if (userError) throw userError;

      let authUserId: string | null = null;
      try {
        authUserId = await createAuthUser(email, password, full_name, 'parent', organisation_id);
      } catch (authError: any) {
        await supabase.from('users').delete().eq('id', user.id);
        throw authError;
      }

      const { data: parent, error: parentError } = await supabase.from('parents').insert({
        organisation_id,
        user_id: user.id,
        full_name,
        email,
        phone,
        status: 'active'
      }).select().single();

      if (parentError) {
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        await supabase.from('users').delete().eq('id', user.id);
        throw parentError;
      }

      // Create parent_student_links for canonical relationship
      try {
        await supabase.from('parent_student_links').insert({
          parent_id: user.id, student_id: resolvedStudentId, relationship: 'guardian'
        });
      } catch (_) {}
      imported += 1;
      getOrgName(organisation_id).then(orgName => logCredential(organisation_id, orgName, full_name, email, 'parent', 'Management Bulk Import'));
    } catch (error: any) {
      results.push({ row: index + 2, error: error.message });
    }
  }

  res.json({ imported, errors: results, message: `Parent import completed: ${imported} created, ${results.length} skipped.` });
});

// Get all users for an organisation
router.get('/users/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, status, created_at')
      .eq('organisation_id', org_id);

    if (error) throw error;
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get students with credentials for an organisation
router.get('/students/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*, users:users(id, full_name, email, role, status, created_at), classes:classes!students_class_id_fkey(name), sections:sections!students_section_id_fkey(name)')
      .eq('organisation_id', org_id);

    if (error) throw error;
    const result = (students || []).map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      full_name: s.full_name,
      email: s.email || s.users?.email || '',
      roll_number: s.roll_number,
      student_class: s.classes?.name || '',
      section: s.sections?.name || '',
      status: s.status || s.users?.status || 'active',
      created_at: s.created_at || s.users?.created_at || '',
      last_login: s.users?.last_login || ''
    }));
    res.json({ students: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff with credentials for an organisation
router.get('/staff/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data: teachers, error } = await supabase
      .from('staff_records')
      .select('*, users:users!inner(id, full_name, email, role, status, created_at)')
      .eq('organisation_id', org_id);

    if (error) throw error;
    const result = (teachers || []).map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      full_name: t.full_name,
      email: t.users?.email || '',
      department: t.subject || '',
      designation: t.users?.role || 'staff',
      status: t.status,
      created_at: t.created_at || t.users?.created_at || '',
      last_login: t.users?.last_login || ''
    }));
    res.json({ staff: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get parents with credentials for an organisation
router.get('/parents/:org_id', async (req, res) => {
  let { org_id } = req.params;

  if (!isValidUUID(org_id)) org_id = req.user?.organisationId || '';
  if (!isValidUUID(org_id)) {
    return res.status(400).json({ error: 'Invalid organisation_id' });
  }

  try {
    const { data: parents, error } = await supabase
      .from('parents')
      .select('*, users:users(id, full_name, email, role, status, created_at)')
      .eq('organisation_id', org_id);

    if (error) throw error;
    const result = (parents || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email || p.users?.email || '',
      phone: p.phone || '',
      status: p.status || p.users?.status || 'active',
      created_at: p.created_at || p.users?.created_at || '',
      last_login: p.users?.last_login || ''
    }));
    res.json({ parents: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get parent-student relationships for an organisation
router.get('/parent-student-links/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data: links, error } = await supabase
      .from('parent_student_links')
      .select(`
        id,
        parent_id,
        student_id,
        relationship,
        parent:parents!inner(full_name, email, phone),
        student:students!inner(full_name, roll_number)
      `)
      .eq('parent.organisation_id', org_id);

    if (error) throw error;

    const normalized = (links || []).map((link: any) => ({
      id: link.id,
      parent_name: link.parent?.full_name ?? '',
      email: link.parent?.email ?? '',
      phone: link.parent?.phone ?? '',
      student_id: link.student_id,
      student_name: link.student?.full_name ?? '',
      student_roll_number: link.student?.roll_number ?? ''
    }));

    res.json({ parent_student_links: normalized });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status
router.put('/user/:user_id/status', validateBody(updateUserStatusSchema), async (req, res) => {
  const { user_id } = req.params;
  const { status } = req.body;

  try {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', user_id);

    if (error) throw error;
    res.json({ message: 'User status updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CSV EXPORT ====================

function escapeCsvField(value: any): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: Record<string, any>[], columns: string[]): string {
  const header = columns.map(c => escapeCsvField(c)).join(',');
  const body = rows.map(row =>
    columns.map(col => escapeCsvField(row[col])).join(',')
  ).join('\n');
  return '\uFEFF' + header + '\n' + body;
}

// Export students as CSV
router.get('/export-students/:org_id/csv', async (req, res) => {
  const { org_id } = req.params;
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*, users:users(full_name, email, status, created_at), classes:classes!students_class_id_fkey(name), sections:sections!students_section_id_fkey(name)')
      .eq('organisation_id', org_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = (students || []).map((s: any) => ({
      Name: s.full_name || '',
      Email: s.email || s.users?.email || '',
      Class: s.classes?.name || '',
      Section: s.sections?.name || '',
      Status: s.status || 'active',
      'Created Date': s.created_at ? new Date(s.created_at).toLocaleDateString() : ''
    }));

    const csv = toCsv(rows, ['Name', 'Email', 'Class', 'Section', 'Status', 'Created Date']);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="students-export.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export staff as CSV
router.get('/export-staff/:org_id/csv', async (req, res) => {
  const { org_id } = req.params;
  try {
    const { data: staff, error } = await supabase
      .from('staff_records')
      .select('*, users:users!inner(full_name, email, role, status, created_at)')
      .eq('organisation_id', org_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = (staff || []).map((s: any) => ({
      Name: s.full_name || '',
      Email: s.email || s.users?.email || '',
      Department: s.subject || '',
      Designation: s.users?.role || 'staff',
      Status: s.status || 'active',
      'Created Date': s.created_at ? new Date(s.created_at).toLocaleDateString() : ''
    }));

    const csv = toCsv(rows, ['Name', 'Email', 'Department', 'Designation', 'Status', 'Created Date']);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="staff-export.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export parents as CSV
router.get('/export-parents/:org_id/csv', async (req, res) => {
  const { org_id } = req.params;
  try {
    const { data: parents, error } = await supabase
      .from('parents')
      .select('*, users:users(full_name, email, status, created_at)')
      .eq('organisation_id', org_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = (parents || []).map((p: any) => ({
      Name: p.full_name || '',
      Email: p.email || p.users?.email || '',
      Phone: p.phone || '',
      Status: p.status || 'active',
      'Created Date': p.created_at ? new Date(p.created_at).toLocaleDateString() : ''
    }));

    const csv = toCsv(rows, ['Name', 'Email', 'Phone', 'Status', 'Created Date']);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="parents-export.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
