const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axwhtngxveaidbscsrca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: teachers, error } = await supabase.from('staff_records')
    .select('*')
    .ilike('full_name', '%Rajesh%');
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("Teachers found matching Rajesh:", teachers);
}

main().catch(console.error);
