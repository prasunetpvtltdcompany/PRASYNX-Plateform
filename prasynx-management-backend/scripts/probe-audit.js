const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, { auth: { persistSession: false } });
  const { data: user, error } = await sb
    .from('users').select('id, email, role, organisation_id').eq('role', 'management').eq('status', 'active').limit(1).maybeSingle();
  if (error || !user) { console.error('no user', error?.message); process.exit(1); }
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, organisationId: user.organisation_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const base = `http://localhost:${process.env.PORT || 4002}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const org = user.organisation_id;

  async function hit(method, p, body) {
    const r = await fetch(base + p, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const t = await r.text();
    console.log(`[${r.status}] ${method} ${p}`, t.slice(0, 140));
    return t;
  }

  // 1) Create an announcement (POST -> should be audited by universalAudit)
  await hit('POST', '/api/management/announcements', {
    organisation_id: org, title: `Audit Probe ${Date.now()}`, content: 'probe', priority: 'normal', target_role: 'staff'
  });
  // 2) Update an existing parent/student? Use a harmless PATCH-less route: create an event then delete it
  const evJSON = await hit('POST', '/api/events-management/events', {
    organisation_id: org, title: `Audit Probe Event ${Date.now()}`, description: 'probe', event_type: 'academic',
    start_date: new Date().toISOString().slice(0, 10), location: 'probe', status: 'upcoming'
  });
  let evId = null;
  try { const parsed = JSON.parse(evJSON); evId = parsed.data?.id; } catch {}
  if (evId) {
    await hit('PUT', `/api/events-management/events/${evId}`, { title: 'Audit Probe Event Edited' });
    await hit('DELETE', `/api/events-management/events/${evId}`);
  }

  // 3) Read back audit logs
  await new Promise(r => setTimeout(r, 1200));
  const logsRes = await fetch(`${base}/api/v2/audit-logs/logs/${org}?limit=8`, { headers });
  const logs = await logsRes.json();
  console.log('\nTotal:', logs.data?.pagination?.total);
  for (const l of (logs.data?.data || [])) {
    console.log(`- [${l.severity}] ${l.action} | entity=${l.entity_type} | user=${l.user_email || l.user_id} | ${new Date(l.created_at).toISOString()} | ip=${l.ip_address}`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });