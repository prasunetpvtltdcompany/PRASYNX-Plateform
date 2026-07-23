import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function createAdmin() {
  const email = 'prasunetcompany@gmail.com';
  const password = 'admin123';
  const fullName = 'Super Admin';

  const password_hash = await bcrypt.hash(password, 10);

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'admin',
    },
  });

  if (authError || !authUser.user) {
    console.error('Failed to create auth user:', authError?.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      full_name: fullName,
      email,
      password_hash,
      role: 'admin',
      status: 'active',
    });

  if (profileError) {
    console.error('Failed to create user record:', profileError.message);
    await supabase.auth.admin.deleteUser(authUser.user.id);
    process.exit(1);
  }

  console.log('Admin user created successfully');
  console.log('  Email:', email);
  console.log('  Password:', password);
  console.log('  User ID:', authUser.user.id);
}

createAdmin();
