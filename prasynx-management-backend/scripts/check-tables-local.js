const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const tables = ['roles', 'permissions', 'role_permissions', 'assignments', 'workforce_assignments', 'staff_assignments'];
  for (const table of tables) {
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [table]);
    const exists = res.rows[0].exists;
    console.log(`Table "${table}" exists: ${exists}`);
    
    if (exists) {
      const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      console.log(`Columns for "${table}":`);
      cols.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
  }
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
