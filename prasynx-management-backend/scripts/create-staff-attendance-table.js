const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB. Starting staff_attendance schema migration...');

  const query = `
    -- Create staff_attendance table
    CREATE TABLE IF NOT EXISTS public.staff_attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      organization_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      attendance_date DATE NOT NULL,
      check_in TIME,
      check_out TIME,
      working_hours DECIMAL(5,2),
      status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Holiday', 'Work From Home', 'Official Duty', 'Training')),
      remarks TEXT,
      marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
      approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(organisation_id, staff_id, attendance_date)
    );

    -- Enable RLS
    ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

    -- Add org isolation policies
    DROP POLICY IF EXISTS org_isolation ON public.staff_attendance;
    CREATE POLICY org_isolation ON public.staff_attendance
      FOR ALL USING (organisation_id = public.get_user_org_id());

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_staff_attendance_org ON public.staff_attendance(organisation_id);
    CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON public.staff_attendance(staff_id);
    CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON public.staff_attendance(attendance_date);
    CREATE INDEX IF NOT EXISTS idx_staff_attendance_status ON public.staff_attendance(status);
  `;

  try {
    await client.query(query);
    console.log('staff_attendance table successfully created with RLS enabled and indexes created.');
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
