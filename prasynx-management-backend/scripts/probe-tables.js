const { Client } = require('pg');
const url = 'postgresql://postgres:Prasunet123*@db.gmqsgbrfnuwgnbutdizg.supabase.co:5432/postgres';
(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20000 });
  try {
    await c.connect();
    const r = await c.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('teachers','staff_records','staff_members','subjects','classes','organisations','ai_assistants') order by table_name");
    console.log('existing:', r.rows.map(x => x.table_name).join(', '));
    const cols = await c.query("select table_name, column_name from information_schema.columns where table_schema='public' and table_name = 'staff_records' order by ordinal_position limit 40");
    console.log('staff_records cols:');
    cols.rows.forEach(x => console.log(' ', x.data_name));
    await c.end();
  } catch (e) { console.error('ERR', e.message); try { await c.end(); } catch {} }
})();