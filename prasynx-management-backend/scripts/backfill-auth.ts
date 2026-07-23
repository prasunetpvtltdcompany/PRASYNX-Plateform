import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://axwhtngxveaidbscsrca.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ1Njc0MiwiZXhwIjoyMDkzMDMyNzQyfQ.5hv3WPlFmaRVFFtsGYWOkYp8e3WBv7bMIAIjL25L7Ag';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, password_hash, organisation_id')
    .not('email', 'is', null)
    .order('created_at', { ascending: false });

  if (error) { console.error('Failed to fetch users:', error.message); return; }

  const { data: profiles } = await supabase.from('profiles').select('email');
  const profileEmails = new Set((profiles || []).map(p => p.email));

  let created = 0, skipped = 0, failed = 0;

  for (const u of users) {
    if (!u.email) continue;
    if (profileEmails.has(u.email)) { skipped++; continue; }

    const password = 'Reset@123';
    const { error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: u.full_name,
        role: u.role,
        organisation_id: u.organisation_id,
      },
    });

    if (authError) {
      console.error(`FAILED ${u.email}: ${authError.message}`);
      failed++;
    } else {
      console.log(`CREATED ${u.email} (${u.role}) pw=${password}`);
      created++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${failed} failed`);
}

main().catch(console.error);
