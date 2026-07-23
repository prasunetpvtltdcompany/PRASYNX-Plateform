const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axwhtngxveaidbscsrca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: students, error: err1 } = await supabase.from('students').select('id, full_name, email');
  if (err1) {
    console.error(err1);
    return;
  }
  
  const { data: attendance, error: err2 } = await supabase.from('attendance').select('*');
  if (err2) {
    console.error(err2);
    return;
  }
  
  console.log("Total attendance records:", attendance.length);
  
  const countsByStudent = {};
  attendance.forEach(r => {
    if (!countsByStudent[r.student_id]) {
      countsByStudent[r.student_id] = { present: 0, absent: 0, late: 0, leave: 0 };
    }
    countsByStudent[r.student_id][r.status] = (countsByStudent[r.student_id][r.status] || 0) + 1;
  });
  
  students.forEach(s => {
    const c = countsByStudent[s.id];
    if (c) {
      const total = c.present + c.absent + c.late + c.leave;
      const pct = total > 0 ? Math.round((c.present / total) * 100) : 0;
      console.log(`Student: ${s.full_name} (${s.email}) - ID: ${s.id}`);
      console.log(`  Counts:`, c, `Total: ${total}, Pct: ${pct}%`);
    }
  });
}

main().catch(console.error);
