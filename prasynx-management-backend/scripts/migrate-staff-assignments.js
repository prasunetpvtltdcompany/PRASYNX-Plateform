const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB. Starting staff_assignments schema migration...');

  const query = `
    -- Drop existing table
    DROP TABLE IF EXISTS public.staff_assignments CASCADE;

    -- Create staff_assignments table matching the new spec
    CREATE TABLE public.staff_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES public.staff_records(id) ON DELETE CASCADE,
      assignment_type TEXT NOT NULL,
      assignment_name TEXT NOT NULL,
      assignment_reference_id TEXT,
      responsibility TEXT, -- Stores responsibilities (e.g. comma-separated or JSON list)
      start_date DATE DEFAULT NOW(),
      end_date DATE,
      status TEXT DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

    -- Add org isolation policies
    DROP POLICY IF EXISTS org_isolation ON public.staff_assignments;
    CREATE POLICY org_isolation ON public.staff_assignments
      FOR ALL USING (organisation_id = public.get_user_org_id());
  `;

  try {
    await client.query(query);
    console.log('staff_assignments table successfully created/recreated with RLS enabled.');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
