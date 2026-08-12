const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('./server/.env', 'utf-8').split(/\r?\n/)) {
  const m = line.replace(/^export\s+/, '').match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
(async () => {
  for (const table of ['admissions', 'admission_forms', 'admission_applications', 'admission_enquiries', 'admission_form_status_history', 'admission_waitlist']) {
    const { data, error } = await db.from(table).select('*').limit(1);
    if (error) console.log(table, '-> E', String(error.message).slice(0, 140));
    else if (data && data.length) console.log(table, '-> rows; cols:', Object.keys(data[0]).join(','));
    else console.log(table, '-> exists (empty)');
  }
  process.exit(0);
})();