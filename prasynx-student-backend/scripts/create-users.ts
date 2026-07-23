import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  const orgId = '2ede7e3f-d000-4efd-817b-fb97a84ca115';

  const entries = [
    { email: 'aarav.sharma@school.edu', password: '61b4c5c8-96fS!', full_name: 'Aarav Sharma', role: 'student' },
    { email: 'sunil.sharma@email.com', password: '921a5cf3-b6bA!', full_name: 'Sunil Sharma', role: 'parent' },
  ];

  const { data: list } = await supabase.auth.admin.listUsers();

  for (const e of entries) {
    const existingAuth = list?.users?.find(u => u.email === e.email);
    if (existingAuth) {
      const { data: existing } = await supabase.from('users').select('id').eq('id', existingAuth.id).maybeSingle();
      if (existing) {
        console.log(`${e.role} ${e.email} already exists in users table`);
        continue;
      }
      const password_hash = await bcrypt.hash(e.password, 10);
      const { error: insErr } = await supabase.from('users').insert({
        id: existingAuth.id, organisation_id: orgId,
        full_name: e.full_name, email: e.email,
        password_hash, role: e.role, status: 'active',
      });
      if (insErr) console.error(`Insert ${e.email} failed:`, insErr.message);
      else console.log(`Created ${e.role}: ${e.email} / ${e.password}`);
    } else {
      console.log(`No auth user found for ${e.email} - creating...`);
      const password_hash = await bcrypt.hash(e.password, 10);
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: e.email, password: e.password, email_confirm: true,
        user_metadata: { full_name: e.full_name, role: e.role, organisation_id: orgId },
      });
      if (authErr || !authUser?.user) { console.error(`Create auth ${e.email} failed:`, authErr?.message); continue; }
      const { error: insErr } = await supabase.from('users').insert({
        id: authUser.user.id, organisation_id: orgId,
        full_name: e.full_name, email: e.email,
        password_hash, role: e.role, status: 'active',
      });
      if (insErr) console.error(`Insert ${e.email} failed:`, insErr.message);
      else console.log(`Created ${e.role}: ${e.email} / ${e.password}`);
    }
  }
}

main();
