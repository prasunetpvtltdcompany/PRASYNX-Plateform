const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const orgs = await client.query('SELECT id, name FROM public.organisations LIMIT 5');
  console.log('Organisations:');
  orgs.rows.forEach(r => console.log(`  - ${r.id}: ${r.name}`));

  const teachers = await client.query('SELECT id, full_name, organisation_id FROM public.staff_records LIMIT 5');
  console.log('Teachers:');
  teachers.rows.forEach(r => console.log(`  - ${r.id}: ${r.full_name} (org: ${r.organisation_id})`));

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
