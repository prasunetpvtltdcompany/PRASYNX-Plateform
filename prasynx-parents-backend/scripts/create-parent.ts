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

  const { data: user } = await supabase.from('users').select('id,organisation_id').eq('email', 'sunil.sharma@email.com').single();
  if (!user) { console.log('User not found'); return; }
  console.log('User:', user.id);

  const { data: existing } = await supabase.from('parents').select('id').eq('user_id', user.id).maybeSingle();
  if (existing) { console.log('Parent record already exists'); return; }

  const { data: parent, error: pErr } = await supabase.from('parents').insert({
    user_id: user.id,
    organisation_id: orgId,
    full_name: 'Sunil Sharma',
    email: 'sunil.sharma@email.com',
    phone: '9876602001',
    relationship: 'father',
  }).select().single();

  if (pErr) { console.error('Insert parent failed:', pErr.message); return; }
  console.log('Parent created:', parent.id);

  // Check for students
  const { data: students } = await supabase.from('students').select('id').eq('organisation_id', orgId);
  console.log('Students in org:', students?.length || 0);

  // Create parent-student link if a student exists
  if (students && students.length > 0) {
    const { error: lErr } = await supabase.from('parent_student_links').insert({
      parent_id: user.id,
      student_id: students[0].id,
      organisation_id: orgId,
      relationship: 'father',
    });
    if (lErr) console.error('Link failed:', lErr.message);
    else console.log('Parent linked to student');
  }
}

main();
