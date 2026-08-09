const { Client } = require('pg');
const conns = [
  { name: 'axwhtngxveaidbscsrca (script default)', url: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' },
  { name: 'gmqsgbrfnuwgnbutdizg (SUPABASE_URL)', url: 'postgresql://postgres.gmqsgbrfnuwgnbutdizg:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres' },
  { name: 'gmqsgbrfnuwgnbutdizg direct', url: 'postgresql://postgres:Prasunet123*@db.gmqsgbrfnuwgnbutdizg.supabase.co:5432/postgres' },
];
async function main() {
  for (const c of conns) {
    const client = new Client({ connectionString: c.url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
    try {
      await client.connect();
      const r = await client.query("select current_database() db, (select count(*) from information_schema.tables where table_name='notifications') notif_tables, (select count(*) from information_schema.tables where table_name='users') users_tables");
      console.log(`OK  ${c.name} -> db=${r.rows[0].db} notifications=${r.rows[0].notif_tables} users=${r.rows[0].users_tables}`);
      await client.end();
    } catch (e) {
      console.log(`ERR ${c.name} -> ${e.message}`);
      try { await client.end(); } catch {}
    }
  }
}
main();
