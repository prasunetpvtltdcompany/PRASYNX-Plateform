const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('./server/.env', 'utf-8').split(/\r?\n/)) {
  const m = line.replace(/^export\s+/, '').match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const tables = [
  'subjects', 'subjects_classes', 'subject_teachers',
  'staff', 'staff_members', 'teachers', 'employees',
  'staff_attendance', 'staff_leaves', 'staff_salaries', 'staff_expenses', 'staff_documents',
  'promotions', 'student_promotions',
  'discipline_records', 'student_discipline',
  'health_records', 'student_health',
  'bus_routes', 'student_transport', 'transport_routes', 'transport_students',
  'library_books', 'library_members', 'book_issues',
  'hostel_rooms', 'hostel_allocations',
  'announcements', 'notifications', 'messages',
  'fees', 'fee_structures', 'fee_payments', 'fee_categories',
  'exam_results',
];
(async () => {
  for (const t of tables) {
    if (!t) continue;
    const { data, error } = await db.from(t).select('*').limit(1);
    if (error) console.log(t.padEnd(24), 'MISSING');
    else if (data && data.length) console.log(t.padEnd(24), 'OK  cols:', Object.keys(data[0]).slice(0, 12).join(','));
    else console.log(t.padEnd(24), 'OK (empty)');
  }
  process.exit(0);
})();