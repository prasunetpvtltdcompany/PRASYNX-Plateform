const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const { rows } = await c.query(
    "SELECT id, email, role, organisation_id FROM public.users WHERE role='management' AND status='active' LIMIT 1"
  );
  const user = rows[0];
  await c.end();

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, organisationId: user.organisation_id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const base = `http://localhost:${process.env.PORT || 4002}`;
  const body = {
    organisation_id: user.organisation_id,
    full_name: 'Smoke Test Staff',
    email: 'smoke.staff@test.local',
    phone: '9999999999',
    role: 'staff',
    staff_unique_id: 'EMP-SMOKE-001',
    designation: 'Test Designation',
    status: 'active'
  };

  try {
    const res = await fetch(`${base}/api/management/staff`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    console.log(`POST /api/management/staff -> ${res.status}`, JSON.stringify(result).slice(0, 400));
    if (res.ok) {
      const id = result.data?.id || result.id;
      const del = await fetch(`${base}/api/management/staff/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' })
      });
      console.log(`(cleanup) PUT status -> ${del.status}`);
    }
  } catch (e) {
    console.log('[ERROR]', e.message);
    process.exit(1);
  }
})();
