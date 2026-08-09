const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const { rows } = await c.query(
    "SELECT id, email, full_name, role, organisation_id, status FROM public.users WHERE role='management' AND status='active' LIMIT 1"
  );
  if (!rows[0]) { console.error('No management user found'); process.exit(1); }
  const user = rows[0];
  await c.end();

  console.log('Using user:', user.email, 'org:', user.organisation_id);

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, organisationId: user.organisation_id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const base = `http://localhost:${process.env.PORT || 4002}`;

  async function hit(path, label) {
    try {
      const res = await fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      const ok = res.ok && body.success !== false;
      console.log(`[${ok ? 'OK' : 'FAIL'}] ${label} -> ${res.status}`, JSON.stringify(body).slice(0, 300));
      return ok;
    } catch (e) {
      console.log(`[ERROR] ${label} ->`, e.message);
      return false;
    }
  }

  let allOk = true;
  allOk = await hit('/api/management/staff', 'GET staff list') && allOk;
  allOk = await hit('/api/management/staff-attendance', 'GET staff attendance') && allOk;
  allOk = await hit('/api/management/staff-summary', 'GET staff summary') && allOk;
  allOk = await hit(`/api/v2/management/staff/${user.organisation_id}`, 'GET v2 staff list') && allOk;

  process.exit(allOk ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
