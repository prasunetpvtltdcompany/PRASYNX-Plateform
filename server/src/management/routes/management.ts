import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase } from '../lib/backend-common';
import { createAuthUser } from '../lib/auth-helper';
import { verifyManagementAuth, enforceOrgAccess } from '../middleware/verifyAuth';
import { credentialLimiter } from '../middleware/rateLimiter';
import { config } from '../config';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { trackChange, notifyRole, notifyStudentsInClass, notifyParentsOfStudentsInClass, notifyStaffAssignedToClass, notifyStudentParents } from '../utils/sync';
import { sendCredentialEmail } from '../lib/mail.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(v: any): boolean {
  return typeof v === 'string' && UUID_RE.test(v);
}

const MAX_SECTION_STUDENTS = 35;

// Auto-assigns a section for a student when the class has sections: Section A is
// filled first, then B, then C — a student is never placed directly into the class
// when sections exist. Returns null when the class has no (active) sections, meaning
// the student goes directly to the class.
async function autoAssignSection(orgId: string, classId: string) {
  const { data: sections, error } = await supabase
    .from('sections')
    .select('id, name, capacity')
    .eq('class_id', classId)
    .eq('organisation_id', orgId)
    .eq('status', 'active')
    .order('name', { ascending: true });
  if (error || !sections || sections.length === 0) return null;
  const ids = sections.map((s: any) => s.id);
  const { data: rows } = await supabase
    .from('class_student_map')
    .select('section_id')
    .in('section_id', ids);
  const counts = new Map<string, number>();
  for (const r of rows || []) counts.set(r.section_id, (counts.get(r.section_id) || 0) + 1);
  // Fill A first; move to the next section only when the current one is full.
  for (const s of sections) {
    const cap = s.capacity ?? MAX_SECTION_STUDENTS;
    if ((counts.get(s.id) || 0) < cap) return s.id;
  }
  // All sections are full — spread overflow onto the least-filled section.
  return [...sections].sort((a: any, b: any) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0))[0].id;
}

function generateAlphaDigitPassword(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[crypto.randomInt(0, chars.length)];
  }
  return password;
}

async function logCredential(orgId: string, orgName: string, fullName: string, email: string, role: string, createdBy: string, password?: string) {
  try {
    await supabase.from('credential_history').insert({
      organisation_id: orgId,
      organisation_name: orgName,
      full_name: fullName,
      email,
      role,
      created_by: createdBy,
      password: password || null
    });
  } catch (_) {}
}

async function getOrgName(orgId: string): Promise<string> {
  try {
    const { data } = await supabase.from('organisations').select('name').eq('id', orgId).maybeSingle();
    return data?.name || '';
  } catch { return ''; }
}

async function insertStudentCompat(payload: Record<string, any>) {
  return supabase.from('students').insert([payload]).select();
}

const router = Router();

// Apply authentication + org access control + audit logging to all routes below
router.use(verifyManagementAuth);

// URL param org_id must match JWT org_id (skip invalid UUIDs for backward compat)
router.param('organisation_id', (req: any, res, next, value) => {
  if (!req.user) return sendError(res, 'Authentication required', 401);
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) && value !== req.user.organisationId) {
    return sendError(res, 'Cross-organisation access denied.', 403);
  }
  next();
});

router.use(enforceOrgAccess());

