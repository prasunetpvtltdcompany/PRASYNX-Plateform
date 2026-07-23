const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const sqlPath = path.join(__dirname, '..', '..', 'gamification-schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

pool.query(sql, (err) => {
  if (err) { console.error('SQL error:', err.message); process.exit(1); }
  console.log('Gamification schema created successfully');
  pool.end();
});
