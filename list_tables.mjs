import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
});

await client.connect();

const res = await client.query(`
  SELECT
    tablename,
    tableowner,
    CASE
      WHEN tablename LIKE '\\_%' THEN 'likely system'
      WHEN tablename IN ('schema_migrations', '_prisma_migrations', 'knex_migrations',
                         'django_migrations', 'alembic_version', 'sqlite_sequence',
                         'spatial_ref_sys', 'geography_columns', 'geometry_columns')
        THEN 'likely migration/system'
      WHEN tablename ~ '^[a-z]+_' OR tablename IN ('users','profiles','accounts','sessions',
             'verification_tokens','audit_log_entries','refresh_tokens')
        THEN 'likely user-data'
      ELSE 'unknown'
    END AS classification
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`);

console.table(res.rows);

await client.end();
