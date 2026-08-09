const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.JWT_SECRET) {
    console.error('Missing SUPABASE_URL / SUPABASE_KEY / JWT_SECRET in .env');
    process.exit(1);
  }
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, { auth: { persistSession: false } });

  const { data, error } = await sb
    .from('users')
    .select('id, email, role, organisation_id')
    .eq('role', 'management')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  if (error || !data) { console.error('No management user:', error?.message || 'not found'); process.exit(1); }
  const user = data;
  console.log('user:', user.email, '| org:', user.organisation_id);

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, organisationId: user.organisation_id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const base = `http://localhost:${process.env.PORT || 4002}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function hit(method, path, label, body) {
    try {
      const res = await fetch(base + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const text = await res.text();
      let parsed; try { parsed = JSON.parse(text); } catch { parsed = text; }
      const ok = res.ok;
      console.log(`[${ok ? 'OK' : 'FAIL'}] ${method} ${label} -> ${res.status}`, JSON.stringify(parsed).slice(0, 260));
      return { ok, data: parsed };
    } catch (e) {
      console.log(`[ERROR] ${method} ${label} ->`, e.message);
      return { ok: false, data: null };
    }
  }

  let allOk = true;
  const org = user.organisation_id;

  const listEvents = await hit('GET', `/api/events-management/events/${org}`, 'GET events');
  const listClubs = await hit('GET', `/api/events-management/clubs/${org}`, 'GET clubs');
  const listSports = await hit('GET', `/api/events-management/sports-teams/${org}`, 'GET sports-teams');
  allOk = listEvents.ok && listClubs.ok && listSports.ok && allOk;

  const created = await hit('POST', '/api/events-management/events', 'POST event', {
    organisation_id: org,
    title: `Smoke Test Event ${Date.now()}`,
    description: 'created by smoke-test-events.js',
    event_type: 'academic',
    start_date: new Date().toISOString().slice(0, 10),
    location: 'Test Hall',
    status: 'upcoming'
  });
  allOk = created.ok && allOk;
  const eventId = created.data?.id || created.data?.data?.id;

  if (eventId) {
    allOk = (await hit('GET', `/api/events-management/events/${eventId}`, 'GET event by id')).ok && allOk;
    allOk = (await hit('PUT', `/api/events-management/events/${eventId}`, 'PUT event', { title: 'Smoke Test Event Updated' })).ok && allOk;
    allOk = (await hit('DELETE', `/api/events-management/events/${eventId}`, 'DELETE event')).ok && allOk;
  }

  const allAnns = await hit('GET', `/api/management/announcements/${org}`, 'GET announcements');
  allOk = allAnns.ok && allOk;

  const annCreated = await hit('POST', '/api/management/announcements', 'POST announcement', {
    organisation_id: org,
    title: `Smoke Test Announcement ${Date.now()}`,
    content: 'created by smoke-test-events.js',
    priority: 'normal',
    target_role: 'staff'
  });
  allOk = annCreated.ok && allOk;
  const annId = annCreated.data?.id || annCreated.data?.data?.id || (Array.isArray(annCreated.data) && annCreated.data[0]?.id);
  if (annId) {
    allOk = (await hit('PUT', `/api/management/announcements/${annId}`, 'PUT announcement', { priority: 'high' })).ok && allOk;
    allOk = (await hit('DELETE', `/api/management/announcements/${annId}`, 'DELETE announcement')).ok && allOk;
  } else {
    console.log('  (announcement create returned no id — skipping PUT/DELETE)');
  }

  process.exit(allOk ? 0 : 1);
})().catch((e) => { console.error(e.message); process.exit(1); });