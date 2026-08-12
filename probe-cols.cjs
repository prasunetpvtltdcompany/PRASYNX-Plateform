const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('./server/.env', 'utf-8').split(/\r?\n/)) {
  const m = line.replace(/^export\s+/, '').match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const tables = ['library_books', 'hostel_rooms', 'hostel_allocations', 'notifications', 'announcements', 'health_records', 'transport_routes'];
(async () => {
  for (const t of tables) {
    const { data, error } = await db.from(t).select('*').limit(1);
    if (error) { console.log(t, 'ERR', String(error.message).slice(0, 100)); continue; }
    if (data && data.length) console.log(t, '::', Object.keys(data[0]).join(','));
    else console.log(t, ':: (empty - no rows to infer cols, checking via count)');
    // Try to fetch column names via a returns-info trick: use select=* limit 1 returns rows only. Use rpc not available. Use information_schema? not exposed. Fall back to /rest/v1 with limit=0 doesn't return cols. Use HEAD. We'll rely on row inference where possible.
  }
  // For empty tables, get column list via the PostgREST OpenAPI-ish: select=* with limit=0 won't help; use the swagger via / endpoint? Use the "returns=true" select trick:
  for (const t of ['library_books', 'hostel_rooms', 'hostel_allocations', 'notifications']) {
    try {
      const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${t}?select=*&limit=0`, {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
      });
      const ct = r.headers.get('content-type') || '';
      if (r.ok) {
        const body = await r.json();
        console.log(t, 'ok empty', Array.isArray(body), body.length);
      } else {
        console.log(t, 'status', r.status, String(await r.text()).slice(0, 120));
      }
    } catch (e) { console.log(t, 'fetch err', String(e).slice(0, 120)); }
  }
  process.exit(0);
})();