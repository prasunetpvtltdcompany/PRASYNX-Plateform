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
  const parentEmail = 'sunil.sharma@email.com';

  // Create table if not exists
  const { error: createErr } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.parents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        organisation_id UUID,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        relationship TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });
  if (createErr && !createErr.message?.includes('already exists')) {
    console.log('RPC not available, trying direct SQL...');
  }

  // Try using the sql endpoint directly
  const url = `${process.env.SUPABASE_URL}/rest/v1/`;
  const headers = {
    'apikey': process.env.SUPABASE_KEY!,
    'Authorization': `Bearer ${process.env.SUPABASE_KEY!}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  };

  // Try inserting directly - if table doesn't exist it'll fail
  const { data: user } = await supabase.from('users').select('id,organisation_id').eq('email', parentEmail).single();
  if (!user) { console.log('User not found'); return; }

  const insertRes = await fetch(`${url}parents`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user_id: user.id,
      organisation_id: orgId,
      full_name: 'Sunil Sharma',
      email: parentEmail,
      phone: '9876602001',
      relationship: 'father',
      status: 'active',
    }),
  });

  if (!insertRes.ok) {
    const text = await insertRes.text();
    console.log('Insert failed:', text.substring(0, 200));

    if (text.includes('does not exist') || text.includes('relation')) {
      console.log('Table does not exist. Creating via SQL API...');
      // Use the pg_dump endpoint
      const sqlUrl = `${process.env.SUPABASE_URL}/rest/v1/rpc/`;
      const sqlBody = {
        query: `
          CREATE TABLE IF NOT EXISTS public.parents (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            organisation_id UUID,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            relationship TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT now()
          );
        `
      };
      const rpcRes = await fetch(`${sqlUrl}exec_sql`, {
        method: 'POST',
        headers,
        body: JSON.stringify(sqlBody),
      });
      console.log('Create table response:', rpcRes.status, await rpcRes.text().catch(() => ''));

      // Retry insert
      const retryRes = await fetch(`${url}parents`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: user.id,
          organisation_id: orgId,
          full_name: 'Sunil Sharma',
          email: parentEmail,
          phone: '9876602001',
          relationship: 'father',
          status: 'active',
        }),
      });
      if (retryRes.ok) {
        const result = await retryRes.json();
        console.log('Parent created:', result);
      } else {
        console.log('Retry failed:', await retryRes.text());
      }
    }
  } else {
    const result = await insertRes.json();
    console.log('Parent created:', result);
  }

  // Create parent_student_link
  const { data: students } = await supabase.from('students').select('id').eq('organisation_id', orgId).limit(1);
  if (students && students.length > 0) {
    const { error: lErr } = await supabase.from('parent_student_links').insert({
      parent_id: user.id,
      student_id: students[0].id,
      organisation_id: orgId,
      relationship: 'father',
    });
    if (lErr) console.log('Link error:', lErr.message);
    else console.log('Parent linked to student');
  }
}

main();
