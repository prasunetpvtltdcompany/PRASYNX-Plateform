const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axwhtngxveaidbscsrca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('attendance')
    .select('*')
    .eq('student_id', 'd4252599-1ae6-4bb7-a4ee-1821e673bada');
  if (error) {
    console.error(error);
    return;
  }
  
  const counts = {};
  data.forEach(r => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });
  console.log("Status Counts:", counts);
  console.log("Total records:", data.length);
  
  // Also check if there's any today's date record
  const today = new Date().toISOString().slice(0, 10);
  console.log("Today is:", today);
  const todayRecord = data.find(r => r.date === today);
  console.log("Today's record in DB:", todayRecord);
}

main().catch(console.error);
