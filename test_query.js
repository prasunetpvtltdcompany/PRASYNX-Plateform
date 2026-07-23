const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axwhtngxveaidbscsrca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("=== STUDENTS ===");
  const { data: students, error: err1 } = await supabase.from('students').select('id, full_name, email');
  if (err1) console.error("Error fetching students:", err1);
  else console.log(students);

  console.log("\n=== ATTENDANCE COUNT ===");
  const { data: attendance, error: err2 } = await supabase.from('attendance').select('*');
  if (err2) console.error("Error fetching attendance:", err2);
  else {
    console.log("Total attendance records in database:", attendance.length);
    if (attendance.length > 0) {
      console.log("Sample records:", attendance.slice(0, 5));
    }
  }

  console.log("\n=== PARENT STUDENT LINKS ===");
  const { data: links, error: err3 } = await supabase.from('parent_student_links').select('*');
  if (err3) console.error("Error fetching links:", err3);
  else console.log(links);
}

main().catch(console.error);
