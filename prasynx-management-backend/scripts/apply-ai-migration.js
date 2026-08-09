const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const url = 'postgresql://postgres.gmqsgbrfnuwgnbutdizg:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';
const sql = fs.readFileSync('C:/Users/Lenovo/Desktop/PRASYNX-Plateform/supabase/migrations/20260809000030_ai_teaching_module.sql', 'utf8');
(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20000 });
  try {
    await c.connect();
    await c.query(sql);
    const r = await c.query("select table_name from information_schema.tables where table_schema='public' and table_name like 'ai_%' order by table_name");
    console.log('applied. tables:', r.rows.map(x => x.table_name).join(', '));
    await c.end();
  } catch (e) { console.error('ERR', e.message); try { await c.end(); } catch {} }
})();