import { supabase } from './src/config/database';

async function main() {
  const { data: links } = await supabase.from('parent_student_links').select('*').limit(5);
  console.log('links:', JSON.stringify(links));

  if (links && links.length) {
    const { data: users } = await supabase.from('users').select('id,email,role,organisation_id').eq('id', links[0].parent_id);
    console.log('parent user:', JSON.stringify(users));
    const { data: students } = await supabase.from('students').select('id,full_name').eq('id', links[0].student_id);
    console.log('student:', JSON.stringify(students));
  }
}
main();
