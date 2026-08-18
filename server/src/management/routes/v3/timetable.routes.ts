import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/backend-common';
import { trackChange, notifyStudentsInClass, notifyParentsOfStudentsInClass, notifyStaffAssignedToClass } from '../../utils/sync';

const router = Router();

router.param('org_id', (req, res, next, value) => {
  if (value && value !== (req as any).user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.get('/timetable/staff-overview/:org_id', async (req: Request, res: Response) => {
  try {
    const [entriesRes, teachersRes] = await Promise.all([
      supabase.from('timetable_entries')
        .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
        .eq('organisation_id', req.params.org_id)
        .order('day_of_week').order('start_time'),
      supabase.from('staff_records').select('id, full_name, subject, email, phone')
        .eq('organisation_id', req.params.org_id).eq('status', 'active')
    ]);
    if (entriesRes.error) throw entriesRes.error;
    if (teachersRes.error) throw teachersRes.error;
    res.json({ teachers: teachersRes.data || [], entries: entriesRes.data || [] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timetable/teachers-list/:org_id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('staff_records')
      .select('id, full_name, subject, email')
      .eq('organisation_id', req.params.org_id).eq('status', 'active');
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timetable/classes-list/:org_id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('classes')
      .select('id, name')
      .eq('organisation_id', req.params.org_id).eq('status', 'active');
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timetable/subjects-list/:org_id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('subjects')
      .select('id, name, code').eq('organisation_id', req.params.org_id);
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timetable', async (req: Request, res: Response) => {
  const { organisation_id, class_id, teacher_id } = req.query;
  try {
    let query = supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
      .order('day_of_week').order('start_time');
    if (organisation_id) query = query.eq('organisation_id', organisation_id as string);
    if (class_id) query = query.eq('class_id', class_id as string);
    if (teacher_id) query = query.eq('teacher_id', teacher_id as string);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timetable/class/:class_id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
      .eq('class_id', req.params.class_id)
      .order('day_of_week').order('start_time');
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timetable/teacher/:teacher_id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*)')
      .eq('teacher_id', req.params.teacher_id)
      .order('day_of_week').order('start_time');
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/timetable', async (req: Request, res: Response) => {
  const { organisation_id, class_id, teacher_id, subject_id, day_of_week, start_time, end_time, room } = req.body;
  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .insert({ organisation_id, class_id, teacher_id, subject_id, day_of_week, start_time, end_time, room })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
    if (data?.class_id) {
      trackChange({ organisationId: organisation_id, tableName: 'timetable', operation: 'INSERT', recordId: data.id });
      notifyStudentsInClass(organisation_id, data.class_id, 'Timetable Updated', 'Your class timetable has been updated.');
      notifyParentsOfStudentsInClass(organisation_id, data.class_id, 'Timetable Updated', 'Your child\'s timetable has been updated.');
      notifyStaffAssignedToClass(organisation_id, data.class_id, 'Timetable Updated', 'Your teaching timetable has been updated.');
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/timetable/:id', async (req: Request, res: Response) => {
  const { class_id, teacher_id, subject_id, day_of_week, start_time, end_time, room } = req.body;
  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .update({ class_id, teacher_id, subject_id, day_of_week, start_time, end_time, room })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/timetable/:id', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('timetable_entries').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/timetable/bulk', async (req: Request, res: Response) => {
  const { entries } = req.body;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'entries array required' });
  }
  try {
    const { data, error } = await supabase.from('timetable_entries').insert(entries).select();
    if (error) throw error;
    res.status(201).json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/timetable/check-conflicts', async (req: Request, res: Response) => {
  const { teacher_id, day_of_week, start_time, end_time, exclude_id } = req.query;
  if (!teacher_id || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: 'teacher_id, day_of_week, start_time, end_time required' });
  }
  try {
    let query = supabase
      .from('timetable_entries')
      .select('id, class_id, start_time, end_time, teacher:staff_records(full_name), class:classes!timetable_entries_class_id_fkey(name)')
      .eq('teacher_id', teacher_id as string)
      .eq('day_of_week', parseInt(day_of_week as string))
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`);
    if (exclude_id) query = query.neq('id', exclude_id as string);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
