const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB. Adding updated_by column to staff_attendance...');

  const query = `
    ALTER TABLE public.staff_attendance
    ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_staff_attendance_updated_by ON public.staff_attendance(updated_by);
  `;

  try {
    await client.query(query);
    console.log('staff_attendance.updated_by column added successfully.');
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
