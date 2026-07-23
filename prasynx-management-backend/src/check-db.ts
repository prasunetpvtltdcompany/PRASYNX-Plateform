const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'teachers'
    ORDER BY column_name
  `);
  console.log('Columns in "teachers" table:');
  res.rows.forEach((row: any) => {
    console.log(`- ${row.column_name}: ${row.data_type}`);
  });
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
