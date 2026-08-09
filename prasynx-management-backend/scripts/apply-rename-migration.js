const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const conn = process.env.DATABASE_URL || process.env.DB_URL;
  if (!conn) {
    console.error('No DATABASE_URL found. Pass it inline: set DATABASE_URL=postgresql://... node apply-rename-migration.js');
    process.exit(1);
  }

  const sqlPath = process.argv[2] || path.resolve(__dirname, '../../supabase/migrations/20260731200000_rename_teachers_to_staff_records.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query('BEGIN');
    const res = await client.query(sql);
    await client.query('COMMIT');
    console.log(`Migration applied OK. Affected rows: ${res.rowCount}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration FAILED, rolled back:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