// Dashboard
router.get('/dashboard/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  
  try {
    const [students, staff, classes, announcements] = await Promise.all([
      supabase.from('students').select('*').eq('organisation_id', organisation_id),
      supabase.from('users').select('*').eq('organisation_id', organisation_id).eq('role', 'staff'),
      supabase.from('classes').select('*').eq('organisation_id', organisation_id),
      supabase.from('announcements').select('*').eq('organisation_id', organisation_id).order('created_at', { ascending: false })
    ]);

    res.json({
      stats: {
        totalStudents: students.data?.length || 0,
        totalStaff: staff.data?.length || 0,
        totalClasses: classes.data?.length || 0
      },
      recentAnnouncements: announcements.data?.slice(0, 5) || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === STUDENT MANAGEMENT ===
router.post('/students', asyncHandler(async (req, res) => {
  let { organisation_id, full_name, roll_number, student_class, section, class_id, section_id, phone, email, password, parent_info, parent_email, parent_phone } = req.body;
  if (!organisation_id) organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required — try logging out and back in' });
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (!full_name) return res.status(400).json({ error: 'full_name required' });
  if (!roll_number) return res.status(400).json({ error: 'roll_number required' });

  try {
    // Resolve class_id and section_id before insert
    let resolvedClassId: string | null = null;
    let resolvedSectionId: string | null = section_id && isValidUUID(section_id) ? section_id : null;
    const classValue = class_id || student_class;

    if (classValue) {
      const resolved = await resolveOrCreateClassSection(organisation_id, classValue, section || '');
      resolvedClassId = resolved.classId;
      resolvedSectionId = resolvedSectionId || resolved.sectionId;
      // When the class has sections, auto-assign A first (B only when A is full) —
      // never place the student directly into the class.
      if (resolvedClassId && !resolvedSectionId) {
        const autoSectionId = await autoAssignSection(organisation_id, resolvedClassId);
        if (autoSectionId) resolvedSectionId = autoSectionId;
      }
    } else if (section && isValidUUID(section)) {
      resolvedSectionId = section;
    }

    let authUserId: string | null = null;
    if (email && password) {
      try {
        authUserId = await createAuthUser(email, password, full_name, 'student', organisation_id);
      } catch (authError: any) {
        throw authError;
      }
    }

    const { data, error } = await insertStudentCompat({
      organisation_id,
      full_name,
      roll_number,
      class_id: resolvedClassId,
      section_id: resolvedSectionId,
      phone,
      user_id: authUserId,
      email: email || null,
      parent_name: parent_info?.type === 'new' ? parent_info.full_name || null : null,
      parent_email: parent_info?.email || parent_email || null,
      parent_phone: parent_info?.phone || parent_phone || null,
      parent_relationship: parent_info?.relationship || 'guardian',
      status: 'active'
    });

    if (error) {
      if (authUserId) {
        await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        await supabase.from('users').delete().eq('id', authUserId);
      }
      throw error;
    }

    const studentId = data?.[0]?.id;

    // Add to class_student_map
    if (studentId && resolvedClassId) {
      await supabase.from('class_student_map').upsert({
        class_id: resolvedClassId, student_id: studentId, organisation_id,
        section_id: resolvedSectionId
      }, { onConflict: 'class_id,student_id' });
    }

    // Handle parent linking (new format: parent_info object, old format: parent_email text)
    if (studentId && parent_info) {
      if (parent_info.type === 'existing' && parent_info.parent_id && isValidUUID(parent_info.parent_id)) {
        await supabase.from('parent_student_links').upsert({
          organisation_id, parent_id: parent_info.parent_id, student_id: studentId,
          relationship: parent_info.relationship || 'guardian'
        }, { onConflict: 'parent_id,student_id' }).select().single();
      } else if (parent_info.type === 'new' && parent_info.email) {
        const pw = parent_info.password || crypto.randomUUID().slice(0, 12) + '!';
        const { data: existing } = await supabase.from('users').select('id').eq('email', parent_info.email).maybeSingle();
        let parentUserId: string;
        if (existing) {
          parentUserId = existing.id;
        } else {
          parentUserId = await createAuthUser(parent_info.email, pw, parent_info.full_name || full_name, 'parent', organisation_id);
        }
        await supabase.from('parents').insert({
          organisation_id, user_id: parentUserId,
          full_name: parent_info.full_name || full_name,
          email: parent_info.email,
          phone: parent_info.phone || null, status: 'active',
          generated_password: pw
        }).select().single();
        await supabase.from('parent_student_links').upsert({
          organisation_id, parent_id: parentUserId, student_id: studentId,
          relationship: parent_info.relationship || 'guardian'
        }, { onConflict: 'parent_id,student_id' }).select().single();
        getOrgName(organisation_id).then(n => logCredential(organisation_id, n, parent_info.full_name || full_name, parent_info.email, 'parent', 'Student Creation', pw));
      }
    } else if (studentId && parent_email && !parent_info) {
      const pw = crypto.randomUUID().slice(0, 12) + '!';
      const { data: existing } = await supabase.from('users').select('id').eq('email', parent_email).maybeSingle();
      let parentUserId: string;
      if (existing) {
        parentUserId = existing.id;
      } else {
        parentUserId = await createAuthUser(parent_email, pw, `Parent of ${full_name}`, 'parent', organisation_id);
      }
      await supabase.from('parents').insert({
        organisation_id, user_id: parentUserId,
        full_name: `Parent of ${full_name}`, email: parent_email,
        phone: parent_phone || null, status: 'active',
        generated_password: pw
      }).select().single();
      await supabase.from('parent_student_links').upsert({
        organisation_id, parent_id: parentUserId, student_id: studentId,
        relationship: 'guardian'
      }, { onConflict: 'parent_id,student_id' }).select().single();
      getOrgName(organisation_id).then(n => logCredential(organisation_id, n, `Parent of ${full_name}`, parent_email, 'parent', 'Student Creation', pw));
    }

    if (email && password) {
      res.status(201).json({ student: data?.[0], credentials: { email, password }, section_id: resolvedSectionId });
      getOrgName(organisation_id).then(n => logCredential(organisation_id, n, full_name, email, 'student', 'Management Portal', password));
    } else {
      res.status(201).json({ ...data?.[0], section_id: resolvedSectionId });
    }

    if (studentId) {
      trackChange({ organisationId: organisation_id, tableName: 'students', operation: 'INSERT', recordId: studentId });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

async function resolveOrCreateClassSection(orgId: string, classNameOrId: string, sectionNameOrId: string) {
  if (!classNameOrId) return { classId: null, sectionId: null, className: null };

  let cls: any = null;

  if (isValidUUID(classNameOrId)) {
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', classNameOrId)
      .eq('organisation_id', orgId)
      .maybeSingle();
    cls = data;
  } else {
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .eq('name', classNameOrId)
      .eq('organisation_id', orgId)
      .maybeSingle();
    cls = data;
  }

  if (!cls && !isValidUUID(classNameOrId)) {
    const { data: newCls, error: classErr } = await supabase
      .from('classes')
      .insert({
        organisation_id: orgId,
        name: classNameOrId,
        status: 'active'
      })
      .select()
      .single();

    if (classErr) {
      console.error('Failed to auto-create class:', classErr);
    } else {
      cls = newCls;
    }
  }

  const classId = cls?.id || null;
  const className = cls?.name || (isValidUUID(classNameOrId) ? null : classNameOrId);
  let sectionId: string | null = null;

  if (classId && sectionNameOrId) {
    if (isValidUUID(sectionNameOrId)) {
      const { data: sect } = await supabase
        .from('sections')
        .select('id')
        .eq('id', sectionNameOrId)
        .eq('class_id', classId)
        .eq('organisation_id', orgId)
        .maybeSingle();
      return { classId, sectionId: sect?.id || null, className };
    }

    let { data: sect } = await supabase
      .from('sections')
      .select('id')
      .eq('name', sectionNameOrId)
      .eq('class_id', classId)
      .eq('organisation_id', orgId)
      .maybeSingle();

    if (!sect) {
      const { data: newSect, error: sectErr } = await supabase
        .from('sections')
        .insert({
          organisation_id: orgId,
          class_id: classId,
          name: sectionNameOrId
        })
        .select()
        .single();

      if (sectErr) {
        console.error('Failed to auto-create section:', sectErr);
      } else {
        sect = newSect;
      }
    }
    sectionId = sect?.id || null;
  }

  return { classId, sectionId, className };
}

async function listStudents(req: any, res: any, orgId: string) {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const userIds = [...new Set((students || []).map((s: any) => s.user_id).filter(Boolean))];
    let userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, email').eq('organisation_id', orgId);
      userMap = Object.fromEntries((users || []).map((u: any) => [u.id, u]));
    }

    const { data: classes } = await supabase.from('classes').select('*').eq('organisation_id', orgId);
    const { data: sections } = await supabase.from('sections').select('*').eq('organisation_id', orgId);

    const classIds = (classes || []).map((c: any) => c.id);
    const { data: maps } = classIds.length > 0
      ? await supabase.from('class_student_map').select('*').in('class_id', classIds)
      : { data: [] };

    const { data: links } = await supabase.from('parent_student_links').select('*');

    const parentUserIds = [...new Set((links || []).map((l: any) => l.parent_id).filter(Boolean))];
    let parentsMap: Record<string, any> = {};
    let parentUsersMap: Record<string, any> = {};

    if (parentUserIds.length > 0) {
      const { data: parentsProfile } = await supabase.from('parents').select('*').eq('organisation_id', orgId);
      parentsMap = Object.fromEntries((parentsProfile || []).map((p: any) => [p.user_id, p]));

      const { data: pUsers } = await supabase.from('users').select('id, email').eq('organisation_id', orgId);
      parentUsersMap = Object.fromEntries((pUsers || []).map((u: any) => [u.id, u]));
    }

    const classMap = Object.fromEntries((classes || []).map((c: any) => [c.id, c]));
    const sectionMap = Object.fromEntries((sections || []).map((s: any) => [s.id, s]));
    const studentToClassMap = Object.fromEntries((maps || []).map((m: any) => [m.student_id, m.class_id]));
    const parentLinksByStudentId: Record<string, any[]> = {};
    for (const l of (links || [])) {
      if (!parentLinksByStudentId[l.student_id]) parentLinksByStudentId[l.student_id] = [];
      parentLinksByStudentId[l.student_id].push(l);
    }

    const result = (students || []).map((s: any) => {
      const resolvedClassId = s.class_id || studentToClassMap[s.id];
      const resolvedClass = resolvedClassId ? classMap[resolvedClassId] : null;
      const resolvedSection = s.section_id ? sectionMap[s.section_id] : null;

      const studentClass = resolvedClass?.name || '';
      const section = resolvedSection?.name || '';

      const studentLinks = parentLinksByStudentId[s.id] || [];
      const firstLink = studentLinks[0];
      const parentProfile = firstLink ? parentsMap[firstLink.parent_id] : null;
      const parentUser = firstLink ? parentUsersMap[firstLink.parent_id] : null;

      const parentName = parentProfile?.full_name || s.parent_name || '';
      const parentEmail = parentProfile?.email || s.parent_email || '';
      const parentPhone = parentProfile?.phone || s.parent_phone || '';
      const parentRelationship = firstLink?.relationship || s.parent_relationship || 'guardian';
      const parentLoginCreated = !!parentUser || !!parentProfile?.user_id;

      return {
        ...s,
        class_id: resolvedClassId || s.class_id || '',
        section_id: s.section_id || '',
        email: s.email || userMap[s.user_id]?.email || '',
        student_class: studentClass,
        section: section,
        parents: studentLinks.map((l: any) => {
          const profile = parentsMap[l.parent_id] || {};
          const pUser = parentUsersMap[l.parent_id] || {};
          return {
            parent_id: l.parent_id,
            parent_name: profile.full_name || '',
            parent_email: profile.email || '',
            parent_phone: profile.phone || '',
            relationship: l.relationship || 'guardian',
            parent_login_created: !!pUser || !!profile.user_id,
          };
        }),
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        parent_relationship: parentRelationship,
        student_login_created: !!s.user_id && !!userMap[s.user_id],
        parent_login_created: parentLoginCreated
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Student search (must be before :org_id catch-all)
router.get('/students/search/:org_id', asyncHandler(async (req, res) => {
  const orgId = req.params.org_id;
  const q = (req.query.q as string || '').trim();
  if (!q || q.length < 2) return res.json([]);
  const { data } = await supabase.from('students')
    .select('id, full_name, roll_number, section_id, sections:sections!students_section_id_fkey(name)')
    .eq('organisation_id', orgId)
    .or(`full_name.ilike.%${q}%,roll_number.ilike.%${q}%`)
    .limit(20);
  const mapped = (data || []).map((s: any) => ({ ...s, section: s.sections?.name || '' }));
  res.json(mapped);
}));

// Parent search
router.get('/parents/search/:org_id', asyncHandler(async (req, res) => {
  const orgId = req.params.org_id;
  const q = (req.query.q as string || '').trim();
  if (!q || q.length < 2) return res.json([]);
  const { data } = await supabase.from('parents')
    .select('id, user_id, full_name, email, phone')
    .eq('organisation_id', orgId)
    .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(20);
  res.json((data || []).map((parent: any) => ({
    ...parent,
    profile_id: parent.id,
    id: parent.user_id || parent.id
  })));
}));

// Support both /students (uses user org) and /students/:org_id (backward compat)
router.get('/students', (req, res) => listStudents(req, res, req.user?.organisationId || ''));
router.get('/students/:organisation_id', (req, res) => {
  const { organisation_id } = req.params;
  if (!isValidUUID(organisation_id)) {
    if (req.user?.organisationId) return listStudents(req, res, req.user.organisationId);
    return res.status(400).json({ error: 'Invalid organisation_id' });
  }
  listStudents(req, res, organisation_id);
});

router.patch('/students/:student_id', asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  const updates = req.body;
  delete updates.organisation_id;
  const orgId = req.body.organisation_id || (req as any).user?.organisationId || '';
  const confirm = updates.confirm === true;
  delete updates.confirm;
  
  try {
    // Extract parent specific fields
    const {
      parent_name,
      parent_email,
      parent_phone,
      parent_relationship,
      student_class,
      section,
      ...studentUpdates
    } = updates;

    // 1. Get current student record to resolve user_id and class_id
    const { data: studentRecord } = await supabase
      .from('students')
      .select('user_id, class_id, section_id')
      .eq('id', student_id)
      .single();

    // Update Student User Login account if student details changed and login exists
    if ((studentUpdates.email || studentUpdates.full_name) && studentRecord?.user_id) {
      const userUpdates: any = {};
      if (studentUpdates.full_name !== undefined) userUpdates.full_name = studentUpdates.full_name;
      if (studentUpdates.email !== undefined) userUpdates.email = studentUpdates.email;

      await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', studentRecord.user_id);

      await supabase.auth.admin.updateUserById(studentRecord.user_id, {
        email: studentUpdates.email || undefined,
        user_metadata: studentUpdates.full_name ? { full_name: studentUpdates.full_name } : undefined
      }).catch(() => {});
    }

    // 2. Resolve class (class_id or student_class text)
    if (studentUpdates.class_id !== undefined || student_class !== undefined) {
      const classValue = studentUpdates.class_id !== undefined ? studentUpdates.class_id : student_class;
      let resolvedClassId = null;

      if (classValue) {
        const resolved = await resolveOrCreateClassSection(orgId, classValue, '');
        resolvedClassId = resolved.classId;
      }

      studentUpdates.class_id = resolvedClassId;

      // 2a. Guard: moving an already-assigned student to a different class/section
      // requires explicit confirmation (double-confirm on the frontend). Runs before
      // the mapping is replaced so we can see the student's current assignment.
      if (!confirm) {
        const { data: currentMaps } = await supabase
          .from('class_student_map')
          .select('class_id, section_id')
          .eq('student_id', student_id);
        const moved = (currentMaps || []).some((m: any) => m.class_id !== resolvedClassId);
        if (moved) {
          const { data: names } = await supabase
            .from('class_student_map')
            .select('class:classes!class_student_map_class_id_fkey(name), section:sections!class_student_map_section_id_fkey(name)')
            .eq('student_id', student_id);
          return res.status(409).json({
            success: false,
            error: 'Student is already assigned to another class/section. Re-assignment requires confirmation.',
            code: 'REASSIGN_REQUIRES_CONFIRM',
            details: { current_assignments: (names || []).map((n: any) => ({ class_name: n.class?.name || 'Unknown class', section_name: n.section?.name || null })) },
          });
        }
      }
    }

    // 3. Resolve section (section_id or section text)
    if (studentUpdates.section_id !== undefined || section !== undefined) {
      const sectionValue = studentUpdates.section_id !== undefined ? studentUpdates.section_id : section;
      if (sectionValue && isValidUUID(sectionValue)) {
        studentUpdates.section_id = sectionValue;
      } else if (sectionValue) {
        const resolvedClassId = studentUpdates.class_id !== undefined ? studentUpdates.class_id : studentRecord?.class_id;
        if (resolvedClassId && isValidUUID(resolvedClassId)) {
          const { data: sect } = await supabase
            .from('sections')
            .select('id')
            .eq('name', sectionValue)
            .eq('class_id', resolvedClassId)
            .maybeSingle();
          studentUpdates.section_id = sect?.id || null;
        } else {
          studentUpdates.section_id = null;
        }
      } else {
        // No section chosen — when the class has sections, auto-assign A first
        // (B only when A is full); never place the student directly into the class.
        const resolvedClassId = studentUpdates.class_id !== undefined ? studentUpdates.class_id : studentRecord?.class_id;
        studentUpdates.section_id = null;
        if (resolvedClassId && isValidUUID(resolvedClassId)) {
          const autoSectionId = await autoAssignSection(orgId, resolvedClassId);
          if (autoSectionId) studentUpdates.section_id = autoSectionId;
        }
      }
    }

    // 3b. Rebuild class_student_map with the final class + section so the mapping
    // stays consistent with the student record (section_id included).
    if (studentUpdates.class_id !== undefined || studentUpdates.section_id !== undefined || student_class !== undefined || section !== undefined) {
      await supabase.from('class_student_map').delete().eq('student_id', student_id);
      const finalClassId = studentUpdates.class_id ?? studentRecord?.class_id ?? null;
      const finalSectionId = studentUpdates.section_id ?? null;
      if (finalClassId) {
        await supabase.from('class_student_map').insert({
          student_id,
          class_id: finalClassId,
          section_id: finalSectionId || null,
          organisation_id: orgId,
        });
      }
    }

    // 4. Keep parent fields on student table in sync
    if (parent_name !== undefined) studentUpdates.parent_name = parent_name;
    if (parent_email !== undefined) studentUpdates.parent_email = parent_email;
    if (parent_phone !== undefined) studentUpdates.parent_phone = parent_phone;
    if (parent_relationship !== undefined) studentUpdates.parent_relationship = parent_relationship || 'guardian';

    // 5. Update student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .update(studentUpdates)
      .eq('id', student_id)
      .eq('organisation_id', orgId)
      .select()
      .single();
    
    if (studentError) throw studentError;

    // 6. Update parent profile and parent-student link
    const { data: linkRecord } = await supabase
      .from('parent_student_links')
      .select('*')
      .eq('student_id', student_id)
      .maybeSingle();

    if (parent_email) {
      const { data: existingParentUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', parent_email)
        .maybeSingle();

      if (existingParentUser) {
        // Link to existing parent user
        if (linkRecord) {
          if (linkRecord.parent_id !== existingParentUser.id) {
            await supabase.from('parent_student_links').delete().eq('id', linkRecord.id);
            await supabase.from('parent_student_links').upsert({
              organisation_id: orgId,
              parent_id: existingParentUser.id,
              student_id: student_id,
              relationship: parent_relationship || 'guardian'
            }, { onConflict: 'parent_id,student_id' });
          } else {
            if (parent_relationship !== undefined) {
              await supabase
                .from('parent_student_links')
                .update({ relationship: parent_relationship })
                .eq('id', linkRecord.id);
            }
          }
        } else {
          await supabase.from('parent_student_links').upsert({
            organisation_id: orgId,
            parent_id: existingParentUser.id,
            student_id: student_id,
            relationship: parent_relationship || 'guardian'
          }, { onConflict: 'parent_id,student_id' });
        }

        // Keep parent profile in sync
        const { data: existingParentProfile } = await supabase
          .from('parents')
          .select('id')
          .eq('user_id', existingParentUser.id)
          .maybeSingle();

        if (!existingParentProfile) {
          await supabase.from('parents').insert({
            organisation_id: orgId,
            user_id: existingParentUser.id,
            full_name: parent_name || `Parent`,
            email: parent_email,
            phone: parent_phone || null,
            status: 'active'
          });
        } else {
          const parentProfileUpdates: any = {};
          if (parent_name !== undefined) parentProfileUpdates.full_name = parent_name;
          if (parent_phone !== undefined) parentProfileUpdates.phone = parent_phone;
          if (Object.keys(parentProfileUpdates).length > 0) {
            await supabase
              .from('parents')
              .update(parentProfileUpdates)
              .eq('user_id', existingParentUser.id);
          }
        }
      } else {
        // No parent user exists with this email. Update existing link or create a new parent.
        if (linkRecord) {
          const parentUserId = linkRecord.parent_id;

          const parentProfileUpdates: any = {};
          if (parent_name !== undefined) parentProfileUpdates.full_name = parent_name;
          if (parent_email !== undefined) parentProfileUpdates.email = parent_email;
          if (parent_phone !== undefined) parentProfileUpdates.phone = parent_phone;
          
          await supabase
            .from('parents')
            .update(parentProfileUpdates)
            .eq('user_id', parentUserId);
            
          const userUpdates: any = {};
          if (parent_name !== undefined) userUpdates.full_name = parent_name;
          if (parent_email !== undefined) userUpdates.email = parent_email;
          
          await supabase
            .from('users')
            .update(userUpdates)
            .eq('id', parentUserId);
            
          await supabase.auth.admin.updateUserById(parentUserId, {
            email: parent_email,
            user_metadata: parent_name ? { full_name: parent_name } : undefined
          }).catch(() => {});

          if (parent_relationship !== undefined) {
            await supabase
              .from('parent_student_links')
              .update({ relationship: parent_relationship })
              .eq('id', linkRecord.id);
          }
        } else {
          const pw = crypto.randomUUID().slice(0, 12) + '!';
          const parentUserId = await createAuthUser(
            parent_email,
            pw,
            parent_name || `Parent`,
            'parent',
            orgId
          );

          await supabase.from('parents').insert({
            organisation_id: orgId,
            user_id: parentUserId,
            full_name: parent_name || `Parent`,
            email: parent_email,
            phone: parent_phone || null,
            status: 'active'
          });

          await supabase.from('parent_student_links').insert({
            organisation_id: orgId,
            parent_id: parentUserId,
            student_id: student_id,
            relationship: parent_relationship || 'guardian'
          });
        }
      }
    } else {
      if (linkRecord && parent_relationship !== undefined) {
        await supabase
          .from('parent_student_links')
          .update({ relationship: parent_relationship })
          .eq('id', linkRecord.id);
      }
    }

    res.json(studentData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.delete('/students/:student_id', asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  try {
    await supabase.from('class_student_map').delete().eq('student_id', student_id);
    await supabase.from('parent_student_links').delete().eq('student_id', student_id);
    const { data, error } = await supabase.from('students').delete().eq('id', student_id).select().single();
    if (error) throw error;
    res.json({ success: true, deleted: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/students/bulk', asyncHandler(async (req, res) => {
  const { organisation_id, students } = req.body;
  if (!organisation_id || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'organisation_id and students array required' });
  }
  const results: any[] = [];
  let success = 0, failed = 0;
  
  // Track student emails processed in this batch to prevent duplicates within the batch
  const batchStudentEmails = new Set<string>();
  // Cache parent info in this batch to avoid redundant db queries and support siblings properly
  const batchParents = new Map<string, { userId: string; password: string }>();

  for (const s of students) {
    try {
      if (!s || typeof s !== 'object') {
        throw new Error('Invalid student data record');
      }
      // 1. Validations
      if (!s.full_name || !s.roll_number) {
        throw new Error('full_name and roll_number required');
      }
      // Auto-generate email from roll_number if not provided
      if (!s.email) {
        s.email = `${s.roll_number.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}@student.local`;
      }
      if (!s.parent_email || !s.parent_name) {
        throw new Error('parent_email and parent_name are required');
      }

      if (batchStudentEmails.has(s.email)) {
        throw new Error(`Duplicate student email in batch: ${s.email}`);
      }
      batchStudentEmails.add(s.email);

      // Check if student email already exists in users table
      const { data: existingStu } = await supabase.from('users').select('id').eq('email', s.email).maybeSingle();
      if (existingStu) {
        throw new Error(`Student email already exists: ${s.email}`);
      }

      // 2. Student Auth account creation
      let authUserId: string | null = null;
      const studentPw = s.password || crypto.randomUUID().slice(0, 12) + 'S!';
      try {
        authUserId = await createAuthUser(s.email, studentPw, s.full_name, 'student', organisation_id);
      } catch (authError: any) {
        throw authError;
      }

      // 3. Student database profile insert
      let classId: string | null = null;
      let sectionId: string | null = null;

      if (s.student_class) {
        const resolved = await resolveOrCreateClassSection(organisation_id, s.student_class, s.section);
        classId = resolved.classId;
        sectionId = resolved.sectionId;
        // When the class has sections, auto-assign A first (B only when A is full) —
        // never place the student directly into the class.
        if (classId && !sectionId) {
          const autoSectionId = await autoAssignSection(organisation_id, classId);
          if (autoSectionId) sectionId = autoSectionId;
        }
      }

      const { data: studentData, error: studentError } = await insertStudentCompat({
        organisation_id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        phone: s.phone || null,
        email: s.email || null,
        user_id: authUserId,
        class_id: classId,
        section_id: sectionId,
        parent_relationship: s.parent_relationship || 'guardian',
        status: 'active'
      });

      if (studentError) {
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        throw studentError;
      }

      const studentId = studentData?.[0]?.id;
      if (!studentId) {
        throw new Error('Failed to retrieve created student ID');
      }

      // 4. Class/section assignment
      if (classId) {
        await supabase.from('class_student_map').upsert({ class_id: classId, student_id: studentId, organisation_id, section_id: sectionId }, { onConflict: 'class_id,student_id' });
      }

      // 5. Parent Account Creation and Linking
      let parentUserId: string;
      let parentPassword = '';
      let isExistingParent = false;

      // Check if parent email is already cached in this batch
      if (batchParents.has(s.parent_email)) {
        const cached = batchParents.get(s.parent_email)!;
        parentUserId = cached.userId;
        parentPassword = cached.password;
        isExistingParent = true;
      } else {
        // Query database to see if parent user already exists
        const { data: existingParentUser } = await supabase.from('users').select('id').eq('email', s.parent_email).maybeSingle();
        if (existingParentUser) {
          parentUserId = existingParentUser.id;
          parentPassword = '(Existing)';
          isExistingParent = true;
          batchParents.set(s.parent_email, { userId: parentUserId, password: parentPassword });
        } else {
          // Generate secure password if not provided
          const pw = s.parent_password || crypto.randomUUID().slice(0, 12) + 'A!';
          parentUserId = await createAuthUser(s.parent_email, pw, s.parent_name, 'parent', organisation_id);
          parentPassword = pw;
          batchParents.set(s.parent_email, { userId: parentUserId, password: parentPassword });
        }
      }

      // Link Student and Parent if not already linked
      const { data: existingLink } = await supabase.from('parent_student_links')
        .select('id')
        .eq('parent_id', parentUserId)
        .eq('student_id', studentId)
        .maybeSingle();
      if (!existingLink) {
        const { error: linkErr } = await supabase.from('parent_student_links').upsert({
          organisation_id,
          parent_id: parentUserId,
          student_id: studentId,
          relationship: s.parent_relationship || 'guardian'
        }, { onConflict: 'parent_id,student_id' });
        if (linkErr) console.error('parent_student_links insert failed:', linkErr.message);
      }

      // Log parent credential creation if parent is new
      if (!isExistingParent) {
        getOrgName(organisation_id).then(n => logCredential(organisation_id, n, s.parent_name, s.parent_email, 'parent', 'Student Bulk Import', parentPassword));
      }
      // Log student credential creation
      getOrgName(organisation_id).then(n => logCredential(organisation_id, n, s.full_name, s.email, 'student', 'Management Bulk Import', studentPw));

      success++;
      results.push({
        "Student Name": s.full_name,
        "Student Email": s.email,
        "Student Password": studentPw,
        "Parent Name": s.parent_name,
        "Parent Email": s.parent_email,
        "Parent Password": parentPassword,
        "Status": "Success",
        "parent_user_id": parentUserId,
        "email": s.email,
        "password": studentPw
      });
    } catch (e: any) {
      failed++;
      results.push({
        "Student Name": (s && s.full_name) || 'Unknown',
        "Student Email": (s && s.email) || 'N/A',
        "Student Password": '—',
        "Parent Name": (s && s.parent_name) || 'N/A',
        "Parent Email": (s && s.parent_email) || 'N/A',
        "Parent Password": '—',
        "Status": "Failed",
        "error": e.message
      });
    }
  }
  res.json({ total: students.length, success_count: success, failed_count: failed, results });
}));

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

router.post('/students/bulk-delete', asyncHandler(async (req, res) => {
  const { organisation_id, student_ids } = req.body;
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ error: 'student_ids array required' });
  }

  const validIds = student_ids.filter(isValidUUID);
  if (validIds.length === 0) {
    return res.status(400).json({ error: 'No valid student_ids provided' });
  }

  try {
    const userIds: string[] = [];
    const chunks = chunkArray(validIds, 50);

    // 1. Fetch user_ids in chunks to avoid HeadersOverflowError
    for (const chunk of chunks) {
      const { data: chunkStudents, error: fetchError } = await supabase
        .from('students')
        .select('user_id')
        .in('id', chunk)
        .eq('organisation_id', organisation_id);
      
      if (fetchError) throw fetchError;
      if (chunkStudents) {
        userIds.push(...chunkStudents.map(s => s.user_id).filter(Boolean));
      }
    }

    // 2. Perform deletions in chunks to avoid HeadersOverflowError
    for (const chunk of chunks) {
      await supabase.from('parent_student_links').delete().in('student_id', chunk);
      await supabase.from('class_student_map').delete().in('student_id', chunk);
      await supabase.from('attendance').delete().in('student_id', chunk).eq('organisation_id', organisation_id);

      const { error: studentDeleteErr } = await supabase
        .from('students')
        .delete()
        .in('id', chunk)
        .eq('organisation_id', organisation_id);
      
      if (studentDeleteErr) throw studentDeleteErr;
    }

    // 3. Delete user profiles and auth accounts in chunks
    if (userIds.length > 0) {
      const userChunks = chunkArray(userIds, 50);
      for (const uChunk of userChunks) {
        await supabase.from('users').delete().in('id', uChunk).eq('organisation_id', organisation_id);
        await Promise.all(uChunk.map(uid => supabase.auth.admin.deleteUser(uid).catch(() => {})));
      }
    }

    res.json({ success: true, deleted_count: validIds.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === STAFF MANAGEMENT ===
router.post('/staff', asyncHandler(async (req, res) => {
  let {
    organisation_id,
    full_name,
    email,
    password,
    role,
    phone,
    employee_id,
    department,
    designation,
    qualification,
    experience_years,
    joining_date,
    gender,
    date_of_birth,
    address,
    city,
    state,
    country,
    postal_code,
    salary,
    employment_type,
    reporting_manager,
    subject
  } = req.body;
  if (!organisation_id) organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required — try logging out and back in' });
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (!full_name) return res.status(400).json({ error: 'full_name required' });

  // Generate employee_id if missing
  const employeeId = (employee_id || '').trim() || `STAFF-${Date.now()}`;
  // Generate email if missing
  const generatedEmail = (email || '').trim() || `${employeeId.toLowerCase()}@school.edu`;
  // Generate password if missing
  const crypto = require('crypto');
  const pwd = (password || '').trim() || `Pass@${crypto.randomBytes(4).toString('hex')}!`;
  try {
    const rawRole = (role || 'staff').trim().toLowerCase();
    const allowedRoles = ['teacher', 'admin', 'management', 'staff'];
    const staffRole = allowedRoles.includes(rawRole) ? rawRole : 'staff';
    let authUserId: string | null = null;
    try {
      authUserId = await createAuthUser(generatedEmail, pwd, full_name, staffRole, organisation_id);
    } catch (authError: any) {
      throw authError;
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (userError) {
      await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
      throw userError;
    }

    const experienceYears = experience_years ? parseInt(String(experience_years), 10) : null;
    const salaryVal = salary ? parseFloat(String(salary)) : null;

    const profilePayload = {
      organisation_id,
      user_id: authUserId,
      staff_unique_id: employeeId,
      full_name,
      email: generatedEmail,
      phone: phone || null,
      status: 'active',
      qualification: qualification || null,
      join_date: joining_date || null,
      department: department || null,
      designation: designation || role || null,
      experience_years: isNaN(experienceYears as number) ? null : experienceYears,
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || null,
      postal_code: postal_code || null,
      salary: isNaN(salaryVal as number) ? null : salaryVal,
      employment_type: employment_type || null,
      reporting_manager: reporting_manager || null,
      subject: subject || null
    };

    const { data: teacher, error: teacherError } = await supabase
      .from('staff_records')
      .insert(profilePayload)
      .select()
      .single();

    if (teacherError) {
      await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
      await supabase.from('users').delete().eq('id', authUserId);
      throw teacherError;
    }

    res.status(201).json({ user, teacher, credentials: { email: generatedEmail, password: pwd } });
    getOrgName(organisation_id).then(n => logCredential(organisation_id, n, full_name, generatedEmail, staffRole, 'Management Portal', pwd));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/staff/validate-bulk', asyncHandler(async (req, res) => {
  const { organisation_id, staff } = req.body;
  if (!organisation_id || !Array.isArray(staff)) {
    return res.status(400).json({ error: 'organisation_id and staff array required' });
  }

  // Pre-fetch all existing users and teachers for this organisation to do bulk validation quickly
  const { data: dbUsers } = await supabase.from('users').select('email').eq('organisation_id', organisation_id);
  const { data: dbTeachers } = await supabase.from('staff_records').select('staff_unique_id').eq('organisation_id', organisation_id);

  const dbEmails = new Set((dbUsers || []).map(u => u.email.toLowerCase()));
  const dbCodes = new Set([
    ...(dbTeachers || []).map(t => (t.staff_unique_id || '').toLowerCase())
  ]);

  const payloadEmails = new Set<string>();
  const payloadCodes = new Set<string>();

  const results = staff.map((s, idx) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check full_name
    if (!s.full_name || !s.full_name.trim()) {
      errors.push('Full Name is required');
    }

    // Determine email
    let email = (s.email || '').trim().toLowerCase();
    const empId = (s.employee_id || '').trim();

    if (!email && empId) {
      email = `${empId.toLowerCase()}@school.edu`;
    }

    if (!email) {
      errors.push('Email or Employee ID is required to generate account credentials');
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email format: ${email}`);
      } else {
        // Duplicate in payload
        if (payloadEmails.has(email)) {
          errors.push(`Duplicate email in import file: ${email}`);
        } else {
          payloadEmails.add(email);
        }

        // Duplicate in DB
        if (dbEmails.has(email)) {
          errors.push(`Email already exists in database: ${email}`);
        }
      }
    }

    // Check Employee ID
    if (empId) {
      const codeLower = empId.toLowerCase();
      if (payloadCodes.has(codeLower)) {
        errors.push(`Duplicate Employee ID in import file: ${empId}`);
      } else {
        payloadCodes.add(codeLower);
      }

      if (dbCodes.has(codeLower)) {
        errors.push(`Employee ID already exists in database: ${empId}`);
      }
    }

    return {
      index: idx,
      full_name: s.full_name || 'Unknown',
      email: s.email || email || 'N/A',
      employee_id: s.employee_id || 'N/A',
      role: s.role || 'staff',
      valid: errors.length === 0,
      errors,
      warnings
    };
  });

  res.json({
    valid: results.every(r => r.valid),
    results
  });
}));

router.post('/staff/bulk', asyncHandler(async (req, res) => {
  const { organisation_id, staff, send_welcome_email } = req.body;
  if (!organisation_id || !Array.isArray(staff) || staff.length === 0) {
    return res.status(400).json({ error: 'organisation_id and staff array required' });
  }

  // Pre-fetch classes and subjects to map them quickly
  const { data: dbClasses } = await supabase.from('classes').select('id, name').eq('organisation_id', organisation_id);
  const { data: dbSubjects } = await supabase.from('subjects').select('id, name').eq('organisation_id', organisation_id);

  const classMap = new Map((dbClasses || []).map(c => [c.name.toLowerCase(), c.id]));
  const subjectMap = new Map((dbSubjects || []).map(s => [s.name.toLowerCase(), s.id]));

  const results: any[] = [];
  let success = 0, failed = 0;

  // Track duplicates in this batch
  const batchEmails = new Set<string>();
  const batchCodes = new Set<string>();

  const crypto = require('crypto');

  for (let idx = 0; idx < staff.length; idx++) {
    const s = staff[idx];
    let email = 'N/A';
    let empId = 'N/A';
    let name = 'Unknown';

    try {
      if (!s || typeof s !== 'object') {
        throw new Error('Invalid staff data record');
      }
      email = (s.email || '').trim();
      empId = (s.employee_id || '').trim();
      name = (s.full_name || '').trim();

      if (!name) {
        throw new Error('Full name is required');
      }

      // Generate employee_id if missing
      const employeeId = empId || `STAFF-${Date.now()}-${idx}`;

      // Generate email (username) from employee_id if missing
      const generatedEmail = email || `${employeeId.toLowerCase()}@school.edu`;

      // Generate password if missing or empty
      const pwd = (s.password || '').trim() || `Pass@${crypto.randomBytes(4).toString('hex')}!`;

      // Map roles
      const rawRole = (s.role || '').trim().toLowerCase();
      
      const roleMapping: Record<string, string> = {
        'principal': 'teacher',
        'vice principal': 'teacher',
        'vice_principal': 'teacher',
        'academic coordinator': 'teacher',
        'academic_coordinator': 'teacher',
        'head of department': 'teacher',
        'hod': 'teacher',
        'teacher': 'teacher',
        'assistant teacher': 'teacher',
        'assistant_teacher': 'teacher',
        'subject teacher': 'teacher',
        'subject_teacher': 'teacher',
        'physical education teacher': 'teacher',
        'physical_education_teacher': 'teacher',
        'music teacher': 'teacher',
        'music_teacher': 'teacher',
        'dance teacher': 'teacher',
        'dance_teacher': 'teacher',
        'art teacher': 'teacher',
        'art_teacher': 'teacher',
        'computer teacher': 'teacher',
        'computer_teacher': 'teacher',
        'lab instructor': 'teacher',
        'lab_instructor': 'teacher',
        'special educator': 'teacher',
        'special_educator': 'teacher',
        'sports coach': 'teacher',
        'sports_coach': 'teacher',
        'librarian': 'staff',
        'assistant librarian': 'staff',
        'assistant_librarian': 'staff',
        'transport manager': 'staff',
        'transport_manager': 'staff',
        'transport coordinator': 'staff',
        'transport_coordinator': 'staff',
        'bus driver': 'staff',
        'bus_driver': 'staff',
        'driver helper': 'staff',
        'driver_helper': 'staff',
        'school administrator': 'admin',
        'school_administrator': 'admin',
        'accountant': 'staff',
        'finance manager': 'staff',
        'finance_manager': 'staff',
        'hr manager': 'staff',
        'hr_manager': 'staff',
        'admission officer': 'staff',
        'admission_officer': 'staff',
        'front desk executive': 'staff',
        'front_desk_executive': 'staff',
        'receptionist': 'staff',
        'data entry operator': 'staff',
        'data_entry_operator': 'staff',
        'security guard': 'staff',
        'security_guard': 'staff',
        'security supervisor': 'staff',
        'security_supervisor': 'staff',
        'sweeper': 'staff',
        'cleaner': 'staff',
        'housekeeping staff': 'staff',
        'housekeeping_staff': 'staff',
        'gardener': 'staff',
        'school nurse': 'staff',
        'school_nurse': 'staff',
        'doctor': 'staff',
        'counselor': 'staff',
        'counsellor': 'staff',
        'hostel warden': 'staff',
        'hostel_warden': 'staff',
        'warden': 'staff',
        'mess manager': 'staff',
        'mess_manager': 'staff',
        'store keeper': 'staff',
        'store_keeper': 'staff',
        'inventory manager': 'staff',
        'inventory_manager': 'staff',
        'procurement officer': 'staff',
        'procurement_officer': 'staff',
        'event coordinator': 'staff',
        'event_coordinator': 'staff'
      };

      const staffRole = roleMapping[rawRole] || 'staff';

      // Check duplicates in batch
      if (batchEmails.has(generatedEmail.toLowerCase())) {
        throw new Error(`Duplicate email in payload: ${generatedEmail}`);
      }
      batchEmails.add(generatedEmail.toLowerCase());

      if (batchCodes.has(employeeId.toLowerCase())) {
        throw new Error(`Duplicate Employee ID in payload: ${employeeId}`);
      }
      batchCodes.add(employeeId.toLowerCase());

      // Check duplicate in DB
      const { data: emailDup } = await supabase.from('users').select('id').eq('email', generatedEmail).maybeSingle();
      if (emailDup) {
        throw new Error(`Email already exists in database: ${generatedEmail}`);
      }

      if (empId) {
        const { data: codeDup } = await supabase.from('staff_records').select('id').eq('staff_unique_id', employeeId).maybeSingle();
        if (codeDup) {
          throw new Error(`Employee ID already in use: ${employeeId}`);
        }
      }

      // Create auth user
      let authUserId: string | null = null;
      authUserId = await createAuthUser(generatedEmail, pwd, name, staffRole, organisation_id);

      // Create teacher/staff profile
      const experienceYears = s.experience_years ? parseInt(String(s.experience_years), 10) : null;
      const salary = s.salary ? parseFloat(String(s.salary)) : null;

      const profilePayload = {
        organisation_id,
        user_id: authUserId,
        staff_unique_id: employeeId,
        full_name: name,
        email: generatedEmail,
        phone: s.phone || null,
        status: 'active',
        qualification: s.qualification || null,
        join_date: s.joining_date || null,
        department: s.department || null,
        designation: s.designation || s.role || null,
        experience_years: isNaN(experienceYears as number) ? null : experienceYears,
        gender: s.gender || null,
        date_of_birth: s.date_of_birth || null,
        address: s.address || null,
        city: s.city || null,
        state: s.state || null,
        country: s.country || null,
        postal_code: s.postal_code || null,
        salary: isNaN(salary as number) ? null : salary,
        employment_type: s.employment_type || null,
        reporting_manager: s.reporting_manager || null,
        subject: s.assigned_subjects || null
      };

      const { data: teacher, error: teacherError } = await supabase
        .from('staff_records')
        .insert(profilePayload)
        .select()
        .single();

      if (teacherError) {
        await supabase.auth.admin.deleteUser(authUserId).catch(() => {});
        await supabase.from('users').delete().eq('id', authUserId);
        throw teacherError;
      }

      // ERP Auto-mapping
      // 1. Assign class and subject if teacher
      if (staffRole === 'teacher') {
        const classNames = (s.assigned_classes || '').split(',').map((c: string) => c.trim().toLowerCase()).filter(Boolean);
        const subjectNames = (s.assigned_subjects || '').split(',').map((sub: string) => sub.trim().toLowerCase()).filter(Boolean);

        for (const cName of classNames) {
          const classId = classMap.get(cName);
          if (classId) {
            for (const sName of subjectNames) {
              const subjectId = subjectMap.get(sName);
              if (subjectId) {
                try {
                  await supabase.from('class_subject_teacher_map').insert({
                    teacher_id: teacher.id,
                    class_id: classId,
                    subject_id: subjectId,
                    organisation_id
                  });
                } catch (err) {}
              }
            }
          }
        }
      }

      // 2. Assign vehicle if driver
      if (staffRole === 'driver' || rawRole.includes('driver')) {
        const vehicleVal = s.assigned_classes || s.assigned_subjects || s.vehicle_number;
        if (vehicleVal) {
          try {
            await supabase
              .from('transport_vehicles')
              .update({ driver_name: name, driver_phone: s.phone || null })
              .eq('organisation_id', organisation_id)
              .eq('vehicle_number', vehicleVal.trim());
          } catch (err) {}
        }
      }

      // Log creation
      getOrgName(organisation_id).then(n => logCredential(organisation_id, n, name, generatedEmail, staffRole, 'Management Bulk Import', pwd));

      // Welcome Email
      if (send_welcome_email && s.email) {
        const { sendCredentialEmail } = require('../lib/mail.service');
        await sendCredentialEmail(generatedEmail, name, pwd, 'Staff Portal').catch(() => {});
      }

      success++;
      results.push({
        "Employee ID": employeeId,
        "Name": name,
        "Email": generatedEmail,
        "Password": pwd,
        "Role": s.role || 'staff',
        "Status": "Success"
      });
    } catch (e: any) {
      failed++;
      results.push({
        "Employee ID": empId || 'N/A',
        "Name": name || 'Unknown',
        "Email": email || 'N/A',
        "Password": '—',
        "Role": (s && s.role) || 'staff',
        "Status": "Failed",
        "error": e.message
      });
    }
  }

  res.json({ total: staff.length, success_count: success, failed_count: failed, results });
}));

// Assign class+subject to staff (accepts arrays for multi-class, multi-subject)
router.post('/staff/:teacher_id/assign-class', asyncHandler(async (req, res) => {
  let { organisation_id, class_ids, subject_ids, section_ids } = req.body;
  if (!organisation_id) organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  const teacher_id = req.params.teacher_id;
  if (!isValidUUID(teacher_id)) return res.status(400).json({ error: 'Invalid teacher_id' });
  if (!Array.isArray(class_ids) || class_ids.length === 0) return res.status(400).json({ error: 'class_ids must be a non-empty array' });
  if (!Array.isArray(subject_ids) || subject_ids.length === 0) return res.status(400).json({ error: 'subject_ids must be a non-empty array' });
  if (section_ids && !Array.isArray(section_ids)) return res.status(400).json({ error: 'section_ids must be an array' });
  for (const cid of class_ids) { if (!isValidUUID(cid)) return res.status(400).json({ error: `Invalid class_id: ${cid}` }); }
  for (const sid of subject_ids) { if (!isValidUUID(sid)) return res.status(400).json({ error: `Invalid subject_id: ${sid}` }); }
  if (section_ids) { for (const sid of section_ids) { if (!isValidUUID(sid)) return res.status(400).json({ error: `Invalid section_id: ${sid}` }); } }
  try {
    const rows: { teacher_id: string; class_id: string; subject_id: string; organisation_id: string; section_id: string | null }[] = [];
    for (const class_id of class_ids) {
      for (const subject_id of subject_ids) {
        rows.push({
          teacher_id,
          class_id,
          subject_id,
          organisation_id,
          section_id: section_ids && section_ids.length > 0 ? section_ids[0] : null
        });
      }
    }
    const { data, error } = await supabase.from('class_subject_teacher_map').insert(rows).select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all assignments for a staff member grouped by type/role
router.get('/staff/:staff_id/assignments', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  let organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    // 1. Fetch teacher classes
    const { data: teacherClasses } = await supabase
      .from('teacher_class_assignments')
      .select('id, class_id, classes:classes!teacher_class_assignments_class_id_fkey(name)')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 2. Fetch teacher subjects
    const { data: teacherSubjects } = await supabase
      .from('teacher_subject_assignments')
      .select('id, subject_id, subjects(name, code)')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 3. Fetch teacher matrix maps
    const { data: teacherMatrix } = await supabase
      .from('class_subject_teacher_map')
      .select('id, class_id, subject_id, is_class_teacher, classes:classes!class_subject_teacher_map_class_id_fkey(name), subjects(name, code)')
      .eq('teacher_id', staff_id)
      .eq('classes.organisation_id', organisation_id);

    // 4. Fetch class teacher assignments
    const { data: classTeachers } = await supabase
      .from('class_teacher_assignments')
      .select('id, class_id, section_id, responsibilities, classes:classes!class_teacher_assignments_class_id_fkey(name), sections:sections!class_teacher_assignments_section_id_fkey(name)')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 5. Fetch transport
    const { data: transport } = await supabase
      .from('transport_assignments')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 6. Fetch security
    const { data: security } = await supabase
      .from('security_assignments')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 7. Fetch housekeeping
    const { data: housekeeping } = await supabase
      .from('housekeeping_assignments')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 8. Fetch sports
    const { data: sports } = await supabase
      .from('sports_assignments')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 9. Fetch hostel
    const { data: hostel } = await supabase
      .from('hostel_assignments')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 10. Fetch staff assignments
    const { data: staffAssignments } = await supabase
      .from('staff_assignments')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 11. Fetch generic workforce assignments
    const { data: workforceAssignments } = await supabase
      .from('workforce_assignments')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id);

    // 12. Fetch user permissions based on custom roles or system fallbacks
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', staff_id)
      .maybeSingle();

    let userPermissions: any[] = [];
    if (userProfile) {
      // Find custom role in public.roles
      const { data: customRole } = await supabase
        .from('roles')
        .select('*, role_permissions(permissions(*))')
        .eq('organisation_id', organisation_id)
        .or(`id.eq.${userProfile.role},name.ilike.${userProfile.role}`)
        .maybeSingle();

      if (customRole && customRole.role_permissions) {
        userPermissions = customRole.role_permissions
          .map((rp: any) => rp.permissions)
          .filter(Boolean);
      } else {
        // Fallback default system roles
        const defaultRoles: Record<string, string[]> = {
          teacher: ['attendance', 'homework', 'classes', 'subjects', 'marks'],
          principal: ['attendance', 'homework', 'classes', 'subjects', 'marks', 'fees', 'payroll', 'transport', 'library', 'inventory', 'medical', 'sports', 'security', 'workforce'],
          accountant: ['fees', 'payroll', 'inventory'],
          librarian: ['library'],
          driver: ['transport'],
          security: ['security'],
          housekeeping: ['inventory'],
          nurse: ['medical'],
          coach: ['sports']
        };
        const roleKey = (userProfile.role || '').toLowerCase();
        const allowedModules = defaultRoles[roleKey] || ['classes'];
        const { data: fallbackPerms } = await supabase
          .from('permissions')
          .select('*')
          .eq('organisation_id', organisation_id)
          .in('module', allowedModules);
        userPermissions = fallbackPerms || [];
      }
    }

    res.json({
      teacher_classes: teacherClasses || [],
      teacher_subjects: teacherSubjects || [],
      teacher_matrix: teacherMatrix || [],
      class_teachers: classTeachers || [],
      transport: transport || [],
      security: security || [],
      housekeeping: housekeeping || [],
      sports: sports || [],
      hostel: hostel || [],
      staff_assignments: staffAssignments || [],
      workforce_assignments: workforceAssignments || [],
      permissions: userPermissions || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST create/update an assignment for a staff member
router.post('/staff/:staff_id/assignments', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  let organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { type, payload } = req.body;
  if (!type || !payload) return res.status(400).json({ error: 'type and payload required' });

  try {
    let result: any = null;

    if (type === 'teacher_class') {
      const { class_id } = payload;
      const { data, error } = await supabase.from('teacher_class_assignments').upsert({
        organisation_id, staff_id, class_id
      }, { onConflict: 'staff_id,class_id' }).select().single();
      if (error) throw error;
      result = data;
    } 
    else if (type === 'teacher_subject') {
      const { subject_id } = payload;
      const { data, error } = await supabase.from('teacher_subject_assignments').upsert({
        organisation_id, staff_id, subject_id
      }, { onConflict: 'staff_id,subject_id' }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'teacher_matrix') {
      const { class_id, subject_id, section_id } = payload;
      const { data, error } = await supabase.from('class_subject_teacher_map').upsert({
        teacher_id: staff_id, 
        class_id, 
        subject_id: subject_id || null,
        section_id: section_id || null,
        organisation_id
      }, { onConflict: 'class_id,subject_id,teacher_id' }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'class_teacher') {
      const { class_id, section_id, responsibilities } = payload;
      
      const { data, error } = await supabase.from('class_teacher_assignments').upsert({
        organisation_id, staff_id, class_id, section_id: section_id || null, responsibilities: responsibilities || []
      }, { onConflict: 'class_id,section_id' }).select().single();
      if (error) throw error;
      result = data;

      // Sync to class_subject_teacher_map
      const { data: existingMaps } = await supabase
        .from('class_subject_teacher_map')
        .select('id')
        .eq('teacher_id', staff_id)
        .eq('class_id', class_id);

      if (existingMaps && existingMaps.length > 0) {
        await supabase
          .from('class_subject_teacher_map')
          .update({ is_class_teacher: true })
          .eq('teacher_id', staff_id)
          .eq('class_id', class_id);
      } else {
        await supabase.from('class_subject_teacher_map').insert({
          teacher_id: staff_id,
          class_id,
          subject_id: null,
          is_class_teacher: true,
          organisation_id
        });
      }
    }
    else if (type === 'transport') {
      const { vehicle_no, route_name, assigned_students_count, responsibilities } = payload;
      const { data, error } = await supabase.from('transport_assignments').insert({
        organisation_id, staff_id, vehicle_no, route_name, assigned_students_count: assigned_students_count || 0, responsibilities: responsibilities || []
      }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'security') {
      const { gate_name, building_area, shift } = payload;
      const { data, error } = await supabase.from('security_assignments').insert({
        organisation_id, staff_id, gate_name, building_area, shift
      }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'housekeeping') {
      const { floor, building, zone } = payload;
      const { data, error } = await supabase.from('housekeeping_assignments').insert({
        organisation_id, staff_id, floor, building, zone
      }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'sports') {
      const { sports_category, teams, practice_schedule } = payload;
      const { data, error } = await supabase.from('sports_assignments').insert({
        organisation_id, staff_id, sports_category, teams: teams || [], practice_schedule
      }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'hostel') {
      const { hostel_building, rooms, students_assigned_count } = payload;
      const { data, error } = await supabase.from('hostel_assignments').insert({
        organisation_id, staff_id, hostel_building, rooms: rooms || [], students_assigned_count: students_assigned_count || 0
      }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'staff_assignment') {
      const { assignment_type, assignment_name, assignment_reference_id, responsibility, start_date, end_date, status } = payload;
      const { data, error } = await supabase.from('staff_assignments').insert({
        organisation_id,
        organization_id: organisation_id,
        staff_id,
        assignment_type,
        assignment_name,
        assignment_reference_id: assignment_reference_id || null,
        responsibility: responsibility || null,
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || 'ACTIVE'
      }).select().single();
      if (error) throw error;
      result = data;
    }
    else if (type === 'workforce_assignment') {
      const { assignment_type, assignment_reference_id, start_date, end_date, status } = payload;
      const { data, error } = await supabase.from('workforce_assignments').insert({
        organisation_id,
        organization_id: organisation_id,
        staff_id,
        assignment_type,
        assignment_reference_id,
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || 'ACTIVE'
      }).select().single();
      if (error) throw error;
      result = data;
    }
    else {
      return res.status(400).json({ error: `Unknown assignment type: ${type}` });
    }

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// DELETE an assignment for a staff member
router.delete('/staff/assignments/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid assignment id' });

  try {
    let tableName = '';
    
    if (type === 'teacher_class') tableName = 'teacher_class_assignments';
    else if (type === 'teacher_subject') tableName = 'teacher_subject_assignments';
    else if (type === 'teacher_matrix') tableName = 'class_subject_teacher_map';
    else if (type === 'class_teacher') {
      tableName = 'class_teacher_assignments';
      const { data: ctRecord } = await supabase
        .from('class_teacher_assignments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (ctRecord) {
        await supabase
          .from('class_subject_teacher_map')
          .update({ is_class_teacher: false })
          .eq('teacher_id', ctRecord.staff_id)
          .eq('class_id', ctRecord.class_id);
          
        await supabase
          .from('class_subject_teacher_map')
          .delete()
          .eq('teacher_id', ctRecord.staff_id)
          .eq('class_id', ctRecord.class_id)
          .is('subject_id', null)
          .eq('is_class_teacher', false);
      }
    }
    else if (type === 'transport') tableName = 'transport_assignments';
    else if (type === 'security') tableName = 'security_assignments';
    else if (type === 'housekeeping') tableName = 'housekeeping_assignments';
    else if (type === 'sports') tableName = 'sports_assignments';
    else if (type === 'hostel') tableName = 'hostel_assignments';
    else if (type === 'staff_assignment') tableName = 'staff_assignments';
    else if (type === 'workforce_assignment') tableName = 'workforce_assignments';
    else {
      return res.status(400).json({ error: `Unknown assignment type: ${type}` });
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all tasks for a staff member
router.get('/staff/:staff_id/tasks', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: tasks, error } = await supabase
      .from('staff_tasks')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST create a new task for a staff member
router.post('/staff/:staff_id/tasks', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { title, description, priority, deadline, status, progress, task_type, start_date, location } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const { data, error } = await supabase
      .from('staff_tasks')
      .insert({
        organisation_id,
        staff_id,
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        deadline: deadline || null,
        status: status || 'PENDING',
        progress: typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : 0,
        task_type: task_type || 'OTHER',
        start_date: start_date || null,
        location: location || null
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// PUT update an existing task
router.put('/staff/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid task id' });

  const { title, description, priority, deadline, status, progress, task_type, start_date, location } = req.body;

  try {
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = Math.max(0, Math.min(100, progress));
    if (task_type !== undefined) updateData.task_type = task_type;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (location !== undefined) updateData.location = location;

    const { data, error } = await supabase
      .from('staff_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// DELETE a task
router.delete('/staff/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid task id' });

  try {
    const { error } = await supabase
      .from('staff_tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all staff tasks for an organisation (Assignments module) with staff enrichment
router.get('/staff-tasks', asyncHandler(async (req, res) => {
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data: tasks, error } = await supabase
      .from('staff_tasks')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const staffIds = [...new Set((tasks || []).map((t: any) => t.staff_id).filter(Boolean))];
    const nameMap = new Map<string, any>();
    if (staffIds.length) {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email, role, status')
        .in('id', staffIds);
      (users || []).forEach((u: any) => nameMap.set(u.id, { full_name: u.full_name, email: u.email, role: u.role, status: u.status }));

      const { data: staffRecs } = await supabase
        .from('staff_records')
        .select('user_id, department, designation, staff_unique_id, employment_type')
        .in('user_id', staffIds);
      (staffRecs || []).forEach((s: any) => {
        const cur = nameMap.get(s.user_id) || {};
        nameMap.set(s.user_id, { ...cur, department: s.department, designation: s.designation, staff_unique_id: s.staff_unique_id, employment_type: s.employment_type });
      });
    }

    const enriched = (tasks || []).map((t: any) => {
      const user = nameMap.get(t.staff_id) || {};
      return {
        ...t,
        staff_name: user.full_name || null,
        staff_email: user.email || null,
        staff_role: user.role || null,
        staff_status: user.status || null,
        department: user.department || null,
        designation: user.designation || null,
        staff_unique_id: user.staff_unique_id || null,
        employment_type: user.employment_type || null,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// WOS API HANDLERS

// GET all schedules/timetable entries/meetings for a staff member
router.get('/staff/:staff_id/schedules', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: schedules, error } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .order('start_time', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST create a new schedule entry
router.post('/staff/:staff_id/schedules', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { title, description, event_type, start_time, end_time, is_recurring, recurrence_pattern, room_or_location } = req.body;
  if (!title || !event_type || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required schedule fields' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_schedules')
      .insert({
        organisation_id,
        staff_id,
        title,
        description,
        event_type,
        start_time,
        end_time,
        is_recurring: is_recurring || false,
        recurrence_pattern: recurrence_pattern || null,
        room_or_location: room_or_location || null
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// DELETE a schedule entry
router.delete('/staff/schedules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid schedule id' });

  try {
    const { error } = await supabase
      .from('staff_schedules')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Schedule entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all resources for a staff member
router.get('/staff/:staff_id/resources', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data: resources, error } = await supabase
      .from('staff_resources')
      .select('*')
      .eq('organisation_id', organisation_id)
      .eq('staff_id', staff_id);
    if (error) throw error;
    res.json({ success: true, data: resources });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all general organization resources
router.get('/resources/all', asyncHandler(async (req, res) => {
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data: resources, error } = await supabase
      .from('staff_resources')
      .select('*')
      .eq('organisation_id', organisation_id);
    if (error) throw error;
    res.json({ success: true, data: resources });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST assign or create a resource
router.post('/staff/:staff_id/resources', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { resource_type, resource_name, serial_number, status, notes } = req.body;
  if (!resource_name || !resource_type) {
    return res.status(400).json({ error: 'resource_name and resource_type are required' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_resources')
      .insert({
        organisation_id,
        staff_id,
        resource_type,
        resource_name,
        serial_number: serial_number || null,
        status: status || 'ISSUED',
        issued_at: new Date().toISOString(),
        notes: notes || null
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// PUT update resource state
router.put('/staff/resources/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid resource id' });

  const { status, notes, staff_id } = req.body;
  const updateData: any = {};
  if (status !== undefined) {
    updateData.status = status;
    if (status === 'RETURNED') {
      updateData.returned_at = new Date().toISOString();
    } else if (status === 'AVAILABLE') {
      updateData.returned_at = new Date().toISOString();
      updateData.staff_id = null;
    }
  }
  if (notes !== undefined) updateData.notes = notes;
  if (staff_id !== undefined) updateData.staff_id = staff_id;

  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data, error } = await supabase
      .from('staff_resources')
      .update(updateData)
      .eq('id', id)
      .eq('organisation_id', organisation_id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET staff performance reviews
router.get('/staff/:staff_id/performance', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: performance, error } = await supabase
      .from('staff_performance')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .order('review_date', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: performance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST performance review
router.post('/staff/:staff_id/performance', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { score, kpi_metrics, manager_feedback, review_period } = req.body;

  try {
    const { data, error } = await supabase
      .from('staff_performance')
      .insert({
        organisation_id,
        staff_id,
        score: score ?? 100,
        kpi_metrics: kpi_metrics || {},
        manager_feedback: manager_feedback || null,
        review_period: review_period || 'MONTHLY'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET staff leave applications
router.get('/staff/:staff_id/leaves', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: leaves, error } = await supabase
      .from('staff_leave_requests')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: leaves });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST staff leave request
router.post('/staff/:staff_id/leaves', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { leave_type, start_date, end_date, reason, leave_category } = req.body;
  if (!leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required leave fields' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_leave_requests')
      .insert({
        organisation_id,
        staff_id,
        leave_type,
        start_date,
        end_date,
        reason,
        leave_category: leave_category || 'PAID',
        status: 'PENDING'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// PUT approve/reject leave requests
router.put('/staff/leaves/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid leave id' });

  const { status } = req.body;
  if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid leave status' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_leave_requests')
      .update({
        status,
        reviewed_by: req.user?.id || null,
        approved_at: status === 'APPROVED' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all leave requests for the organisation (management view)
router.get('/staff-leaves', asyncHandler(async (req, res) => {
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data: leaves, error } = await supabase
      .from('staff_leave_requests')
      .select('*, staff:users!staff_leave_requests_staff_id_fkey(id, full_name, email)')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const staffIds = Array.from(new Set((leaves || []).map((l: any) => l.staff_id).filter(Boolean))) as string[];
    let records: any[] = [];
    if (staffIds.length) {
      const { data: recs } = await supabase
        .from('staff_records')
        .select('user_id, staff_unique_id, department, designation')
        .eq('organisation_id', organisation_id)
        .in('user_id', staffIds);
      records = recs || [];
    }
    const recByUser = new Map(records.map((r: any) => [r.user_id, r]));

    const enriched = (leaves || []).map((l: any) => {
      const r = recByUser.get(l.staff_id) || {};
      return {
        ...l,
        staff_name: l.staff?.full_name || null,
        staff_email: l.staff?.email || null,
        employee_id: r.staff_unique_id || null,
        department: r.department || null,
        designation: r.designation || null
      };
    });
    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET org-wide staff performance (management view) enriched with staff info
router.get('/staff-performance', asyncHandler(async (req, res) => {
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data: perfs, error } = await supabase
      .from('staff_performance')
      .select('*, staff:users!staff_performance_staff_id_fkey(id, full_name, email)')
      .eq('organisation_id', organisation_id)
      .order('review_date', { ascending: false });
    if (error) throw error;

    const staffIds = Array.from(new Set((perfs || []).map((p: any) => p.staff_id).filter(Boolean))) as string[];
    let records: any[] = [];
    if (staffIds.length) {
      const { data: recs } = await supabase
        .from('staff_records')
        .select('user_id, staff_unique_id, department, designation, role, gender')
        .eq('organisation_id', organisation_id)
        .in('user_id', staffIds);
      records = recs || [];
    }
    const recByUser = new Map(records.map((r: any) => [r.user_id, r]));

    const enriched = (perfs || []).map((p: any) => {
      const r = recByUser.get(p.staff_id) || {};
      return {
        ...p,
        staff_name: p.staff?.full_name || null,
        staff_email: p.staff?.email || null,
        employee_id: r.staff_unique_id || null,
        department: r.department || null,
        designation: r.designation || null,
        role: r.role || null,
        gender: r.gender || null
      };
    });
    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET org-wide staff documents (management view) enriched with staff info
router.get('/documents', asyncHandler(async (req, res) => {
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data: docs, error } = await supabase
      .from('staff_documents')
      .select('*, staff:users!staff_documents_staff_id_fkey(id, full_name, email)')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const staffIds = Array.from(new Set((docs || []).map((d: any) => d.staff_id).filter(Boolean))) as string[];
    let records: any[] = [];
    if (staffIds.length) {
      const { data: recs } = await supabase
        .from('staff_records')
        .select('user_id, staff_unique_id, department, designation')
        .eq('organisation_id', organisation_id)
        .in('user_id', staffIds);
      records = recs || [];
    }
    const recByUser = new Map(records.map((r: any) => [r.user_id, r]));

    const enriched = (docs || []).map((d: any) => {
      const r = recByUser.get(d.staff_id) || {};
      return {
        ...d,
        staff_name: d.staff?.full_name || null,
        staff_email: d.staff?.email || null,
        employee_id: r.staff_unique_id || null,
        department: r.department || null,
        designation: r.designation || null
      };
    });
    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET staff folder documents
router.get('/staff/:staff_id/documents', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: docs, error } = await supabase
      .from('staff_documents')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: docs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST upload document metadata
router.post('/staff/:staff_id/documents', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { title, description, file_url, document_type, folder, tags } = req.body;
  if (!title || !file_url || !document_type) {
    return res.status(400).json({ error: 'Missing title, file_url or document_type' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_documents')
      .insert({
        organisation_id,
        staff_id,
        title,
        description,
        file_url,
        document_type,
        folder: folder || 'General',
        tags: tags || [],
        status: 'PENDING'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// PUT verify document state
router.put('/staff/documents/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid document id' });

  const { status } = req.body;
  if (!['VERIFIED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_documents')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET salary structure + payslip history for a staff member
router.get('/staff/:staff_id/salary', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || req.body?.organisation_id || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: payroll, error: payrollError } = await supabase
      .from('staff_payroll')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .maybeSingle();
    if (payrollError) throw payrollError;

    const { data: payslips, error: payslipsError } = await supabase
      .from('staff_payslips')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (payslipsError) throw payslipsError;

    res.json({ success: true, data: { payroll: payroll || null, payslips: payslips || [] } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// PUT upsert salary structure for a staff member
router.put('/staff/:staff_id/salary', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { base_salary, allowances, deductions, pay_frequency } = req.body;
  const components = Array.isArray(req.body.components)
    ? req.body.components
        .filter((c: any) => c && (c.label || Number(c.amount) > 0))
        .map((c: any) => ({
          label: String(c.label || 'Component').trim() || 'Component',
          amount: parseFloat(c.amount) || 0
        }))
    : [];
  const componentsSum = components.reduce((s: number, c: { amount: number }) => s + c.amount, 0);
  const net_salary = Math.max(
    0,
    parseFloat(base_salary || 0) + parseFloat(allowances || 0) + componentsSum - parseFloat(deductions || 0)
  );

  try {
    const { data, error } = await supabase
      .from('staff_payroll')
      .upsert(
        {
          organisation_id,
          staff_id,
          base_salary: parseFloat(base_salary || 0),
          allowances: parseFloat(allowances || 0),
          deductions: parseFloat(deductions || 0),
          net_salary,
          pay_frequency: pay_frequency || 'MONTHLY',
          components,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'organisation_id,staff_id' }
      )
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST create a payslip for a staff member
router.post('/staff/:staff_id/salary/payslip', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  const { month, year, gross_pay, deductions, status } = req.body;

  // Only the current month may be processed, and only once.
  const now = new Date();
  const currentMonth = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const currentYear = now.getFullYear();
  const payslipMonth = String(month || '').toUpperCase().slice(0, 3);
  const payslipYear = parseInt(year, 10) || currentYear;

  if (!month || !year) return res.status(400).json({ error: 'month and year required' });
  if (payslipMonth !== currentMonth || payslipYear !== currentYear) {
    return res.status(400).json({ error: `Payslips can only be generated for the current month (${currentMonth} ${currentYear})` });
  }

  try {
    const { data: existing, error: existError } = await supabase
      .from('staff_payslips')
      .select('id')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .eq('month', payslipMonth)
      .eq('year', payslipYear)
      .maybeSingle();
    if (existError) throw existError;
    if (existing) {
      return res.status(409).json({ error: 'A payslip has already been generated for the current month' });
    }

    const net_pay = Math.max(0, parseFloat(gross_pay || 0) - parseFloat(deductions || 0));
    const payment_method = String(req.body.payment_method || 'BANK').toUpperCase();
    const { data, error } = await supabase
      .from('staff_payslips')
      .insert({
        organisation_id,
        staff_id,
        month: payslipMonth,
        year: payslipYear,
        gross_pay: parseFloat(gross_pay || 0),
        deductions: parseFloat(deductions || 0),
        net_pay,
        status: status || 'PENDING',
        payment_method: ['CASH', 'BANK'].includes(payment_method) ? payment_method : 'BANK'
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// PUT update payslip status
router.put('/staff/payslips/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid payslip id' });

  const { status } = req.body;
  if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const { data: existing, error: existError } = await supabase
      .from('staff_payslips')
      .select('id, status')
      .eq('id', id)
      .maybeSingle();
    if (existError) throw existError;
    if (!existing) return res.status(404).json({ error: 'Payslip not found' });

    if (existing.status === 'PAID' && status !== 'PAID') {
      return res.status(409).json({ error: 'A paid payslip cannot be cancelled or reverted' });
    }

    const patch: any = { status };
    if (status === 'PAID') patch.paid_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('staff_payslips')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all payslips for an organisation (for salary register marking)
router.get('/staff/payslips/org/:organisation_id', asyncHandler(async (req, res) => {
  const organisation_id = req.params.organisation_id;
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data, error } = await supabase
      .from('staff_payslips')
      .select('id, staff_id, month, year, gross_pay, deductions, net_pay, status, paid_at, payment_method')
      .eq('organisation_id', organisation_id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (error) throw error;

    const staffIds = Array.from(new Set((data || []).map((p: any) => p.staff_id).filter(Boolean))) as string[];
    let staffMeta: Record<string, any> = {};
    if (staffIds.length) {
      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .in('id', staffIds);
      if (usersErr) throw usersErr;

      const { data: records, error: recErr } = await supabase
        .from('staff_records')
        .select('user_id, staff_unique_id, department, designation')
        .in('user_id', staffIds);
      if (recErr) throw recErr;

      const recByUser = new Map((records || []).map((r: any) => [r.user_id, r]));
      staffMeta = (users || []).reduce((acc: any, u: any) => {
        const r = recByUser.get(u.id) || {};
        acc[u.id] = {
          employee_id: r.staff_unique_id || u.email?.split('@')[0] || '',
          name: u.full_name || '',
          email: u.email || '',
          role: r.designation || u.role || 'Staff',
          department: r.department || 'General',
        };
        return acc;
      }, {});
    }

    const rows = (data || []).map((p: any) => ({ ...p, staff: staffMeta[p.staff_id] || null }));
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET all saved salary structures with staff info for an organisation
router.get('/staff/salaries/org/:organisation_id', asyncHandler(async (req, res) => {
  const organisation_id = req.params.organisation_id;
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  try {
    const { data, error } = await supabase
      .from('staff_payroll')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('updated_at', { ascending: false });
    if (error) throw error;

    const staffIds = Array.from(new Set((data || []).map((p: any) => p.staff_id).filter(Boolean))) as string[];
    let staffMeta: Record<string, any> = {};
    if (staffIds.length) {
      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .in('id', staffIds);
      if (usersErr) throw usersErr;

      const { data: records, error: recErr } = await supabase
        .from('staff_records')
        .select('user_id, staff_unique_id, department, designation')
        .in('user_id', staffIds);
      if (recErr) throw recErr;

      const recByUser = new Map((records || []).map((r: any) => [r.user_id, r]));
      staffMeta = (users || []).reduce((acc: any, u: any) => {
        const r = recByUser.get(u.id) || {};
        acc[u.id] = {
          employee_id: r.staff_unique_id || u.email?.split('@')[0] || '',
          name: u.full_name || '',
          email: u.email || '',
          role: r.designation || u.role || 'Staff',
          department: r.department || 'General',
        };
        return acc;
      }, {});
    }

    const rows = (data || []).map((p: any) => {
      const meta = staffMeta[p.staff_id] || {};
      const comps = Array.isArray(p.components) ? p.components : [];
      return {
        id: p.id,
        staff_id: p.staff_id,
        employee_id: meta.employee_id || '',
        name: meta.name || '',
        email: meta.email || '',
        role: meta.role || 'Staff',
        department: meta.department || 'General',
        base_salary: Number(p.base_salary) || 0,
        allowances: Number(p.allowances) || 0,
        deductions: Number(p.deductions) || 0,
        net_salary: Number(p.net_salary) || 0,
        pay_frequency: p.pay_frequency || 'MONTHLY',
        components: comps,
        updated_at: p.updated_at || '',
      };
    });
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET communication messages
router.get('/staff/:staff_id/messages', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: messages, error } = await supabase
      .from('staff_messages')
      .select('*')
      .eq('organisation_id', organisation_id)
      .or(`sender_id.eq.${staff_id},recipient_id.eq.${staff_id}`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST message
router.post('/staff/messages', asyncHandler(async (req, res) => {
  const organisation_id = req.body.organisation_id || req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });

  const { sender_id, recipient_id, channel_name, message_text, attachments } = req.body;
  if (!sender_id || !message_text) {
    return res.status(400).json({ error: 'sender_id and message_text are required' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_messages')
      .insert({
        organisation_id,
        sender_id,
        recipient_id: recipient_id || null,
        channel_name: channel_name || null,
        message_text,
        attachments: attachments || []
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET activities timeline log
router.get('/staff/:staff_id/activities', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    const { data: logs, error } = await supabase
      .from('staff_activity_logs')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET workloads status metrics
router.get('/staff/:staff_id/workload', asyncHandler(async (req, res) => {
  const staff_id = req.params.staff_id;
  const organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!isValidUUID(staff_id)) return res.status(400).json({ error: 'Invalid staff_id' });

  try {
    // Workload is computed on the fly from live assignment + task tables.
    // (A dedicated `staff_workloads` table is not provisioned in the live DB.)
    const safeCount = async (table: string, filters: Record<string, string>) => {
      try {
        let q = supabase.from(table).select('id', { count: 'exact', head: true });
        for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
        const { count, error } = await q;
        if (error) return 0;
        return count ?? 0;
      } catch {
        return 0;
      }
    };

    const activeClasses = await safeCount('teacher_class_assignments', { staff_id, organisation_id });
    const activeSubjects = await safeCount('teacher_subject_assignments', { staff_id, organisation_id });
    const matrixAssignments = await safeCount('class_subject_teacher_map', { teacher_id: staff_id, organisation_id });
    const staffAssignments = await safeCount('staff_assignments', { staff_id, organisation_id });

    const { data: tasks, error: tasksError } = await supabase
      .from('staff_tasks')
      .select('id')
      .eq('staff_id', staff_id)
      .eq('organisation_id', organisation_id)
      .in('status', ['PENDING', 'IN_PROGRESS'])
      .limit(500);
    const activeTasks = tasksError ? 0 : (tasks || []).length;

    const totalAssignments = activeClasses + activeSubjects + matrixAssignments + staffAssignments;
    const workloadPercentage = Math.min(100, Math.round(totalAssignments * 12 + activeTasks * 6));

    res.json({
      success: true,
      data: {
        workload_percentage: workloadPercentage,
        active_classes_count: activeClasses,
        active_subjects_count: activeSubjects,
        active_tasks_count: activeTasks,
        total_assignments: totalAssignments,
        computed_from: 'live'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));


async function listStaff(req: any, res: any, orgId: string) {
  const staffRoles = ['teacher', 'admin', 'accountant', 'librarian', 'transport_manager', 'hostel_warden', 'staff', 'driver', 'counsellor'];
  
  // Advanced query filters
  const { search, role, department, status, employment_type } = req.query;

  let userQuery = supabase
    .from('users')
    .select('id, full_name, email, role, status, created_at')
    .eq('organisation_id', orgId);

  if (role) {
    userQuery = userQuery.eq('role', role);
  } else {
    userQuery = userQuery.in('role', staffRoles);
  }

  if (status) {
    userQuery = userQuery.eq('status', status);
  }

  if (search) {
    userQuery = userQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, error: userError } = await userQuery;
  if (userError) return res.status(500).json({ error: userError.message });

  let teacherQuery = supabase
    .from('staff_records')
    .select('id, user_id, staff_unique_id, subject, phone, status, qualification, join_date, department, designation, experience_years, gender, date_of_birth, address, city, state, country, postal_code, salary, employment_type, reporting_manager')
    .eq('organisation_id', orgId);

  if (department) {
    teacherQuery = teacherQuery.eq('department', department);
  }
  if (employment_type) {
    teacherQuery = teacherQuery.eq('employment_type', employment_type);
  }

  const { data: teacherRows, error: teacherError } = await teacherQuery;
  if (teacherError) return res.status(500).json({ error: teacherError.message });


  const teacherIds = (teacherRows || []).map((t: any) => t.id);
  let mappings: any[] = [];
  if (teacherIds.length > 0) {
    const { data: mapData } = await supabase
      .from('class_subject_teacher_map')
      .select('teacher_id, class:classes!class_subject_teacher_map_class_id_fkey(name), subject:subjects(name)')
      .in('teacher_id', teacherIds);
    mappings = mapData || [];
  }

  const mappingsByTeacher = new Map<string, { classes: string[]; subjects: string[] }>();
  for (const m of mappings) {
    if (!m.teacher_id) continue;
    if (!mappingsByTeacher.has(m.teacher_id)) {
      mappingsByTeacher.set(m.teacher_id, { classes: [], subjects: [] });
    }
    const entry = mappingsByTeacher.get(m.teacher_id)!;
    if (m.class?.name && !entry.classes.includes(m.class.name)) {
      entry.classes.push(m.class.name);
    }
    if (m.subject?.name && !entry.subjects.includes(m.subject.name)) {
      entry.subjects.push(m.subject.name);
    }
  }

  const teacherMap = new Map((teacherRows || []).map((teacher: any) => [teacher.user_id, teacher]));
  const staff = (users || []).map((user: any) => {
    const t = teacherMap.get(user.id);
    const m = t ? mappingsByTeacher.get(t.id) : null;
    return {
      ...user,
      teacher_id: t?.id || null,
      staff_unique_id: t?.staff_unique_id || '',
      phone: t?.phone || '',
      subject: t?.subject || '',
      qualification: t?.qualification || '',
      join_date: t?.join_date || '',
      department: t?.department || '',
      designation: t?.designation || '',
      experience_years: t?.experience_years || 0,
      gender: t?.gender || '',
      date_of_birth: t?.date_of_birth || '',
      address: t?.address || '',
      city: t?.city || '',
      state: t?.state || '',
      country: t?.country || '',
      postal_code: t?.postal_code || '',
      salary: t?.salary || 0,
      employment_type: t?.employment_type || '',
      reporting_manager: t?.reporting_manager || '',
      assigned_classes: m?.classes || [],
      assigned_subjects: m?.subjects || []
    };
  });
  res.json(staff);
}


router.get('/staff', (req, res) => listStaff(req, res, req.user?.organisationId || ''));
router.get('/staff/:organisation_id', (req, res) => {
  const { organisation_id } = req.params;
  if (!isValidUUID(organisation_id)) {
    if (req.user?.organisationId) return listStaff(req, res, req.user.organisationId);
    return res.status(400).json({ error: 'Invalid organisation_id' });
  }
  listStaff(req, res, organisation_id);
});

router.put('/staff/:staff_id', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const {
    full_name,
    role,
    status,
    phone,
    employee_id,
    department,
    designation,
    qualification,
    experience_years,
    joining_date,
    gender,
    date_of_birth,
    address,
    city,
    state,
    country,
    postal_code,
    salary,
    employment_type,
    reporting_manager,
    subject
  } = req.body;
  const orgId = (req as any).user?.organisationId;

  try {
    const updatePayload: any = {};
    if (full_name) updatePayload.full_name = full_name;
    if (role) updatePayload.role = role;
    if (status) updatePayload.status = status;

    if (Object.keys(updatePayload).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', staff_id)
        .eq('organisation_id', orgId);
      if (userError) throw userError;
    }

    const teacherPayload: any = {};
    if (full_name) teacherPayload.full_name = full_name;
    if (phone !== undefined) teacherPayload.phone = phone || null;
    if (status !== undefined) teacherPayload.status = status;
    if (employee_id !== undefined) {
      teacherPayload.staff_unique_id = employee_id || `STAFF-${Date.now()}`;
    }
    if (department !== undefined) teacherPayload.department = department || null;
    if (designation !== undefined) teacherPayload.designation = designation || role || null;
    if (qualification !== undefined) teacherPayload.qualification = qualification || null;
    if (experience_years !== undefined) {
      const exp = experience_years ? parseInt(String(experience_years), 10) : null;
      teacherPayload.experience_years = isNaN(exp as number) ? null : exp;
    }
    if (joining_date !== undefined) teacherPayload.join_date = joining_date || null;
    if (gender !== undefined) teacherPayload.gender = gender || null;
    if (date_of_birth !== undefined) teacherPayload.date_of_birth = date_of_birth || null;
    if (address !== undefined) teacherPayload.address = address || null;
    if (city !== undefined) teacherPayload.city = city || null;
    if (state !== undefined) teacherPayload.state = state || null;
    if (country !== undefined) teacherPayload.country = country || null;
    if (postal_code !== undefined) teacherPayload.postal_code = postal_code || null;
    if (salary !== undefined) {
      const sal = salary ? parseFloat(String(salary)) : null;
      teacherPayload.salary = isNaN(sal as number) ? null : sal;
    }
    if (employment_type !== undefined) teacherPayload.employment_type = employment_type || null;
    if (reporting_manager !== undefined) teacherPayload.reporting_manager = reporting_manager || null;
    if (subject !== undefined) teacherPayload.subject = subject || null;

    if (Object.keys(teacherPayload).length > 0) {
      const { error: teacherError } = await supabase
        .from('staff_records')
        .update(teacherPayload)
        .eq('user_id', staff_id);
      if (teacherError) throw teacherError;
    }

    res.json({ message: 'Staff account updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.put('/staff/:staff_id/status', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { status } = req.body;
  const orgId = (req as any).user?.organisationId;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const { error: userError } = await supabase
      .from('users')
      .update({ status })
      .eq('id', staff_id)
      .eq('organisation_id', orgId);
    if (userError) throw userError;

    const { error: teacherError } = await supabase
      .from('staff_records')
      .update({ status })
      .eq('user_id', staff_id);
    if (teacherError) throw teacherError;

    res.json({ message: 'Staff status updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.delete('/staff/:staff_id', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const orgId = (req as any).user?.organisationId;

  try {
    const { data: teacherRow } = await supabase
      .from('staff_records')
      .select('id, user_id')
      .eq('user_id', staff_id)
      .maybeSingle();

    if (teacherRow) {
      await supabase
        .from('class_subject_teacher_map')
        .delete()
        .eq('teacher_id', teacherRow.id);

      await supabase
        .from('staff_records')
        .delete()
        .eq('id', teacherRow.id);
    }

    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', staff_id)
      .eq('organisation_id', orgId);

    if (userError) throw userError;

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === CLASS MANAGEMENT ===
router.post('/classes', asyncHandler(async (req, res) => {
  const { organisation_id, name, section, capacity } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert({ organisation_id, name, capacity, status: 'active' })
      .select()
      .single();
    
    if (error) throw error;
    if (section && data?.id) {
      await supabase
        .from('sections')
        .upsert({
          organisation_id,
          class_id: data.id,
          name: section,
          capacity: capacity || 35
        }, { onConflict: 'class_id,name' });
    }
    res.status(201).json(data);

    trackChange({ organisationId: organisation_id, tableName: 'classes', operation: 'INSERT', recordId: data?.id });
    notifyRole(organisation_id, 'teacher', 'New Class Created', `Class "${name}" has been created.`, 'class', data?.id);
    notifyRole(organisation_id, 'student', 'New Class Created', `Class "${name}" is now available.`, 'class', data?.id);
    notifyRole(organisation_id, 'parent', 'New Class Created', `A new class "${name}" has been created.`, 'class', data?.id);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/classes/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*, sections:sections!sections_class_id_fkey(id, name, capacity, room_number, status)')
      .eq('organisation_id', organisation_id)
      .order('name');
    
    if (error) throw error;
    const sorted = (data || []).sort((a: any, b: any) => {
      const gradeA = Number(String(a.name || '').match(/\d+/)?.[0] || Number.MAX_SAFE_INTEGER);
      const gradeB = Number(String(b.name || '').match(/\d+/)?.[0] || Number.MAX_SAFE_INTEGER);
      if (gradeA !== gradeB) return gradeA - gradeB;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
    res.json(sorted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// Assign student to class
router.post('/classes/:class_id/students', asyncHandler(async (req, res) => {
  const { class_id } = req.params;
  const studentIds = Array.isArray(req.body.student_ids)
    ? req.body.student_ids
    : (req.body.student_id ? [req.body.student_id] : []);
  const orgId = (req as any).user?.organisationId || req.body.organisation_id;

  if (studentIds.length === 0) {
    return res.status(400).json({ error: 'student_id or student_ids required' });
  }
  
  try {
    const rows = studentIds.map((student_id: string) => ({
      class_id,
      student_id,
      organisation_id: orgId
    }));
    const { data, error } = await supabase
      .from('class_student_map')
      .upsert(rows, { onConflict: 'class_id,student_id' })
      .select();
    
    if (error) throw error;
    await supabase
      .from('students')
      .update({ class_id, section_id: null })
      .in('id', studentIds)
      .eq('organisation_id', orgId);
    res.status(201).json(Array.isArray(req.body.student_ids) ? data || [] : data?.[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === SUBJECT MANAGEMENT ===
router.post('/subjects', asyncHandler(async (req, res) => {
  const { organisation_id, name, code, description } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert({ organisation_id, name, code, description })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);

    trackChange({ organisationId: organisation_id, tableName: 'subjects', operation: 'INSERT', recordId: data?.id });
    notifyRole(organisation_id, 'teacher', 'New Subject Added', `Subject "${name}" has been created.`, 'subject', data?.id);
    notifyRole(organisation_id, 'student', 'New Subject Added', `Subject "${name}" is now available.`, 'subject', data?.id);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/subjects/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('organisation_id', organisation_id);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === TIMETABLE MANAGEMENT ===

router.get('/timetable/staff-overview/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const [entriesRes, teachersRes] = await Promise.all([
      supabase.from('timetable_entries')
        .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
        .eq('organisation_id', organisation_id)
        .order('day_of_week').order('start_time'),
      supabase.from('staff_records').select('id, full_name, subject, email, phone').eq('organisation_id', organisation_id).eq('status', 'active')
    ]);
    if (entriesRes.error) throw entriesRes.error;
    if (teachersRes.error) throw teachersRes.error;
    res.json({ teachers: teachersRes.data || [], entries: entriesRes.data || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/timetable/teachers-list/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('staff_records').select('id, full_name, subject, email').eq('organisation_id', organisation_id).eq('status', 'active');
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/timetable/classes-list/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('classes').select('id, name').eq('organisation_id', organisation_id).eq('status', 'active');
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/sections/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('id, name, class_id, capacity, room_number, status')
      .eq('organisation_id', organisation_id)
      .order('name');
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/timetable/sections-list/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  const { class_id } = req.query;
  try {
    let query = supabase.from('sections').select('id, name, class_id, capacity, room_number').eq('organisation_id', organisation_id).eq('status', 'active').order('name');
    if (class_id) query = query.eq('class_id', class_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/timetable/subjects-list/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('subjects').select('id, name, code').eq('organisation_id', organisation_id);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/timetable', asyncHandler(async (req, res) => {
  const { organisation_id, class_id, section_id, teacher_id } = req.query;
  try {
    let query = supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*), section:sections!timetable_entries_section_id_fkey(*)')
      .order('day_of_week')
      .order('start_time');
    if (organisation_id) query = query.eq('organisation_id', organisation_id);
    if (class_id) query = query.eq('class_id', class_id);
    if (section_id) query = query.eq('section_id', section_id);
    if (teacher_id) query = query.eq('teacher_id', teacher_id);
    const { data, error } = await query;
    if (error) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('timetable_entries')
        .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
        .order('day_of_week')
        .order('start_time');
      if (fallbackError) throw fallbackError;
      return res.json(fallback || []);
    }
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/timetable/class/:class_id', asyncHandler(async (req, res) => {
  const { class_id } = req.params;
  const { section_id } = req.query;
  try {
    let query = supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*), section:sections!timetable_entries_section_id_fkey(*)')
      .eq('class_id', class_id)
      .order('day_of_week')
      .order('start_time');
    if (section_id) query = query.eq('section_id', section_id);
    const { data, error } = await query;
    if (error) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('timetable_entries')
        .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
        .eq('class_id', class_id)
        .order('day_of_week')
        .order('start_time');
      if (fallbackError) throw fallbackError;
      return res.json(fallback || []);
    }
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/timetable/teacher/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
      .eq('teacher_id', teacher_id)
      .order('day_of_week')
      .order('start_time');
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/timetable', asyncHandler(async (req, res) => {
  const { organisation_id, class_id, section_id, teacher_id, subject_id, day_of_week, start_time, end_time, room, entry_type, title } = req.body;
  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .insert({ organisation_id, class_id, section_id, teacher_id, subject_id, day_of_week, start_time, end_time, room, entry_type: entry_type || 'regular', title })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);

    if (data?.class_id) {
      trackChange({ organisationId: organisation_id || data.class_id, tableName: 'timetable', operation: 'INSERT', recordId: data.id });
      notifyStudentsInClass(organisation_id, data.class_id, 'Timetable Updated', 'Your class timetable has been updated. Please check the new schedule.', 'timetable', data.id);
      notifyParentsOfStudentsInClass(organisation_id, data.class_id, 'Timetable Updated', 'Your child\'s class timetable has been updated.', 'timetable', data.id);
      notifyStaffAssignedToClass(organisation_id, data.class_id, 'Timetable Updated', 'Your teaching timetable has been updated.', 'timetable', data.id);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.put('/timetable/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { class_id, section_id, teacher_id, subject_id, day_of_week, start_time, end_time, room, entry_type, title } = req.body;
  const orgId = (req as any).user?.organisationId;
  try {
    const { data: existing } = await supabase
      .from('timetable_entries')
      .select('organisation_id')
      .eq('id', id)
      .single();
    if (!existing || existing.organisation_id !== orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { data, error } = await supabase
      .from('timetable_entries')
      .update({ class_id, section_id, teacher_id, subject_id, day_of_week, start_time, end_time, room, entry_type: entry_type || 'regular', title })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.delete('/timetable/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = (req as any).user?.organisationId;
  try {
    const { data: existing } = await supabase
      .from('timetable_entries')
      .select('organisation_id')
      .eq('id', id)
      .single();
    if (!existing || existing.organisation_id !== orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/timetable/bulk', asyncHandler(async (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'entries array required' });
  }
  try {
    const { data, error } = await supabase.from('timetable_entries').insert(entries).select();
    if (error) throw error;
    res.status(201).json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/timetable/check-conflicts', asyncHandler(async (req, res) => {
  const { teacher_id, day_of_week, start_time, end_time, exclude_id } = req.query;
  if (!teacher_id || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: 'teacher_id, day_of_week, start_time, end_time required' });
  }
  try {
    let query = supabase
      .from('timetable_entries')
      .select('id, class_id, start_time, end_time, teacher:staff_records(full_name), class:classes!timetable_entries_class_id_fkey(name)')
      .eq('teacher_id', teacher_id)
      .eq('day_of_week', parseInt(day_of_week as string))
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`);
    if (exclude_id) query = query.neq('id', exclude_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === FEE MANAGEMENT ===
router.post('/fee-structures', asyncHandler(async (req, res) => {
  const { organisation_id, name, description, items } = req.body;
  
  try {
    const { data: structure, error: structureError } = await supabase
      .from('fee_structures')
      .insert({ organisation_id, name, description })
      .select()
      .single();
    
    if (structureError) throw structureError;

    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        fee_structure_id: structure.id,
        item_name: item.name,
        amount: item.amount
      }));

      await supabase.from('fee_items').insert(itemsToInsert);
    }

    res.status(201).json(structure);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/fees/assign', asyncHandler(async (req, res) => {
  const { student_id, fee_structure_id, due_date } = req.body;
  
  try {
    const { data: structure } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('id', fee_structure_id)
      .single();

    const { data: items } = await supabase
      .from('fee_items')
      .select('*')
      .eq('fee_structure_id', fee_structure_id);

    const totalAmount = items?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0;

    const { data, error } = await supabase
      .from('student_fees')
      .insert({ student_id, fee_structure_id, due_date, amount: totalAmount, status: 'pending' })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === ANNOUNCEMENTS ===
// === AI ANNOUNCEMENT DRAFT ===
router.post('/announcements/draft', asyncHandler(async (req, res) => {
  const { topic = '', audience = 'All Staff', tone = 'professional' } = req.body;
  const clean = (typeof topic === 'string' ? topic : '').trim() || 'Staff update';
  const aud = (typeof audience === 'string' && audience.trim() ? audience.trim() : 'All Staff');
  const lower = clean.toLowerCase();

  const festivals: { re: RegExp; name: string }[] = [
    { re: /diwali|deepawali|deepavali/, name: 'Diwali' },
    { re: /holi/, name: 'Holi' },
    { re: /christmas|xmas/, name: 'Christmas' },
    { re: /new year/, name: 'New Year' },
    { re: /eid/, name: 'Eid' },
    { re: /ramadan|ramzan/, name: 'Ramadan' },
    { re: /pongal/, name: 'Pongal' },
    { re: /onam/, name: 'Onam' },
    { re: /dussehra|dasara|navratri|durga/, name: 'Dussehra' },
    { re: /ganesh/, name: 'Ganesh Chaturthi' },
    { re: /janmashtami|krishna/, name: 'Janmashtami' },
    { re: /gurupurab|guru purab/, name: 'Guru Nanak Jayanti' },
    { re: /makar sankranti/, name: 'Makar Sankranti' },
    { re: /raksha bandhan/, name: 'Raksha Bandhan' },
    { re: /baisakhi|vaisakhi/, name: 'Baisakhi' },
    { re: /karwa chauth/, name: 'Karwa Chauth' },
    { re: /shivratri/, name: 'Mahashivratri' },
    { re: /independence day/, name: 'Independence Day' },
    { re: /republic day/, name: 'Republic Day' },
  ];
  const festival = festivals.find(f => f.re.test(lower))?.name;
  const birthday = /birthday|anniversary|work anniversary/.test(lower);
  const condolence = /demise|passed away|sad news|condolence|prayers|loss of/.test(lower);
  const appreciation = /congratulat|achievement|award|appreciat|excellent|outstanding|recogni[sz]e/.test(lower);
  const urgent = /urgent|deadline|submission|submit|due tomorrow|due today|by tomorrow|by today|immediately|emergency|action required|reminder|pending|overdue/.test(lower);

  let title: string;
  let content: string;

  if (festival) {
    title = `Wishing you a very Happy ${festival}!`;
    const openers = [
      `Wishing all the members of ${aud} a very Happy ${festival}!`,
      `A joyful ${festival} to every member of ${aud}!`,
      `Warm wishes to the entire ${aud} on the occasion of ${festival}!`,
    ];
    const wishes = [
      `May this ${festival} bring joy, prosperity, and togetherness to you and your family.`,
      `May the celebrations fill your home with light, laughter, and happiness.`,
      `May this festive season bring new beginnings and endless happiness to all of you.`,
      `May the blessings of ${festival} bring peace, health, and success to you and your loved ones.`,
    ];
    content = [
      openers[Math.floor(Math.random() * openers.length)],
      '',
      wishes[Math.floor(Math.random() * wishes.length)],
      `Please note: ${clean}.`,
      `We are grateful for your continued hard work and dedication to our organisation.`,
      '',
      'Warm regards,',
      'Management Team',
    ].join('\n');
  } else if (condolence) {
    title = `In Condolence — ${clean.charAt(0).toUpperCase()}${clean.slice(1)}`.slice(0, 60);
    const openers = [
      `It is with deep sadness that we share the news of ${clean} with all of you.`,
      `We are saddened to inform the ${aud} about ${clean}.`,
      `With heavy hearts, we convey the news of ${clean} to the ${aud}.`,
    ];
    const closers = [
      `Our thoughts and prayers are with the family in this difficult time.`,
      `We pray for strength and peace for the family during this moment of grief.`,
      `Kindly join us in offering condolences and support to the bereaved family.`,
    ];
    content = [
      openers[Math.floor(Math.random() * openers.length)],
      '',
      closers[Math.floor(Math.random() * closers.length)],
      `We request everyone to extend their support and respect the family's privacy.`,
      '',
      'With heartfelt sympathy,',
      'Management Team',
    ].join('\n');
  } else if (birthday) {
    title = `Happy Birthday to our ${aud === 'All Staff' ? 'Colleague' : aud}!`;
    const openers = [
      `A very happy birthday to the wonderful members of ${aud} celebrating today!`,
      `Celebrating a special day — heartfelt birthday wishes to all in ${aud}!`,
      `It is a special day — birthday wishes to everyone in ${aud} celebrating today!`,
    ];
    const wishes = [
      `May the year ahead bring you joy, good health, and success in everything you do.`,
      `Wishing you a day filled with happiness and a year filled with blessings.`,
      `May all your dreams and aspirations come true in the year ahead.`,
    ];
    content = [
      openers[Math.floor(Math.random() * openers.length)],
      '',
      wishes[Math.floor(Math.random() * wishes.length)],
      `Celebration details: ${clean}.`,
      `Thank you for being an invaluable part of our team.`,
      '',
      'With warm wishes,',
      'Management Team',
    ].join('\n');
  } else if (appreciation) {
    title = `Kudos to our ${aud} — ${clean.charAt(0).toUpperCase()}${clean.slice(1)}`.slice(0, 60);
    const openers = [
      `We are thrilled to recognise the incredible effort of ${aud} regarding ${clean}.`,
      `A big congratulations to ${aud} on ${clean}.`,
      `We would like to appreciate ${aud} for ${clean}.`,
    ];
    const praises = [
      `Your dedication and professionalism continue to inspire us all.`,
      `This achievement reflects the hard work, discipline, and commitment of our team.`,
      `We are truly proud of what you have accomplished together.`,
    ];
    const closers = [
      `Let us continue to raise the bar and achieve even greater heights.`,
      `Keep up the outstanding work — the best is yet to come!`,
      `We look forward to many more such milestones ahead.`,
    ];
    content = [
      openers[Math.floor(Math.random() * openers.length)],
      '',
      praises[Math.floor(Math.random() * praises.length)],
      closers[Math.floor(Math.random() * closers.length)],
      '',
      'Proud regards,',
      'Management Team',
    ].join('\n');
  } else if (urgent || tone === 'urgent') {
    title = `Action Required: ${clean.charAt(0).toUpperCase()}${clean.slice(1)}`.slice(0, 60);
    const openers = [
      `This is a time-sensitive matter regarding ${clean}. Please respond by the end of today.`,
      `We request your immediate attention on ${clean}. Please coordinate with management at the earliest.`,
      `Please prioritise ${clean} and confirm receipt promptly. Your timely response is greatly appreciated.`,
    ];
    content = [
      'URGENT NOTICE:',
      '',
      openers[Math.floor(Math.random() * openers.length)],
      `This notice is directed to ${aud}.`,
      '',
      'Thank you for your cooperation,',
      'Management Team',
    ].join('\n');
  } else {
    const openers = {
      professional: ['Dear members of staff,', 'To our valued team,', 'I am writing to inform you of the following:'],
      friendly: ['Hi everyone,', 'Hello team,', 'Good day, hardworking colleagues!'],
    };
    const middles = {
      professional: [
        `This announcement concerns ${clean}. Please review the details provided and reach out with any questions.`,
        `We want to keep you informed regarding ${clean}. Kindly take the appropriate next steps as outlined.`,
        `Please be aware of the following update relating to ${clean}. We appreciate your attention and cooperation.`,
      ],
      friendly: [
        `We are excited to share details about ${clean} with all of you. Do reach out if anything is unclear!`,
        `Quick heads-up about ${clean} — please read through it when you get a chance.`,
        `Some news on ${clean} to keep everyone in the loop. Thanks for all your hard work!`,
      ],
    };
    const open = (tone === 'friendly' ? openers.friendly : openers.professional);
    const mid = (tone === 'friendly' ? middles.friendly : middles.professional);
    title = `${clean.charAt(0).toUpperCase()}${clean.slice(1)}`.slice(0, 60);
    content = [
      open[Math.floor(Math.random() * open.length)],
      '',
      mid[Math.floor(Math.random() * mid.length)],
      `This message is directed to ${aud}.`,
      '',
      'Thank you,',
      'Management Team',
    ].join('\n');
  }

  res.json({ success: true, title, content, tone: festival ? 'celebration' : condolence ? 'condolence' : birthday ? 'birthday' : appreciation ? 'appreciation' : (urgent || tone === 'urgent') ? 'urgent' : tone });
}));

router.post('/announcements', asyncHandler(async (req, res) => {
  const { organisation_id, created_by, title, content, target_role, target_class_id, priority } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert({ organisation_id, created_by, title, content, target_role, target_class_id, priority })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.put('/announcements/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, target_role, target_class_id, priority, published_at } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('announcements')
      .update({ title, content, target_role, target_class_id, priority, published_at })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.delete('/announcements/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === EVENTS ===
router.post('/events', asyncHandler(async (req, res) => {
  const { organisation_id, title, description, event_type, start_date, end_date, start_time, end_time, location } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({ organisation_id, title, description, event_type, start_date, end_date, start_time, end_time, location })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === PARENT LINKING ===
router.post('/link-parent-student', asyncHandler(async (req, res) => {
  const { parent_id, student_id, relationship } = req.body;
  const orgId = (req as any).user?.organisationId;
  
  try {
    const { data: student } = await supabase
      .from('students')
      .select('organisation_id')
      .eq('id', student_id)
      .single();
    if (!student || student.organisation_id !== orgId) {
      return res.status(403).json({ error: 'Access denied: student not in your organisation' });
    }
    const { data, error } = await supabase
      .from('parent_student_links')
      .insert({ parent_id, student_id, relationship })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/parents/bulk', asyncHandler(async (req, res) => {
  const { organisation_id, parents } = req.body;
  if (!organisation_id || !Array.isArray(parents) || parents.length === 0) {
    return res.status(400).json({ error: 'organisation_id and parents array required' });
  }
  const results: any[] = [];
  let success = 0, failed = 0;
  for (const p of parents) {
    try {
      if (!p || typeof p !== 'object') {
        throw new Error('Invalid parent data record');
      }
      if (!p.parent_name || !p.parent_email) {
        failed++;
        results.push({ parent_name: p.parent_name || 'Unknown', parent_email: p.parent_email || '', status: 'failed', error: 'parent_name and parent_email required' });
        continue;
      }
      const password = p.parent_password || generateAlphaDigitPassword();
      const { data: existing } = await supabase.from('users').select('id').eq('email', p.parent_email).maybeSingle();
      let parentUserId: string;
      let isExisting = false;
      if (existing) {
        parentUserId = existing.id;
        isExisting = true;
      } else {
        try {
          parentUserId = await createAuthUser(p.parent_email, password, p.parent_name, 'parent', organisation_id);
        } catch (authError: any) {
          throw authError;
        }
      }
      // Check if parent profile already exists before inserting
      const { data: existingParentProfile } = await supabase.from('parents').select('id').eq('user_id', parentUserId).maybeSingle();
      if (!existingParentProfile) {
        await supabase.from('parents').insert({
          organisation_id, user_id: parentUserId,
          full_name: p.parent_name, email: p.parent_email,
          phone: p.parent_phone || null, status: 'active',
          generated_password: password
        }).select().single();
      } else {
        await supabase.from('parents').update({ generated_password: password }).eq('id', existingParentProfile.id);
      }
      if (p.student_id && isValidUUID(p.student_id)) {
        await supabase.from('parent_student_links').insert({
          organisation_id, parent_id: parentUserId, student_id: p.student_id,
          relationship: p.relationship || 'guardian'
        }).select().single();
      }
      success++;
      results.push({ parent_name: p.parent_name, parent_email: p.parent_email, password: isExisting ? '' : password, status: 'success', student_linked: !!p.student_id });
      if (!isExisting) {
        getOrgName(organisation_id).then(n => logCredential(organisation_id, n, p.parent_name, p.parent_email, 'parent', 'Management Bulk Import', password));
        sendCredentialEmail(p.parent_email, p.parent_name, password, 'Parent Portal');
      }
    } catch (e: any) {
      failed++;
      results.push({ parent_name: (p && p.parent_name) || 'Unknown', parent_email: (p && p.parent_email) || '', status: 'failed', error: e.message });
    }
  }
  res.json({ total: parents.length, success_count: success, failed_count: failed, results });
}));

router.post('/parents', asyncHandler(async (req, res) => {
  let { organisation_id, parent_name, parent_email, parent_password, student_id, relationship, phone } = req.body;
  if (!organisation_id) organisation_id = req.user?.organisationId || '';
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required — try logging out and back in' });
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (!parent_name) return res.status(400).json({ error: 'parent_name required' });
  if (!parent_email) return res.status(400).json({ error: 'parent_email required' });
  if (student_id && !isValidUUID(student_id)) return res.status(400).json({ error: 'Invalid student_id UUID' });
  try {
    const password = parent_password || generateAlphaDigitPassword();
    const { data: existing } = await supabase.from('users').select('id').eq('email', parent_email).maybeSingle();
    let parentUserId: string;
    let createdLogin = false;
    if (existing) {
      parentUserId = existing.id;
    } else {
      try {
        parentUserId = await createAuthUser(parent_email, password, parent_name, 'parent', organisation_id);
        createdLogin = true;
      } catch (authError: any) {
        throw authError;
      }
    }
    const { data: existingParentProfile } = await supabase
      .from('parents')
      .select('id')
      .eq('organisation_id', organisation_id)
      .eq('user_id', parentUserId)
      .maybeSingle();
    if (existingParentProfile) {
      await supabase.from('parents').update({
        full_name: parent_name, email: parent_email,
        phone: phone || null, status: 'active',
        generated_password: password
      }).eq('id', existingParentProfile.id);
    } else {
      await supabase.from('parents').insert({
      organisation_id, user_id: parentUserId,
      full_name: parent_name, email: parent_email,
      phone: phone || null, status: 'active',
      generated_password: password
      }).select().single();
    }
    if (student_id) {
      await supabase.from('parent_student_links').upsert({
        organisation_id, parent_id: parentUserId, student_id,
        relationship: relationship || 'guardian'
      }, { onConflict: 'parent_id,student_id' }).select().single();
    }
    res.status(201).json({
      parent_user_id: parentUserId,
      credentials: createdLogin ? { email: parent_email, password } : null,
    });
    if (createdLogin) {
      getOrgName(organisation_id).then(n => logCredential(organisation_id, n, parent_name, parent_email, 'parent', 'Management Portal', password));
      sendCredentialEmail(parent_email, parent_name, password, 'Parent Portal');
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.put('/parents/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { organisation_id, parent_name, parent_email, student_id, relationship, phone, status } = req.body;
  if (!organisation_id) organisation_id = req.user?.organisationId || '';
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid parent id' });
  if (!organisation_id || !isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (student_id && !isValidUUID(student_id)) return res.status(400).json({ error: 'Invalid student_id UUID' });
  if (!parent_name) return res.status(400).json({ error: 'parent_name required' });
  if (!parent_email) return res.status(400).json({ error: 'parent_email required' });

  try {
    const { data: parentProfile, error: parentError } = await supabase
      .from('parents')
      .select('id, user_id')
      .eq('id', id)
      .eq('organisation_id', organisation_id)
      .maybeSingle();
    if (parentError) throw parentError;
    if (!parentProfile) return res.status(404).json({ error: 'Parent not found' });

    await supabase.from('parents').update({
      full_name: parent_name,
      email: parent_email,
      phone: phone || null,
      status: status || 'active',
    }).eq('id', id);

    if (parentProfile.user_id) {
      await supabase.from('users').update({
        full_name: parent_name,
        email: parent_email,
        status: status || 'active',
      }).eq('id', parentProfile.user_id).eq('organisation_id', organisation_id);
    }

    if (parentProfile.user_id) {
      await supabase
        .from('parent_student_links')
        .delete()
        .eq('organisation_id', organisation_id)
        .eq('parent_id', parentProfile.user_id);
      if (student_id) {
        await supabase.from('parent_student_links').insert({
          organisation_id,
          parent_id: parentProfile.user_id,
          student_id,
          relationship: relationship || 'guardian',
        });
        // Sync parent phone and relationship back to the student record
        const studentSync: any = {};
        if (phone !== undefined) studentSync.parent_phone = phone;
        if (relationship !== undefined) studentSync.parent_relationship = relationship;
        if (parent_name !== undefined) studentSync.parent_name = parent_name;
        if (parent_email !== undefined) studentSync.parent_email = parent_email;
        if (Object.keys(studentSync).length > 0) {
          await supabase.from('students').update(studentSync).eq('id', student_id).eq('organisation_id', organisation_id);
        }
      }
    }

    res.json({ id, parent_user_id: parentProfile.user_id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// Delete parent
router.delete('/parents/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.query.organisation_id || req.body?.organisation_id || req.user?.organisationId || '';
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid parent id' });
  if (!orgId || !isValidUUID(orgId)) return res.status(400).json({ error: 'Invalid organisation_id' });

  try {
    const { data: parent } = await supabase.from('parents').select('id, user_id').eq('id', id).eq('organisation_id', orgId).maybeSingle();
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    if (parent.user_id) {
      await supabase.from('parent_student_links').delete().eq('parent_id', parent.user_id).eq('organisation_id', orgId);
      await supabase.from('users').delete().eq('id', parent.user_id).eq('organisation_id', orgId);
      await supabase.auth.admin.deleteUser(parent.user_id).catch(() => {});
    }

    await supabase.from('parents').delete().eq('id', id).eq('organisation_id', orgId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === EXAMS ===
router.post('/exams', asyncHandler(async (req, res) => {
  const { organisation_id, name, exam_type, start_date, end_date } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('exams')
      .insert({ organisation_id, name, exam_type, start_date, end_date, status: 'draft' })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);

    trackChange({ organisationId: organisation_id, tableName: 'exams', operation: 'INSERT', recordId: data?.id });
    notifyRole(organisation_id, 'student', 'New Exam Scheduled', `Exam "${name}" has been scheduled (${exam_type}).`, 'exam', data?.id);
    notifyRole(organisation_id, 'parent', 'New Exam Scheduled', `Exam "${name}" has been scheduled for your child.`, 'exam', data?.id);
    notifyRole(organisation_id, 'teacher', 'New Exam Scheduled', `Exam "${name}" has been scheduled. Please review duties.`, 'exam', data?.id);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/exams/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('start_date', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/exam-schedules', asyncHandler(async (req, res) => {
  const { organisation_id, exam_id, class_id, subject_id, date, start_time, end_time, room } = req.body;
  if (!organisation_id || !exam_id || !class_id || !date) {
    return res.status(400).json({ error: 'Missing exam schedule data' });
  }
  try {
    const { data, error } = await supabase
      .from('exam_schedules')
      .insert({ organisation_id, exam_id, class_id, subject_id, date, start_time, end_time, room })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);

    trackChange({ organisationId: organisation_id, tableName: 'exam_schedules', operation: 'INSERT', recordId: data?.id });
    notifyStudentsInClass(organisation_id, class_id, 'Exam Schedule Published', 'An exam schedule has been published for your class.', 'exam', exam_id);
    notifyParentsOfStudentsInClass(organisation_id, class_id, 'Exam Schedule Published', 'An exam schedule has been published for your child\'s class.', 'exam', exam_id);
    notifyStaffAssignedToClass(organisation_id, class_id, 'Exam Schedule Published', 'Exam schedule published for your assigned class.', 'exam', exam_id);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === FEES & STRUCTURES ===
router.get('/fee-structures/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('fee_structures')
      .select('*, items:fee_items(*)')
      .eq('organisation_id', organisation_id);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/fee-items/:fee_structure_id', asyncHandler(async (req, res) => {
  const { fee_structure_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('fee_items')
      .select('*')
      .eq('fee_structure_id', fee_structure_id);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/fee-items', asyncHandler(async (req, res) => {
  const { fee_structure_id, item_name, amount } = req.body;
  if (!fee_structure_id || !item_name || !amount) {
    return res.status(400).json({ error: 'Missing fee item data' });
  }
  try {
    const { data, error } = await supabase
      .from('fee_items')
      .insert({ fee_structure_id, item_name, amount })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/student-fees', asyncHandler(async (req, res) => {
  const { student_id, fee_structure_id, due_date, amount } = req.body;
  if (!student_id || !fee_structure_id || !due_date) {
    return res.status(400).json({ error: 'Missing student fee data' });
  }

  try {
    let totalAmount = amount;
    if (!totalAmount) {
      const { data: items, error: itemsError } = await supabase
        .from('fee_items')
        .select('amount')
        .eq('fee_structure_id', fee_structure_id);
      if (itemsError) throw itemsError;
      totalAmount = (items || []).reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0);
    }

    const { data, error } = await supabase
      .from('student_fees')
      .insert({ student_id, fee_structure_id, due_date, amount: totalAmount, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/student-fees/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('organisation_id', organisation_id);
    if (studentError) throw studentError;

    const studentIds = (students || []).map((student: any) => student.id);
    if (studentIds.length === 0) return res.json([]);

    const { data, error } = await supabase
      .from('student_fees')
      .select('*, student:students(full_name), structure:fee_structures(name)')
      .in('student_id', studentIds);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/ledger', asyncHandler(async (req, res) => {
  const { organisation_id, entry_type, category, amount, description, transaction_date } = req.body;
  if (!organisation_id || !entry_type || !category || !amount || !transaction_date) {
    return res.status(400).json({ error: 'Missing ledger entry data' });
  }
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .insert({ organisation_id, entry_type, category, amount, description, transaction_date })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/ledger/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/payroll', asyncHandler(async (req, res) => {
  const { organisation_id, staff_id, payroll_month, gross_amount, deductions, notes } = req.body;
  if (!organisation_id || !staff_id || !payroll_month || !gross_amount) {
    return res.status(400).json({ error: 'Missing payroll data' });
  }
  try {
    const net_amount = parseFloat(gross_amount) - parseFloat(deductions || 0);
    const { data, error } = await supabase
      .from('payroll_records')
      .insert({ organisation_id, staff_id, payroll_month, gross_amount, deductions: deductions || 0, net_amount, status: 'pending', notes })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/payroll/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/documents', asyncHandler(async (req, res) => {
  const { organisation_id, document_type, title, description, student_id, parent_id, staff_id, status } = req.body;
  if (!organisation_id || !document_type || !title) {
    return res.status(400).json({ error: 'Missing document metadata' });
  }
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({ organisation_id, document_type, title, description, student_id, parent_id, staff_id, status: status || 'active' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/documents/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/audit-logs', asyncHandler(async (req, res) => {
  const { organisation_id, user_id, action, details, severity } = req.body;
  if (!organisation_id || !action) {
    return res.status(400).json({ error: 'Missing audit log data' });
  }
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({ organisation_id, user_id, action, details, severity: severity || 'info' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/audit-logs/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === ANNOUNCEMENTS & EVENTS ===
router.get('/announcements/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('published_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/events/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('start_date', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === HELP DESK ===
router.post('/helpdesk-tickets', asyncHandler(async (req, res) => {
  const { organisation_id, created_by, subject, description, priority, assignee_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('helpdesk_tickets')
      .insert({ organisation_id, created_by, subject, description, priority, assignee_id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/helpdesk-tickets/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('helpdesk_tickets')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === TRANSPORT ===
router.get('/transport-routes/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('transport_routes')
      .select('*')
      .eq('organisation_id', organisation_id);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/transport-routes', asyncHandler(async (req, res) => {
  const { organisation_id, route_name, stops, start_point, end_point } = req.body;
  try {
    const { data, error } = await supabase
      .from('transport_routes')
      .insert({ organisation_id, route_name, stops, start_point, end_point })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/transport-vehicles/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('transport_vehicles')
      .select('*')
      .eq('organisation_id', organisation_id);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/transport-vehicles', asyncHandler(async (req, res) => {
  const { organisation_id, vehicle_number, route_id, driver_name, driver_phone, capacity } = req.body;
  try {
    const { data, error } = await supabase
      .from('transport_vehicles')
      .insert({ organisation_id, vehicle_number, route_id, driver_name, driver_phone, capacity })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/transport-assignments', asyncHandler(async (req, res) => {
  const { student_id, vehicle_id, route_id } = req.body;
  const orgId = (req as any).user?.organisationId;
  try {
    const { data: student } = await supabase
      .from('students')
      .select('organisation_id')
      .eq('id', student_id)
      .single();
    if (!student || student.organisation_id !== orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { data, error } = await supabase
      .from('transport_assignments')
      .insert({ student_id, vehicle_id, route_id, status: 'active' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/transport-assignments/:student_id', asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('transport_assignments')
      .select('*, vehicle:transport_vehicles(*), route:transport_routes(*)')
      .eq('student_id', student_id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === HOSTEL ===
router.get('/hostel-rooms/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('hostel_rooms')
      .select('*')
      .eq('organisation_id', organisation_id);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/hostel-rooms', asyncHandler(async (req, res) => {
  const { organisation_id, room_number, capacity, building } = req.body;
  try {
    const { data, error } = await supabase
      .from('hostel_rooms')
      .insert({ organisation_id, room_number, capacity, building })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/hostel-allocations', asyncHandler(async (req, res) => {
  const { student_id, room_id, check_in_date, check_out_date } = req.body;
  const orgId = (req as any).user?.organisationId;
  try {
    const { data: student } = await supabase
      .from('students')
      .select('organisation_id')
      .eq('id', student_id)
      .single();
    if (!student || student.organisation_id !== orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { data, error } = await supabase
      .from('hostel_allocations')
      .insert({ student_id, room_id, check_in_date, check_out_date, status: 'active' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/hostel-allocations/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('organisation_id', organisation_id);
    if (studentError) throw studentError;

    const studentIds = (students || []).map((student: any) => student.id);
    if (studentIds.length === 0) return res.json([]);

    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*, room:hostel_rooms(*)')
      .in('student_id', studentIds);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === LIBRARY ===
router.get('/library-books/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('library_books')
      .select('*')
      .eq('organisation_id', organisation_id);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/library-books', asyncHandler(async (req, res) => {
  const { organisation_id, title, author, isbn, copies_total, category } = req.body;
  try {
    const { data, error } = await supabase
      .from('library_books')
      .insert({ organisation_id, title, author, isbn, copies_total, copies_available: copies_total, category })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);

    trackChange({ organisationId: organisation_id, tableName: 'library_books', operation: 'INSERT', recordId: data?.id });
    notifyRole(organisation_id, 'student', 'New Book Available', `"${title}" by ${author} is now available in the library.`, 'library', data?.id);
    notifyRole(organisation_id, 'teacher', 'New Book Available', `"${title}" by ${author} is now available in the library.`, 'library', data?.id);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/library-issues', asyncHandler(async (req, res) => {
  const { student_id, book_id, issue_date, due_date, organisation_id } = req.body;
  try {
    const { data: book, error: bookError } = await supabase
      .from('library_books')
      .select('copies_available, title')
      .eq('id', book_id)
      .single();
    if (bookError) throw bookError;

    if (!book || book.copies_available <= 0) {
      return res.status(400).json({ error: 'No available copies for this book.' });
    }

    const { data, error } = await supabase
      .from('library_issues')
      .insert({ student_id, book_id, issue_date, due_date, status: 'issued' })
      .select()
      .single();
    if (error) throw error;

    const { error: updateError } = await supabase
      .from('library_books')
      .update({ copies_available: book.copies_available - 1 })
      .eq('id', book_id);
    if (updateError) throw updateError;

    res.status(201).json(data);

    if (organisation_id && student_id) {
      trackChange({ organisationId: organisation_id, tableName: 'library_issues', operation: 'INSERT' });
      notifyStudentParents(organisation_id, student_id, 'Book Issued', `Book "${book.title}" has been issued. Due: ${due_date}`, 'library', data?.id);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/library-issues/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('organisation_id', organisation_id);
    if (studentError) throw studentError;

    const studentIds = (students || []).map((student: any) => student.id);
    if (studentIds.length === 0) return res.json([]);

    const { data, error } = await supabase
      .from('library_issues')
      .select('*, student:students(*), book:library_books(*)')
      .in('student_id', studentIds);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === NOTIFICATIONS ===
router.post('/notifications', asyncHandler(async (req, res) => {
  const { organisation_id, title, message, target_role } = req.body;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ organisation_id, title, message, target_role, sent_at: new Date().toISOString(), delivered: false })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/notifications/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/scholarships', asyncHandler(async (req, res) => {
  const { organisation_id, student_id, name, amount, status, provider } = req.body;
  if (!organisation_id || !student_id || !name) {
    return res.status(400).json({ error: 'Required: organisation_id, student_id, name' });
  }
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .insert({ organisation_id, student_id, name, amount: amount || 0, status: status || 'active', provider: provider || null, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/scholarships/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data: students } = await supabase.from('students').select('id').eq('organisation_id', organisation_id);
    const studentIds = students?.map(s => s.id) || [];
    if (studentIds.length === 0) return res.json([]);
    const { data, error } = await supabase
      .from('scholarships')
      .select('*, student:students(full_name, roll_number)')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.patch('/scholarships/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  delete updates.id; delete updates.organisation_id;
  try {
    const { data, error } = await supabase.from('scholarships').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.delete('/scholarships/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/fee-report/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const [studentFeesRes, paymentsRes] = await Promise.all([
      supabase.from('student_fees').select('*, student:students(full_name, roll_number)').eq('organisation_id', organisation_id),
      supabase.from('fee_payments').select('*, student:students(full_name, roll_number)').eq('organisation_id', organisation_id).order('payment_date', { ascending: false }).limit(50)
    ]);

    const studentFees = studentFeesRes.data || [];
    const payments = paymentsRes.data || [];
    const totalCollected = payments.reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0);
    const totalPending = studentFees.filter((f: any) => f.status === 'pending').reduce((sum: number, f: any) => sum + Number(f.amount), 0);
    const totalOverdue = studentFees.filter((f: any) => f.status === 'overdue').reduce((sum: number, f: any) => sum + Number(f.amount), 0);
    const totalAll = studentFees.reduce((sum: number, f: any) => sum + Number(f.amount), 0);
    const collectionRate = totalAll > 0 ? Math.round((totalCollected / totalAll) * 100) : 0;
    const defaulters = studentFees.filter((f: any) =>
      f.status === 'overdue' || (f.status === 'pending' && new Date(f.due_date) < new Date())
    );

    res.json({ totalCollected, totalPending, totalOverdue, collectionRate, recentPayments: payments, defaulters });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// === ATTENDANCE MANAGEMENT ===

router.post('/attendance/bulk', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, class_id, date, records } = req.body;
  if (!organisation_id || !date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'organisation_id, date, and records array required' });
  }
  try {
    const { data: students } = await supabase.from('students').select('id, full_name, roll_number').eq('organisation_id', organisation_id);
    if (!students) return res.status(404).json({ error: 'No students found' });
    const studentIds = new Set(students.map(s => s.id));
    const validRecords = records.filter(r => studentIds.has(r.student_id) && ['present', 'absent', 'late', 'excused'].includes(r.status));
    if (validRecords.length === 0) return res.status(400).json({ error: 'No valid records provided' });
    const upsertData = validRecords.map(r => ({
      organisation_id, student_id: r.student_id, teacher_id: teacher_id || null,
      date, status: r.status, notes: r.notes || null
    }));
    const { data, error } = await supabase.from('attendance').upsert(upsertData, { onConflict: 'student_id,date' }).select();
    if (error) throw error;
    res.status(201).json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/attendance/class/:class_id/:date', asyncHandler(async (req, res) => {
  const { class_id, date } = req.params;
  try {
    const { data: classMap } = await supabase.from('class_student_map')
      .select('*, student:students(id, full_name, roll_number, section_id, sections:sections!students_section_id_fkey(name), status)')
      .eq('class_id', class_id);
    const students = (classMap || [])
      .filter((cm: any) => cm.student?.status === 'active')
      .map((cm: any) => cm.student);
    const studentIds = students.map((s: any) => s.id);
    const { data: attendance } = studentIds.length > 0
      ? await supabase.from('attendance').select('*').in('student_id', studentIds).eq('date', date)
      : { data: [] };
    res.json({ students: students || [], attendance: attendance || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/attendance/toggle', asyncHandler(async (req, res) => {
  const { organisation_id, student_id, teacher_id, date, status } = req.body;
  if (!organisation_id || !student_id || !date || !status) {
    return res.status(400).json({ error: 'organisation_id, student_id, date, status required' });
  }
  try {
    const { data, error } = await supabase.from('attendance').upsert(
      { organisation_id, student_id, teacher_id: teacher_id || null, date, status },
      { onConflict: 'student_id,date' }
    ).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/attendance/student/:student_id', asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  try {
    const { data, error } = await supabase.from('attendance').select('*').eq('student_id', student_id).order('date', { ascending: false });
    if (error) throw error;
    const records = data || [];
    const present = records.filter(r => r.status === 'present').length;
    const total = records.length;
    res.json({ records, present, total, percentage: total ? Math.round((present / total) * 100) : 0 });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/attendance/daily/:organisation_id/:date', asyncHandler(async (req, res) => {
  const { organisation_id, date } = req.params;
  try {
    const [studentsRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, section_id, sections:sections!students_section_id_fkey(name)').eq('organisation_id', organisation_id),
      supabase.from('attendance').select('*, student:students(full_name, roll_number)').eq('organisation_id', organisation_id).eq('date', date)
    ]);
    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];

    const studentIds = students.map((s: any) => s.id);
    const { data: classMappings } = studentIds.length > 0
      ? await supabase.from('class_student_map').select('student_id, class:classes!class_student_map_class_id_fkey(name)').in('student_id', studentIds)
      : { data: [] };
    const studentClassMap: Record<string, string> = {};
    (classMappings || []).forEach((cm: any) => {
      if (cm.class?.name) studentClassMap[cm.student_id] = cm.class.name;
    });

    const marked = attendance.length;
    const present = attendance.filter((a: any) => a.status === 'present').length;
    const absent = attendance.filter((a: any) => a.status === 'absent').length;
    const late = attendance.filter((a: any) => a.status === 'late').length;
    const byClass: Record<string, { total: number; present: number; absent: number; late: number; marked: number }> = {};
    students.forEach(s => {
      const cls = studentClassMap[s.id] || 'Unknown';
      if (!byClass[cls]) byClass[cls] = { total: 0, present: 0, absent: 0, late: 0, marked: 0 };
      byClass[cls].total++;
    });
    attendance.forEach((a: any) => {
      const cls = studentClassMap[a.student_id] || 'Unknown';
      if (!byClass[cls]) byClass[cls] = { total: 0, present: 0, absent: 0, late: 0, marked: 0 };
      byClass[cls].marked++;
      if (a.status === 'present') byClass[cls].present++;
      else if (a.status === 'absent') byClass[cls].absent++;
      else if (a.status === 'late') byClass[cls].late++;
    });
    res.json({ date, totalStudents: students.length, marked, present, absent, late, byClass });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/attendance-report/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const [studentsRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, section_id, sections:sections!students_section_id_fkey(name)').eq('organisation_id', organisation_id),
      supabase.from('attendance').select('*, student:students(full_name, roll_number)').eq('organisation_id', organisation_id).order('date', { ascending: false }).limit(5000)
    ]);

    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];

    const studentIds = students.map((s: any) => s.id);
    const { data: classMappings } = studentIds.length > 0
      ? await supabase.from('class_student_map').select('student_id, class:classes!class_student_map_class_id_fkey(name)').in('student_id', studentIds)
      : { data: [] };
    const studentClassMap: Record<string, string> = {};
    (classMappings || []).forEach((cm: any) => {
      if (cm.class?.name) studentClassMap[cm.student_id] = cm.class.name;
    });

    const totalStudents = students.length;
    const totalRecords = attendance.length;
    const presentCount = attendance.filter((a: any) => a.status === 'present').length;
    const absentCount = attendance.filter((a: any) => a.status === 'absent').length;
    const lateCount = attendance.filter((a: any) => a.status === 'late').length;
    const excusedCount = attendance.filter((a: any) => a.status === 'excused').length;
    const overallPercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    const attendanceByClass: Record<string, { present: number; total: number }> = {};
    attendance.forEach((a: any) => {
      const cls = studentClassMap[a.student_id] || 'Unknown';
      if (!attendanceByClass[cls]) attendanceByClass[cls] = { present: 0, total: 0 };
      attendanceByClass[cls].total++;
      if (a.status === 'present') attendanceByClass[cls].present++;
    });

    const dailyAttendance: Record<string, { present: number; absent: number; late: number }> = {};
    attendance.forEach((a: any) => {
      const day = a.date || 'Unknown';
      if (!dailyAttendance[day]) dailyAttendance[day] = { present: 0, absent: 0, late: 0 };
      if (a.status === 'present') dailyAttendance[day].present++;
      else if (a.status === 'absent') dailyAttendance[day].absent++;
      else if (a.status === 'late') dailyAttendance[day].late++;
    });

    res.json({
      totalStudents,
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      overallPercentage,
      attendanceByClass,
      dailyAttendance
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/academic-report/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const [studentsRes, gradesRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number').eq('organisation_id', organisation_id),
      supabase.from('grades').select('*, student:students(full_name, roll_number)').eq('organisation_id', organisation_id).order('created_at', { ascending: false }).limit(5000)
    ]);

    const students = studentsRes.data || [];
    const grades = gradesRes.data || [];

    const studentIds = students.map((s: any) => s.id);
    const { data: classMappings } = studentIds.length > 0
      ? await supabase.from('class_student_map').select('student_id, class:classes!class_student_map_class_id_fkey(name)').in('student_id', studentIds)
      : { data: [] };
    const studentClassMap: Record<string, string> = {};
    (classMappings || []).forEach((cm: any) => {
      if (cm.class?.name) studentClassMap[cm.student_id] = cm.class.name;
    });

    const totalStudents = students.length;
    const gradedStudents = new Set(grades.map((g: any) => g.student_id)).size;

    const gradeDistribution: Record<string, number> = {};
    grades.forEach((g: any) => {
      const grade = g.grade?.toUpperCase() || 'N/A';
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    const performanceByClass: Record<string, { total: number; avgGrade: string }> = {};
    const classGrades: Record<string, number[]> = {};
    grades.forEach((g: any) => {
      const cls = studentClassMap[g.student_id] || 'Unknown';
      if (!classGrades[cls]) classGrades[cls] = [];
      const numeric = parseFloat(g.grade);
      if (!isNaN(numeric)) classGrades[cls].push(numeric);
    });
    for (const [cls, vals] of Object.entries(classGrades)) {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      performanceByClass[cls] = { total: vals.length, avgGrade: avg.toFixed(1) };
    }

    res.json({
      totalStudents,
      gradedStudents,
      gradeDistribution,
      performanceByClass,
      recentGrades: grades.slice(0, 100)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// ==================== PART-TIME JOBS (Management CRUD) ====================
router.get('/part-time-jobs/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  const { status, type } = req.query;
  try {
    let query = supabase.from('part_time_jobs').select('*').eq('organisation_id', organisation_id);
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.post('/part-time-jobs', asyncHandler(async (req, res) => {
  const { organisation_id, title, description, type, area, pay_type, pay_amount, duration, slots, skills, contact_info, target_role } = req.body;
  if (!organisation_id || !title) return res.status(400).json({ error: 'Required: organisation_id, title' });
  try {
    const payload: any = {
      organisation_id, title, description, type: type || 'local', area: area || '',
      pay_type: pay_type || 'fixed', pay_amount: Number(pay_amount) || 0,
      duration: duration || '', slots: Number(slots) || 1,
      skills: skills || '', contact_info: contact_info || '', status: 'active'
    };
    if (target_role) payload.target_role = target_role;
    const { data, error } = await supabase.from('part_time_jobs').insert(payload).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.patch('/part-time-jobs/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const orgId = (req as any).user?.organisationId;
  delete updates.id;
  delete updates.organisation_id;
  try {
    const { data: existing } = await supabase
      .from('part_time_jobs')
      .select('organisation_id')
      .eq('id', id)
      .single();
    if (!existing || existing.organisation_id !== orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { data, error } = await supabase.from('part_time_jobs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.delete('/part-time-jobs/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = (req as any).user?.organisationId;
  try {
    const { data: existing } = await supabase
      .from('part_time_jobs')
      .select('organisation_id')
      .eq('id', id)
      .single();
    if (!existing || existing.organisation_id !== orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { error } = await supabase.from('part_time_jobs').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.get('/part-time-jobs/:id/applications', asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('part_time_job_applications').select('*').eq('job_id', id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.patch('/part-time-job-applications/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Required: status' });
  try {
    const { data, error } = await supabase.from('part_time_job_applications').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// ==================== MODULE CONFIGURATION ====================
router.get('/module-config/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('module_configuration')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('module_name');
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

router.put('/module-config/:organisation_id/:module_key', asyncHandler(async (req, res) => {
  const { organisation_id, module_key } = req.params;
  const { enabled, settings } = req.body;
  try {
    const updates: any = { updated_at: new Date().toISOString() };
    if (enabled !== undefined) updates.enabled = enabled;
    if (settings !== undefined) updates.settings = JSON.stringify(settings);
    const { data, error } = await supabase
      .from('module_configuration')
      .update(updates)
      .eq('organisation_id', organisation_id)
      .eq('module_key', module_key)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// ==================== FEATURE MODULE ROUTES ====================

// === HEALTH ===
router.get('/health/records/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data: students } = await supabase.from('students').select('id').eq('organisation_id', organisation_id);
    const ids = students?.map(s => s.id) || [];
    if (ids.length === 0) return res.json([]);
    const { data, error } = await supabase.from('health_records').select('*, student:students(full_name, roll_number)').in('student_id', ids);
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/health/records', asyncHandler(async (req, res) => {
  const { organisation_id, student_id, record_type, description, recorded_by, severity } = req.body;
  try {
    const { data, error } = await supabase.from('health_records').insert({ organisation_id, student_id, record_type, description, recorded_by, severity }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.put('/health/records/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  delete updates.id; delete updates.organisation_id; delete updates.student;
  try {
    const { data, error } = await supabase.from('health_records').update(updates).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/health/checkups/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data: students } = await supabase.from('students').select('id').eq('organisation_id', organisation_id);
    const ids = students?.map(s => s.id) || [];
    if (ids.length === 0) return res.json([]);
    const { data, error } = await supabase.from('health_checkups').select('*, student:students(full_name, roll_number)').in('student_id', ids);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/health/medications/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data: students } = await supabase.from('students').select('id').eq('organisation_id', organisation_id);
    const ids = students?.map(s => s.id) || [];
    if (ids.length === 0) return res.json([]);
    const { data, error } = await supabase.from('health_medications').select('*, student:students(full_name, roll_number)').in('student_id', ids);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === INVENTORY ===
router.get('/inventory/assets/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('inventory_assets').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/inventory/assets', asyncHandler(async (req, res) => {
  const { organisation_id, name, category, quantity, condition, location } = req.body;
  try {
    const { data, error } = await supabase.from('inventory_assets').insert({ organisation_id, name, category, quantity, condition, location, status: 'available' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/inventory/stock/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('inventory_stock').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/inventory/stock', asyncHandler(async (req, res) => {
  const { organisation_id, item_name, quantity, unit, reorder_level } = req.body;
  try {
    const { data, error } = await supabase.from('inventory_stock').insert({ organisation_id, item_name, quantity, unit, reorder_level }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/inventory/purchase-orders/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('inventory_purchase_orders').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/inventory/purchase-orders', asyncHandler(async (req, res) => {
  const { organisation_id, supplier, item, quantity, amount, order_date } = req.body;
  try {
    const { data, error } = await supabase.from('inventory_purchase_orders').insert({ organisation_id, supplier, item, quantity, amount, order_date, status: 'pending' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/inventory/maintenance/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('inventory_maintenance').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/inventory/maintenance', asyncHandler(async (req, res) => {
  const { organisation_id, asset_id, description, maintenance_date, cost, performed_by } = req.body;
  try {
    const { data, error } = await supabase.from('inventory_maintenance').insert({ organisation_id, asset_id, description, maintenance_date, cost, performed_by }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === ALUMNI ===
router.get('/alumni/alumni/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('alumni').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/alumni/alumni', asyncHandler(async (req, res) => {
  const { organisation_id, full_name, email, phone, graduation_year, current_occupation, company, address } = req.body;
  try {
    const { data, error } = await supabase.from('alumni').insert({ organisation_id, full_name, email, phone, graduation_year, current_occupation, company, address, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.put('/alumni/alumni/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  delete updates.id; delete updates.organisation_id; delete updates.created_at;
  try {
    const { data, error } = await supabase.from('alumni').update(updates).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/alumni/events/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('alumni_events').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/alumni/events', asyncHandler(async (req, res) => {
  const { organisation_id, title, description, event_date, location } = req.body;
  try {
    const { data, error } = await supabase.from('alumni_events').insert({ organisation_id, title, description, event_date, location, status: 'upcoming' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/alumni/donations/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('alumni_donations').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/alumni/donations', asyncHandler(async (req, res) => {
  const { organisation_id, alumni_id, amount, purpose, donation_date } = req.body;
  try {
    const { data, error } = await supabase.from('alumni_donations').insert({ organisation_id, alumni_id, amount, purpose, donation_date }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/alumni/mentors/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('alumni_mentors').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/alumni/mentors', asyncHandler(async (req, res) => {
  const { organisation_id, alumni_id, expertise, availability } = req.body;
  try {
    const { data, error } = await supabase.from('alumni_mentors').insert({ organisation_id, alumni_id, expertise, availability, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === EXTRACURRICULAR ===
router.get('/extracurricular/clubs/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('clubs').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/extracurricular/clubs', asyncHandler(async (req, res) => {
  const { organisation_id, name, description, coordinator, max_members } = req.body;
  try {
    const { data, error } = await supabase.from('clubs').insert({ organisation_id, name, description, coordinator, max_members, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/extracurricular/sports-teams/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('sports_teams').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/extracurricular/sports-teams', asyncHandler(async (req, res) => {
  const { organisation_id, name, sport_type, coach, max_players } = req.body;
  try {
    const { data, error } = await supabase.from('sports_teams').insert({ organisation_id, name, sport_type, coach, max_players, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/extracurricular/events/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('extracurricular_events').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/extracurricular/events', asyncHandler(async (req, res) => {
  const { organisation_id, name, event_type, start_date, end_date, location, coordinator } = req.body;
  try {
    const { data, error } = await supabase.from('extracurricular_events').insert({ organisation_id, name, event_type, start_date, end_date, location, coordinator, status: 'upcoming' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === CAREER ===
router.get('/career/psychometric-tests/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('career_psychometric_tests').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/career/internships/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('career_internships').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/career/internships', asyncHandler(async (req, res) => {
  const { organisation_id, company, role, description, duration, stipend, application_deadline } = req.body;
  try {
    const { data, error } = await supabase.from('career_internships').insert({ organisation_id, company, role, description, duration, stipend, application_deadline, status: 'open' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/career/college-applications/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('career_college_applications').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/career/skill-assessments/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('career_skill_assessments').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === STORE ===
router.get('/store/products/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('store_products').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/store/products', asyncHandler(async (req, res) => {
  const { organisation_id, name, description, price, stock, category } = req.body;
  try {
    const { data, error } = await supabase.from('store_products').insert({ organisation_id, name, description, price, stock, category, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/store/orders/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('store_orders').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/store/orders', asyncHandler(async (req, res) => {
  const { organisation_id, product_id, quantity, buyer_name, buyer_email, total_amount } = req.body;
  try {
    const { data, error } = await supabase.from('store_orders').insert({ organisation_id, product_id, quantity, buyer_name, buyer_email, total_amount, status: 'pending' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/store/menu/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('store_menu').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/store/fundraising/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('store_fundraising').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === COLLABORATION ===
router.get('/collaboration/classrooms/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('collaboration_classrooms').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/collaboration/classrooms', asyncHandler(async (req, res) => {
  const { organisation_id, name, description, created_by } = req.body;
  try {
    const { data, error } = await supabase.from('collaboration_classrooms').insert({ organisation_id, name, description, created_by, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/collaboration/projects/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('collaboration_projects').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/collaboration/projects', asyncHandler(async (req, res) => {
  const { organisation_id, title, description, lead_id, due_date } = req.body;
  try {
    const { data, error } = await supabase.from('collaboration_projects').insert({ organisation_id, title, description, lead_id, due_date, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === ADMISSION ===
const isMissingAdmissionTable = (error: any) =>
  error?.code === '42P01' ||
  error?.code === 'PGRST205' ||
  String(error?.message || '').includes('admission_applications') ||
  String(error?.message || '').includes('admission_enquiries');

const admissionMigrationMessage =
  'Admission database tables are missing. Run supabase/migrations/20260729000000_admission_module.sql in Supabase SQL Editor.';

router.get('/admission/applications/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
const { data, error } = await supabase
      .from('admission_applications')
      .select('*, academic_year_info:academic_years(name)')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error; res.json(data || []);
  } catch (error: any) {
    res.status(isMissingAdmissionTable(error) ? 503 : 500).json({ error: isMissingAdmissionTable(error) ? admissionMigrationMessage : error.message });
  }
}));

router.post('/admission/applications', asyncHandler(async (req, res) => {
const { organisation_id, applicant_name, applicant_email, phone, applying_class, parent_name, parent_phone, academic_year_id, academic_year } = req.body;
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!applicant_name) return res.status(400).json({ error: 'applicant_name required' });
  if (!applying_class) return res.status(400).json({ error: 'applying_class required' });
  try {
    const yearId = academic_year_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(academic_year_id) ? academic_year_id : null;
    const { data, error } = await supabase.from('admission_applications').insert({ organisation_id, applicant_name, applicant_email, phone, applying_class, parent_name, parent_phone, academic_year_id: yearId, academic_year: academic_year || null, status: 'pending' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) {
    res.status(isMissingAdmissionTable(error) ? 503 : 500).json({ error: isMissingAdmissionTable(error) ? admissionMigrationMessage : error.message });
  }
}));

router.put('/admission/applications/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected', 'waitlisted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid admission status' });
  }
  try {
    // Load the full application so the academic year is preserved on approval
    const { data: existing, error: loadErr } = await supabase.from('admission_applications').select('*').eq('id', id).single();
    if (loadErr) throw loadErr;

    // Default year to the active academic year if the application has none
    let academicYearId = existing?.academic_year_id || null;
    let academicYearLabel = existing?.academic_year || null;
    if (!academicYearId) {
      const { data: currentYear } = await supabase.from('academic_years').select('id, name').eq('organisation_id', req.user?.organisationId || existing?.organisation_id || '').eq('is_current', true).single();
      academicYearId = currentYear?.id || null;
      academicYearLabel = academicYearLabel || currentYear?.name || null;
    }

    const { data, error } = await supabase.from('admission_applications')
      .update({ status, academic_year_id: academicYearId, academic_year: academicYearLabel })
      .eq('id', id).select().single();
    if (error) throw error;

    // Mirror approved applications into the newer `admissions` table (idempotent).
    if (status === 'approved' && existing?.organisation_id) {
      const admissionPayload = {
        application_id: existing.id,
        organisation_id: existing.organisation_id,
        student_id: existing.student_id || null,
        full_name: existing.applicant_name || 'Unknown',
        email: existing.applicant_email,
        phone: existing.phone,
        class_applying: existing.applying_class,
        academic_year: academicYearLabel,
        status: 'approved',
        document_url: existing.document_url || null
      };
      const { data: already } = await supabase.from('admissions').select('id').eq('application_id', existing.id).maybeSingle();
      const { error: mirrorErr } = already
        ? await supabase.from('admissions').update(admissionPayload).eq('id', already.id)
        : await supabase.from('admissions').insert(admissionPayload);
      if (mirrorErr) throw mirrorErr;
    } else if (existing?.organisation_id) {
      // Rejecting or waitlisting removes any mirrored admissions record.
      const { error: mirrorErr } = await supabase.from('admissions').delete().eq('application_id', existing.id);
      if (mirrorErr) throw mirrorErr;
    }

    res.json(data);
  } catch (error: any) {
    res.status(isMissingAdmissionTable(error) ? 503 : 500).json({ error: isMissingAdmissionTable(error) ? admissionMigrationMessage : error.message });
  }
}));

router.get('/admission/enquiries/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('admission_enquiries')
      .select('*')
      .eq('organisation_id', organisation_id)
      .order('created_at', { ascending: false });
    if (error) throw error; res.json(data || []);
  } catch (error: any) {
    res.status(isMissingAdmissionTable(error) ? 503 : 500).json({ error: isMissingAdmissionTable(error) ? admissionMigrationMessage : error.message });
  }
}));

router.post('/admission/enquiries', asyncHandler(async (req, res) => {
  const { organisation_id, name, email, phone, message } = req.body;
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!name) return res.status(400).json({ error: 'name required' });
  if (!phone) return res.status(400).json({ error: 'phone required' });
  try {
    const { data, error } = await supabase.from('admission_enquiries').insert({ organisation_id, name, email, phone, message }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) {
    res.status(isMissingAdmissionTable(error) ? 503 : 500).json({ error: isMissingAdmissionTable(error) ? admissionMigrationMessage : error.message });
  }
}));

router.get('/admission/reports/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const [appsRes, enqRes] = await Promise.all([
      supabase.from('admission_applications').select('*').eq('organisation_id', organisation_id),
      supabase.from('admission_enquiries').select('*').eq('organisation_id', organisation_id),
    ]);
    const applications = appsRes.data || [];
    const enquiries = enqRes.data || [];
    res.json({
      totalApplications: applications.length,
      pending: applications.filter((a: any) => a.status === 'pending').length,
      approved: applications.filter((a: any) => a.status === 'approved').length,
      rejected: applications.filter((a: any) => a.status === 'rejected').length,
      waitlisted: applications.filter((a: any) => a.status === 'waitlisted').length,
      totalEnquiries: enquiries.length,
    });
  } catch (error: any) {
    res.status(isMissingAdmissionTable(error) ? 503 : 500).json({ error: isMissingAdmissionTable(error) ? admissionMigrationMessage : error.message });
  }
}));

// === STAFF MANAGEMENT ===
router.get('/staff-management/payroll/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('payroll_records').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/staff-management/payroll', asyncHandler(async (req, res) => {
  const { organisation_id, staff_id, month, year, basic_salary, net_salary, status } = req.body;
  try {
    const { data, error } = await supabase.from('payroll_records').insert({
      organisation_id, staff_id, month, year,
      basic_salary: basic_salary ?? null,
      net_salary: net_salary ?? null,
      status: status || 'pending',
      created_at: new Date().toISOString()
    }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/staff-management/job-postings/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('staff_job_postings').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/staff-management/job-postings', asyncHandler(async (req, res) => {
  const { organisation_id, title, department, description, requirements, salary_range } = req.body;
  try {
    const { data, error } = await supabase.from('staff_job_postings').insert({ organisation_id, title, department, description, requirements, salary_range, status: 'open' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/staff-management/performance-reviews/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('staff_performance_reviews').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/staff-management/performance-reviews', asyncHandler(async (req, res) => {
  const { organisation_id, staff_id, reviewer_id, rating, comments, review_date } = req.body;
  try {
    const { data, error } = await supabase.from('staff_performance_reviews').insert({ organisation_id, staff_id, reviewer_id, rating, comments, review_date }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/staff-management/training/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('staff_training').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/staff-management/training', asyncHandler(async (req, res) => {
  const { organisation_id, title, description, trainer, start_date, end_date } = req.body;
  try {
    const { data, error } = await supabase.from('staff_training').insert({ organisation_id, title, description, trainer, start_date, end_date, status: 'scheduled' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === PARENT-STUDENT LINKS ===
async function listParentLinks(req: any, res: any, orgId: string) {
  if (!isValidUUID(orgId)) {
    return res.status(400).json({ error: 'Invalid organisation_id' });
  }
  const { data: parentRows, error: pErr } = await supabase
    .from('parents')
    .select('*')
    .eq('organisation_id', orgId)
    .order('created_at', { ascending: false });
  if (pErr) return res.status(500).json({ error: pErr.message });

  const userIds = [...new Set((parentRows || []).map(p => p.user_id).filter(Boolean))];
  let usersById: any[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase.from('users').select('id, full_name, email, role, status').in('id', userIds);
    usersById = data || [];
  }
  const userMap = Object.fromEntries(usersById.map(u => [u.id, u]));

  const emails = [...new Set((parentRows || []).map(p => p.email).filter(Boolean))];
  let usersByEmail: any[] = [];
  if (emails.length > 0) {
    const { data } = await supabase.from('users').select('id, full_name, email, role, status').in('email', emails);
    usersByEmail = data || [];
  }
  const emailMap = Object.fromEntries(usersByEmail.map(u => [u.email, u]));

  let links: any[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase.from('parent_student_links').select('*').in('parent_id', userIds);
    links = data || [];
  }
  const linkMap = Object.fromEntries(links.map(l => [l.parent_id, l]));

  const linkedStudentIds = [...new Set(links.map(l => l.student_id).filter(Boolean))];
  let students: any[] = [];
  if (linkedStudentIds.length > 0) {
    const { data } = await supabase
      .from('students')
      .select('id, full_name, roll_number, class_id, section_id, class_info:classes!students_class_id_fkey(name), section_info:sections!students_section_id_fkey(name)')
      .in('id', linkedStudentIds);
    students = data || [];
  }
  const studentMap = Object.fromEntries(students.map(s => [s.id, s]));

  const result = (parentRows || []).map(p => {
    const link = linkMap[p.user_id];
    const user = userMap[p.user_id] || emailMap[p.email] || null;
    const email = user?.email || p.email;
    return {
      id: p.id,
      parent_id: p.user_id,
      parent: {
        ...(user || {}),
        full_name: user?.full_name || p.full_name,
        email,
        phone: p.phone || user?.phone || '',
      },
      parent_name: user?.full_name || p.full_name,
      parent_email: email,
      parent_phone: p.phone || user?.phone || '',
      generated_password: p.generated_password || null,
      student: link ? (studentMap[link.student_id] || null) : null,
      student_id: link?.student_id || null,
      relationship: link?.relationship || '',
      status: p.status || 'active',
    };
  });
  res.json(result);
}

router.get('/parent-student-links', asyncHandler(async (req, res) => {
  await listParentLinks(req, res, req.user?.organisationId || '');
}));
router.get('/parent-student-links/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  if (!isValidUUID(organisation_id)) {
    if (req.user?.organisationId) return await listParentLinks(req, res, req.user.organisationId);
    return res.status(400).json({ error: 'Invalid organisation_id' });
  }
  await listParentLinks(req, res, organisation_id);
}));

// === DIGITAL CREDENTIALS ===
router.get('/digital-credentials/certificates/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('digital_certificates').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/digital-credentials/certificates', asyncHandler(async (req, res) => {
  const { organisation_id, student_id, certificate_type, title, issued_date, expiry_date } = req.body;
  try {
    const { data, error } = await supabase.from('digital_certificates').insert({ organisation_id, student_id, certificate_type, title, issued_date, expiry_date, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/digital-credentials/credentials/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('digital_credentials').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/digital-credentials/credentials', asyncHandler(async (req, res) => {
  const { organisation_id, user_id, credential_type, title, issued_date } = req.body;
  try {
    const { data, error } = await supabase.from('digital_credentials').insert({ organisation_id, user_id, credential_type, title, issued_date, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/digital-credentials/badges/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('digital_badges').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/digital-credentials/badges', asyncHandler(async (req, res) => {
  const { organisation_id, student_id, badge_name, badge_type, awarded_date } = req.body;
  try {
    const { data, error } = await supabase.from('digital_badges').insert({ organisation_id, student_id, badge_name, badge_type, awarded_date, status: 'active' }).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === CREDENTIALS ===
router.get('/credentials/history/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('credential_history').select('*').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/credentials/users/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const { data, error } = await supabase.from('users').select('id, full_name, email, role, status').eq('organisation_id', organisation_id);
    if (error) throw error; res.json(data || []);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.put('/credentials/user/:userId/status', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  if (!status || !['active', 'inactive', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const { data, error } = await supabase.from('users').update({ status }).eq('id', userId).select('id, full_name, email, role, status').single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/credentials/list/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  try {
    const [usersRes, historyRes] = await Promise.all([
      supabase.from('users').select('id, full_name, email, role, status, created_at').eq('organisation_id', organisation_id).order('created_at', { ascending: false }),
      supabase.from('credential_history').select('*').eq('organisation_id', organisation_id),
    ]);
    if (usersRes.error) throw usersRes.error;
    const history = historyRes.data || [];
    const sentEmails = new Set(history.filter(h => h.action === 'email_sent' || h.action === 'created').map(h => h.email));
    const result = (usersRes.data || []).map(u => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      status: u.status,
      created_at: u.created_at,
      credentials_sent: sentEmails.has(u.email),
      last_credential_event: history.filter(h => h.email === u.email).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0] || null,
    }));
    res.json(result);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/credentials/regenerate-password', asyncHandler(async (req, res) => {
  const { organisation_id, user_id } = req.body;
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (!isValidUUID(user_id)) return res.status(400).json({ error: 'Invalid user_id' });
  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', user_id).eq('organisation_id', organisation_id).single();
  if (userError || !user) return res.status(404).json({ error: 'User not found' });
  const newPassword = crypto.randomUUID().slice(0, 12) + '!A1';
  const password_hash = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase.from('users').update({ password_hash }).eq('id', user_id);
  if (updateError) return res.status(500).json({ error: updateError.message });
  const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user_id, { password: newPassword });
  if (authUpdateError) {
    await supabase.from('users').update({ password_hash: user.password_hash }).eq('id', user_id);
    return res.status(500).json({ error: `Auth update failed: ${authUpdateError.message}. Database rolled back.` });
  }
  getOrgName(organisation_id).then(n => logCredential(organisation_id, n, user.full_name, user.email, user.role, 'Password Regenerated', newPassword));
  res.json({ email: user.email, password: newPassword });
}));

router.post('/credentials/bulk-email', asyncHandler(async (req, res) => {
  const { organisation_id, user_ids } = req.body;
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (!Array.isArray(user_ids) || user_ids.length === 0) return res.status(400).json({ error: 'user_ids array required' });
  try {
    const { data: users, error: usersError } = await supabase.from('users').select('id, full_name, email, role').in('id', user_ids).eq('organisation_id', organisation_id);
    if (usersError) throw usersError;
    if (!users || users.length === 0) return res.status(404).json({ error: 'No users found' });
    const orgName = await getOrgName(organisation_id);
    for (const u of users) {
      await logCredential(organisation_id, orgName, u.full_name, u.email, u.role, 'Bulk Email');
    }
    res.json({ success: true, emailed_count: users.length, emails: users.map(u => u.email) });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/credentials/bulk-regenerate', asyncHandler(async (req, res) => {
  const { organisation_id, user_ids } = req.body;
  if (!isValidUUID(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  if (!Array.isArray(user_ids) || user_ids.length === 0) return res.status(400).json({ error: 'user_ids array required' });
  const { data: users, error: usersError } = await supabase.from('users').select('id, full_name, email, role, password_hash').in('id', user_ids).eq('organisation_id', organisation_id);
  if (usersError) return res.status(500).json({ error: usersError.message });
  if (!users || users.length === 0) return res.status(404).json({ error: 'No users found' });
  const results: any[] = [];
  const orgName = await getOrgName(organisation_id);
  for (const u of users) {
    const newPassword = crypto.randomUUID().slice(0, 12) + '!A1';
    const password_hash = await bcrypt.hash(newPassword, 10);
    const oldHash = u.password_hash;
    const { error: updateError } = await supabase.from('users').update({ password_hash }).eq('id', u.id);
    if (updateError) { results.push({ email: u.email, status: 'failed', error: updateError.message }); continue; }
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(u.id, { password: newPassword });
    if (authUpdateError) {
      await supabase.from('users').update({ password_hash: oldHash }).eq('id', u.id);
      results.push({ email: u.email, status: 'failed', error: `Auth update failed: ${authUpdateError.message}. Rolled back.` });
      continue;
    }
    logCredential(organisation_id, orgName, u.full_name, u.email, u.role, 'Bulk Password Regenerate', newPassword);
    results.push({ email: u.email, password: newPassword, status: 'success' });
  }
  res.json({ results });
}));

router.post('/credentials/create-student', asyncHandler(async (req, res) => {
  const { organisation_id, full_name, email, password, roll_number, student_class } = req.body;
  if (!organisation_id || !full_name || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    const pwdHash = await bcrypt.hash(password, 10);
    const { data: user, error: userError } = await supabase.from('users').insert({ organisation_id, full_name, email, password_hash: pwdHash, role: 'student', status: 'active' }).select().single();
    if (userError) throw userError;
    try {
      await createAuthUser(email, password, full_name, 'student', organisation_id);
    } catch (authError: any) {
      await supabase.from('users').delete().eq('id', user.id);
      throw authError;
    }
    let resolvedClassId: string | null = null;
    if (student_class) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(student_class);
      if (isUuid) {
        resolvedClassId = student_class;
      } else {
        const { data: cls } = await supabase.from('classes').select('id').eq('name', student_class).eq('organisation_id', organisation_id).maybeSingle();
        resolvedClassId = cls?.id || null;
      }
    }
    const { data: student } = await supabase.from('students').insert({
      organisation_id, user_id: user.id, full_name, roll_number, email, class_id: resolvedClassId, status: 'active'
    }).select().single();
    if (resolvedClassId && student) {
      await supabase.from('class_student_map').upsert({ class_id: resolvedClassId, student_id: student.id, organisation_id }, { onConflict: 'class_id,student_id' });
    }
    getOrgName(organisation_id).then(n => logCredential(organisation_id, n, full_name, email, 'student', 'Management Credentials', password));
    res.status(201).json({ user, credentials: { email, password } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/credentials/create-staff', asyncHandler(async (req, res) => {
  const { organisation_id, full_name, email, password, role } = req.body;
  if (!organisation_id || !full_name || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    const staffRole = role || 'staff';
    const pwdHash = await bcrypt.hash(password, 10);
    const { data: user, error: userError } = await supabase.from('users').insert({ organisation_id, full_name, email, password_hash: pwdHash, role: staffRole, status: 'active' }).select().single();
    if (userError) throw userError;
    try {
      await createAuthUser(email, password, full_name, staffRole, organisation_id);
    } catch (authError: any) {
      await supabase.from('users').delete().eq('id', user.id);
      throw authError;
    }
    await supabase.from('staff_records').insert({ organisation_id, user_id: user.id, staff_unique_id: `STAFF-${Date.now()}`, full_name, status: 'active' });
    getOrgName(organisation_id).then(n => logCredential(organisation_id, n, full_name, email, staffRole, 'Management Credentials', password));
    res.status(201).json({ user, credentials: { email, password } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.post('/credentials/create-parent', asyncHandler(async (req, res) => {
  const { organisation_id, full_name, email, password, student_id, relationship } = req.body;
  if (!organisation_id || !full_name || !email) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    const loginPassword = password || generateAlphaDigitPassword();
    const pwdHash = await bcrypt.hash(loginPassword, 10);
    const { data: user, error: userError } = await supabase.from('users').insert({ organisation_id, full_name, email, password_hash: pwdHash, role: 'parent', status: 'active' }).select().single();
    if (userError) throw userError;
    try {
      await createAuthUser(email, loginPassword, full_name, 'parent', organisation_id);
    } catch (authError: any) {
      await supabase.from('users').delete().eq('id', user.id);
      throw authError;
    }
    if (student_id) await supabase.from('parent_student_links').insert({ parent_id: user.id, student_id, relationship: relationship || 'guardian' });
    getOrgName(organisation_id).then(n => logCredential(organisation_id, n, full_name, email, 'parent', 'Management Credentials', loginPassword));
    sendCredentialEmail(email, full_name, loginPassword, 'Parent Portal');
    res.status(201).json({ user, credentials: { email, password: loginPassword } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

// === AI INSIGHTS ===
router.get('/ai-insights/predictions/:organisation_id', asyncHandler(async (req, res) => {
  const { organisation_id } = req.params;
  try {
    const [studentsRes, attendanceRes, gradesRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number').eq('organisation_id', organisation_id),
      supabase.from('attendance_records').select('student_id, status').eq('organisation_id', organisation_id),
      supabase.from('grades').select('student_id, grade').eq('organisation_id', organisation_id),
    ]);
    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];
    const grades = gradesRes.data || [];

    const studentIds = students.map((s: any) => s.id);
    const { data: classMappings } = studentIds.length > 0
      ? await supabase.from('class_student_map').select('student_id, class:classes!class_student_map_class_id_fkey(name)').in('student_id', studentIds)
      : { data: [] };
    const studentClassMap: Record<string, string> = {};
    (classMappings || []).forEach((cm: any) => {
      if (cm.class?.name) studentClassMap[cm.student_id] = cm.class.name;
    });

    const predictions = students.map((student: any) => {
      const studentAttendance = attendance.filter((a: any) => a.student_id === student.id);
      const presentCount = studentAttendance.filter((a: any) => a.status === 'present').length;
      const attendancePct = studentAttendance.length > 0 ? (presentCount / studentAttendance.length) * 100 : 0;
      const studentGrades = grades.filter((g: any) => g.student_id === student.id);
      const avgGrade = studentGrades.length > 0
        ? studentGrades.reduce((s: number, g: any) => s + (parseFloat(g.grade) || 0), 0) / studentGrades.length
        : 0;
      const riskScore = Math.round((100 - attendancePct) * 0.3 + (100 - avgGrade * 10) * 0.4);
      return {
        student_id: student.id,
        student_name: student.full_name,
        roll_number: student.roll_number,
        class: studentClassMap[student.id] || null,
        attendancePct: Math.round(attendancePct),
        avgGrade: Math.round(avgGrade * 10) / 10,
        riskScore: Math.min(100, Math.max(0, riskScore)),
        riskLevel: riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low',
        recommendation: riskScore > 60 ? 'Immediate intervention required' : riskScore > 30 ? 'Monitor closely' : 'On track',
      };
    });
    res.json(predictions);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}));

router.get('/ai-insights/remedial-plans/:organisation_id', asyncHandler(async (req, res) => {
  res.json([]);
}));

router.get('/ai-insights/teacher-effectiveness/:organisation_id', asyncHandler(async (req, res) => {
  res.json({ averageRating: 0, totalTeachers: 0, topPerformers: [] });
}));

// === TEACHER WORKFORCE MANAGEMENT SYSTEM ENDPOINTS ===

// 1. Management: Get all assignments for a teacher
router.get('/teacher-assignments/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

// 2. Management: Save an assignment
router.post('/teacher-assignments', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, assignment_type, assignment_name, target_id, details } = req.body;
  if (!organisation_id || !teacher_id || !assignment_type || !assignment_name) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Insert assignment
  const { data: assignment, error } = await supabase
    .from('teacher_assignments')
    .insert({
      organisation_id,
      teacher_id,
      assignment_type,
      assignment_name,
      target_id: target_id || null,
      details: details || {}
    })
    .select()
    .single();

  if (error) throw error;

  // Real-time Sync helper: If academic, sync to classes and subjects
  if (assignment_type === 'ACADEMIC') {
    // If Grade 5A - Mathematics
    const match = assignment_name.match(/Grade\s*([0-9]+\s*[A-Z]?)\s*-\s*(.*)/i);
    const className = match ? `Grade ${match[1].trim()}` : assignment_name;
    const subjectName = match ? match[2].trim() : 'General';
    const sectionName = match && match[1].includes('A') ? 'A' : (match && match[1].includes('B') ? 'B' : 'A');

    try {
      await supabase.from('teacher_classes').insert({
        organisation_id,
        teacher_id,
        class_name: className,
        section_name: sectionName,
        student_count: 28
      });
    } catch (err) {}

    try {
      await supabase.from('teacher_subjects').insert({
        organisation_id,
        teacher_id,
        subject_name: subjectName,
        class_name: className,
        average_score: 75.0
      });
    } catch (err) {}
  } else if (assignment_type === 'CLASS_TEACHER') {
    try {
      await supabase.from('teacher_classes').insert({
        organisation_id,
        teacher_id,
        class_name: assignment_name,
        section_name: 'A',
        student_count: 30
      });
    } catch (err) {}
  }

  res.status(201).json(assignment);
}));

// 3. Management: Delete an assignment
router.delete('/teacher-assignments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('teacher_assignments')
    .delete()
    .eq('id', id);
  if (error) throw error;
  res.json({ success: true, message: 'Assignment deleted' });
}));

// 4. Teacher Dashboard: Get stats/KPIs
router.get('/teacher/dashboard-stats/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;

  const [classesRes, subjectsRes, homeworkRes, tasksRes, examsRes, ptmRes, perfRes] = await Promise.all([
    supabase.from('teacher_classes').select('id, student_count').eq('teacher_id', teacher_id),
    supabase.from('teacher_subjects').select('id').eq('teacher_id', teacher_id),
    supabase.from('teacher_homework').select('id, status').eq('teacher_id', teacher_id),
    supabase.from('teacher_tasks').select('id, status').eq('teacher_id', teacher_id),
    supabase.from('teacher_exams').select('id, exam_date').eq('teacher_id', teacher_id).gte('exam_date', new Date().toISOString().split('T')[0]),
    supabase.from('teacher_ptm').select('id').eq('teacher_id', teacher_id).eq('status', 'SCHEDULED'),
    supabase.from('teacher_performance').select('metric_value').eq('teacher_id', teacher_id).eq('metric_name', 'Teacher Rating')
  ]);

  const studentsAssigned = (classesRes.data || []).reduce((sum, c) => sum + (c.student_count || 0), 0);
  const homeworkPending = (homeworkRes.data || []).filter(h => h.status === 'PUBLISHED').length;
  const tasksPending = (tasksRes.data || []).filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
  const ptmScheduled = (ptmRes.data || []).length;
  const upcomingExams = (examsRes.data || []).length;
  const ratingVal = perfRes.data && perfRes.data[0] ? parseFloat(perfRes.data[0].metric_value) : 4.8;

  res.json({
    todayClasses: (classesRes.data || []).length * 2 || 4,
    studentsAssigned,
    homeworkPending,
    assignmentsPending: homeworkPending,
    attendanceCompletion: 96,
    ptmScheduled,
    upcomingExams,
    performanceScore: ratingVal * 20 // Convert 5 star to 100 base
  });
}));

// 5. Teacher: Get classes
router.get('/teacher/classes/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_classes')
    .select('*')
    .eq('teacher_id', teacher_id);
  if (error) throw error;
  res.json(data);
}));

// 6. Teacher: Get subjects
router.get('/teacher/subjects/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_subjects')
    .select('*')
    .eq('teacher_id', teacher_id);
  if (error) throw error;
  res.json(data);
}));

// 7. Teacher: Get students in teacher classes
router.get('/teacher/students/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  // Get teacher's classes
  const { data: classes } = await supabase.from('teacher_classes').select('class_name').eq('teacher_id', teacher_id);
  const classNames = (classes || []).map(c => c.class_name);

  // Fetch all students. If we have class names, filter, otherwise fetch a sample
  let query = supabase.from('students').select('*');
  if (classNames.length > 0) {
    // For simplicity, we match the organization or class names if mapped.
    // Let's filter by organization_id matching the teacher's org.
    const { data: teacher } = await supabase.from('staff_records').select('organisation_id').eq('id', teacher_id).single();
    if (teacher) {
      query = query.eq('organisation_id', teacher.organisation_id);
    }
  }
  const { data: students, error } = await query.limit(50);
  if (error) throw error;
  res.json(students || []);
}));

// 8. Teacher: Homework CRUD
router.get('/teacher/homework/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_homework')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/homework', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, class_name, subject_name, title, description, due_date, status, attachments } = req.body;
  if (!organisation_id || !teacher_id || !class_name || !subject_name || !title || !due_date) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_homework')
    .insert({ organisation_id, teacher_id, class_name, subject_name, title, description, due_date, status: status || 'PUBLISHED', attachments: attachments || [] })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

router.put('/teacher/homework/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status, attachments } = req.body;
  const { data, error } = await supabase
    .from('teacher_homework')
    .update({ title, description, due_date, status, attachments, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  res.json(data);
}));

router.delete('/teacher/homework/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('teacher_homework')
    .delete()
    .eq('id', id);
  if (error) throw error;
  res.json({ success: true, message: 'Homework deleted' });
}));

// 9. Teacher: Submissions
router.get('/teacher/homework-submissions/:homework_id', asyncHandler(async (req, res) => {
  const { homework_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_assignments_submissions')
    .select('*')
    .eq('assignment_id', homework_id);
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/homework-submissions/grade', asyncHandler(async (req, res) => {
  const { submission_id, grade, feedback } = req.body;
  if (!submission_id || !grade) {
    return res.status(400).json({ error: 'submission_id and grade required' });
  }
  const { data, error } = await supabase
    .from('teacher_assignments_submissions')
    .update({ grade, feedback, status: 'GRADED' })
    .eq('id', submission_id)
    .select()
    .single();
  if (error) throw error;
  res.json(data);
}));

// 10. Teacher: Attendance
router.get('/teacher/attendance/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_attendance')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('attendance_date', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/attendance', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, class_name, student_name, status, remarks, attendance_date } = req.body;
  if (!organisation_id || !teacher_id || !class_name || !student_name || !status) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_attendance')
    .insert({ organisation_id, teacher_id, class_name, student_name, status, remarks: remarks || null, attendance_date: attendance_date || new Date().toISOString().split('T')[0] })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

// 11. Teacher: Exams & Marks
router.get('/teacher/exams/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_exams')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('exam_date', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/exams', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, exam_name, class_name, subject_name, exam_date, max_marks } = req.body;
  if (!organisation_id || !teacher_id || !exam_name || !class_name || !subject_name || !exam_date || !max_marks) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_exams')
    .insert({ organisation_id, teacher_id, exam_name, class_name, subject_name, exam_date, max_marks, status: 'SCHEDULED' })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

router.get('/teacher/marks/:exam_id', asyncHandler(async (req, res) => {
  const { exam_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_marks')
    .select('*')
    .eq('exam_id', exam_id);
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/marks', asyncHandler(async (req, res) => {
  const { organisation_id, exam_id, student_name, marks_obtained, remarks } = req.body;
  if (!organisation_id || !exam_id || !student_name || marks_obtained === undefined) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_marks')
    .insert({ organisation_id, exam_id, student_name, marks_obtained, remarks: remarks || null })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

// 12. Teacher: PTM
router.get('/teacher/ptm/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_ptm')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('meeting_date', { ascending: true });
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/ptm', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, parent_name, student_name, meeting_date, time_slot, notes } = req.body;
  if (!organisation_id || !teacher_id || !parent_name || !student_name || !meeting_date || !time_slot) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_ptm')
    .insert({ organisation_id, teacher_id, parent_name, student_name, meeting_date, time_slot, notes: notes || null, status: 'SCHEDULED' })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

// 13. Teacher: Resources
router.get('/teacher/resources/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_resources')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/resources', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, resource_name, resource_type, subject_name, file_url } = req.body;
  if (!organisation_id || !teacher_id || !resource_name || !resource_type || !subject_name || !file_url) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_resources')
    .insert({ organisation_id, teacher_id, resource_name, resource_type, subject_name, file_url })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

// 14. Teacher: Tasks
router.get('/teacher/tasks/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_tasks')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.put('/teacher/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase
    .from('teacher_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  res.json(data);
}));

// 15. Teacher: Performance
router.get('/teacher/performance/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_performance')
    .select('*')
    .eq('teacher_id', teacher_id);
  if (error) throw error;
  res.json(data);
}));

// 16. Teacher: Communications
router.get('/teacher/communications/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_communications')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/communications', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, recipient_type, recipient_name, message_text, communication_type } = req.body;
  if (!organisation_id || !teacher_id || !recipient_type || !recipient_name || !message_text) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_communications')
    .insert({ organisation_id, teacher_id, recipient_type, recipient_name, message_text, communication_type: communication_type || 'DIRECT' })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

// 17. Teacher: Notifications
router.get('/teacher/notifications/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_notifications')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.put('/teacher/notifications/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('teacher_notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  res.json(data);
}));

// 18. Teacher: Activity Logs
router.get('/teacher/activity-logs/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_activity_logs')
    .select('*')
    .eq('teacher_id', teacher_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json(data);
}));

router.post('/teacher/activity-logs', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, action, details } = req.body;
  const { data, error } = await supabase
    .from('teacher_activity_logs')
    .insert({ organisation_id, teacher_id, action, details: details || {} })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

// === CATCH-ALL: Return empty array for unknown GET routes ====================
router.get('*', (req, res) => {
  res.json([]);
});

export default router;
