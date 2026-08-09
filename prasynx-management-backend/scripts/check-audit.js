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
  const headers = { Authorization: `Bearer ${token}` };

  for (const p of [`/api/v2/audit-logs/dashboard/${user.organisation_id}`, `/api/v2/audit-logs/logs/${user.organisation_id}?limit=5`, `/api/v2/audit-logs/actions/${user.organisation_id}`, `/api/v2/audit-logs/entity-types/${user.organisation_id}`]) {
    try {
      const r = await fetch(base + p, { headers });
      const t = await r.text();
      console.log(`[${r.status}]`, p, '->', t.slice(0, 400));
    } catch (e) { console.log('[ERR]', p, e.message); }
  }
})().catch(e => { console.error(e.message); process.exit(1); });