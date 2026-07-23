const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log(res.rows.map(r => r.table_name).join('\n'));
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
