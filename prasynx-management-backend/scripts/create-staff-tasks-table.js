const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB. Starting staff_tasks schema migration...');

  const query = `
    -- Create staff_tasks table
    CREATE TABLE IF NOT EXISTS public.staff_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
      deadline DATE,
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;

    -- Add org isolation policies
    DROP POLICY IF EXISTS org_isolation ON public.staff_tasks;
    CREATE POLICY org_isolation ON public.staff_tasks
      FOR ALL USING (organisation_id = public.get_user_org_id());
  `;

  try {
    await client.query(query);
    console.log('staff_tasks table successfully created with RLS enabled.');
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
