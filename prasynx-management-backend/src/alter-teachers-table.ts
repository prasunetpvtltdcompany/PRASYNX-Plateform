const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Altering teachers table to add missing columns...');
  
  const query = `
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS staff_unique_id TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS designation TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS experience_years INTEGER;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS gender TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS country TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS postal_code TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS salary NUMERIC(10,2);
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS employment_type TEXT;
    ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS reporting_manager TEXT;
  `;

  await client.query(query);
  console.log('Teachers table altered successfully.');
  
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'teachers'
    ORDER BY column_name
  `);
  console.log('Updated columns in "teachers" table:');
  res.rows.forEach((row: any) => {
    console.log(`- ${row.column_name}: ${row.data_type}`);
  });

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
