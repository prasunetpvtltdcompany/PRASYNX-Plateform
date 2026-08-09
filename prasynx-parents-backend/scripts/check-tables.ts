import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  const tables = ['parents', 'students', 'parent_student_links', 'class_student_map', 'class_subject_teacher_map', 'staff_records'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t as any).select('*').limit(1);
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist') || error.code === '42P01') {
        console.log(`${t}: TABLE NOT FOUND`);
      } else {
        console.log(`${t}: ERROR - ${error.message}`);
      }
    } else {
      console.log(`${t}: EXISTS (${data?.length || 0} rows)`);
    }
  }
}
main();
