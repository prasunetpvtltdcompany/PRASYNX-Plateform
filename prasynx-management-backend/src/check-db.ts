const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:[YOUR-PASSWORD]@db.gmqsgbrfnuwgnbutdizg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'staff_records'
    ORDER BY column_name
  `);
  console.log('Columns in "staff_records" table:');
  res.rows.forEach((row: any) => {
    console.log(`- ${row.column_name}: ${row.data_type}`);
  });
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
