const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axwhtngxveaidbscsrca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudent(id, name) {
  try {
    const { data, error } = await supabase.from('attendance').select('*').eq('student_id', id);
    if (error) {
      console.error(`Error for ${name} (${id}):`, error);
    } else {
      console.log(`Attendance records for ${name} (${id}):`, data.length);
      if (data.length > 0) {
        console.log(`First 3 records:`, data.slice(0, 3));
      }
    }
  } catch (e) {
    console.error(`Exception for ${name}:`, e);
  }
}

async function main() {
  console.log("Starting DB check...");
  
  await checkStudent('d4252599-1ae6-4bb7-a4ee-1821e673bada', 'John Doe (john.doe@example.com)');
  await checkStudent('d8db96d1-8389-4aa3-b7b4-947012876223', 'John Doe (john@school.edu)');
  
  console.log("\nChecking parent-student links...");
  try {
    const { data, error } = await supabase.from('parent_student_links').select('*');
    if (error) console.error("Error fetching parent-student links:", error);
    else console.log("Parent-student links:", data);
  } catch (e) {
    console.error("Exception checking links:", e);
  }
}

main().catch(console.error);
