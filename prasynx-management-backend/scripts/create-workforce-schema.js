const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Starting workforce system database migration...');

  const query = `
    -- 1. Create ROLES Table
    CREATE TABLE IF NOT EXISTS public.roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      is_system BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Create PERMISSIONS Table
    CREATE TABLE IF NOT EXISTS public.permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(organisation_id, module, action)
    );

    -- 3. Create ROLE_PERMISSIONS Table
    CREATE TABLE IF NOT EXISTS public.role_permissions (
      role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
      permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (role_id, permission_id)
    );

    -- 4. Create WORKFORCE_ASSIGNMENTS Table (Generic Assignments System)
    CREATE TABLE IF NOT EXISTS public.workforce_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES public.staff_records(id) ON DELETE CASCADE,
      assignment_type TEXT NOT NULL CHECK (assignment_type IN (
        'CLASS', 'SUBJECT', 'SECTION', 'DEPARTMENT', 'VEHICLE', 'ROUTE', 
        'BUILDING', 'FLOOR', 'HOSTEL', 'SPORTS_TEAM', 'LIBRARY', 'LAB', 
        'FINANCE_MODULE', 'TRANSPORT_MODULE'
      )),
      assignment_reference_id TEXT NOT NULL,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPLETED')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 5. Create ROLE_AUDIT_LOGS Table if not exists
    CREATE TABLE IF NOT EXISTS public.role_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 6. Enable Row Level Security (RLS)
    ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.workforce_assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

    -- 7. Add org isolation RLS policies
    DROP POLICY IF EXISTS org_isolation ON public.roles;
    CREATE POLICY org_isolation ON public.roles
      FOR ALL USING (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS org_isolation ON public.permissions;
    CREATE POLICY org_isolation ON public.permissions
      FOR ALL USING (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS org_isolation ON public.role_permissions;
    CREATE POLICY org_isolation ON public.role_permissions
      FOR ALL USING (
        role_id IN (
          SELECT r.id FROM public.roles r WHERE r.organisation_id = public.get_user_org_id()
        )
      );

    DROP POLICY IF EXISTS org_isolation ON public.workforce_assignments;
    CREATE POLICY org_isolation ON public.workforce_assignments
      FOR ALL USING (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS org_isolation ON public.role_audit_logs;
    CREATE POLICY org_isolation ON public.role_audit_logs
      FOR ALL USING (organisation_id = public.get_user_org_id());
  `;

  try {
    await client.query(query);
    console.log('Workforce schema tables and RLS policies created successfully.');

    // Seed default permissions for each organisation in the DB
    const orgsRes = await client.query('SELECT id FROM public.organisations');
    console.log(`Seeding permissions and system roles for ${orgsRes.rows.length} organisations...`);

    const modules = [
      'attendance', 'homework', 'classes', 'subjects', 'marks', 
      'fees', 'payroll', 'transport', 'library', 'inventory', 
      'medical', 'sports', 'security', 'workforce'
    ];
    const actions = ['read', 'write', 'delete', 'manage'];

    for (const org of orgsRes.rows) {
      const orgId = org.id;

      // Seed permissions for this organization
      for (const mod of modules) {
        for (const act of actions) {
          await client.query(`
            INSERT INTO public.permissions (organisation_id, organization_id, module, action)
            VALUES ($1, $1, $2, $3)
            ON CONFLICT (organisation_id, module, action) DO NOTHING
          `, [orgId, mod, act]);
        }
      }

      // Create default System Roles
      const systemRoles = [
        { name: 'Teacher', desc: 'Default teacher role with academic capabilities' },
        { name: 'Principal', desc: 'School head role with all academic and administrative viewing access' },
        { name: 'Accountant', desc: 'Finance role with fees, payroll and expense management access' },
        { name: 'Librarian', desc: 'Library administration role' },
        { name: 'Driver', desc: 'Transport operations and bus route viewing role' },
        { name: 'Security Guard', desc: 'Campus security and visitor tracking role' },
        { name: 'Housekeeping', desc: 'Cleaning tasks and facilities maintenance role' },
        { name: 'Nurse', desc: 'Medical operations and student health record role' },
        { name: 'Sports Coach', desc: 'Extracurricular and athletic training manager role' }
      ];

      for (const r of systemRoles) {
        // Insert Role
        const roleInsert = await client.query(`
          INSERT INTO public.roles (organisation_id, organization_id, name, description, is_system)
          VALUES ($1, $1, $2, $3, true)
          ON CONFLICT DO NOTHING
          RETURNING id
        `, [orgId, r.name, r.desc]);

        if (roleInsert.rows.length > 0) {
          const roleId = roleInsert.rows[0].id;
          
          // Map default permissions based on role name
          let allowedModules = [];
          if (r.name === 'Teacher') {
            allowedModules = ['attendance', 'homework', 'classes', 'subjects', 'marks'];
          } else if (r.name === 'Principal') {
            allowedModules = ['attendance', 'homework', 'classes', 'subjects', 'marks', 'fees', 'payroll', 'transport', 'library', 'inventory', 'medical', 'sports', 'security', 'workforce'];
          } else if (r.name === 'Accountant') {
            allowedModules = ['fees', 'payroll', 'inventory'];
          } else if (r.name === 'Librarian') {
            allowedModules = ['library'];
          } else if (r.name === 'Driver') {
            allowedModules = ['transport'];
          } else if (r.name === 'Security Guard') {
            allowedModules = ['security'];
          } else if (r.name === 'Housekeeping') {
            allowedModules = ['inventory'];
          } else if (r.name === 'Nurse') {
            allowedModules = ['medical'];
          } else if (r.name === 'Sports Coach') {
            allowedModules = ['sports'];
          }

          // Fetch all matching permissions for these modules
          const perms = await client.query(`
            SELECT id FROM public.permissions 
            WHERE organisation_id = $1 AND module = ANY($2)
          `, [orgId, allowedModules]);

          for (const perm of perms.rows) {
            await client.query(`
              INSERT INTO public.role_permissions (role_id, permission_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [roleId, perm.id]);
          }
        }
      }
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
