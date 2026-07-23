const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB. Starting WOS schema migration...');

  const query = `
    -- 1. Create STAFF PROFILES table
    CREATE TABLE IF NOT EXISTS public.staff_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
      employee_id TEXT UNIQUE NOT NULL,
      photo_url TEXT,
      full_name TEXT NOT NULL,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      employment_type TEXT NOT NULL CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')),
      reporting_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'DEACTIVATED')),
      qualification TEXT,
      salary NUMERIC(12,2),
      address JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Create STAFF ASSIGNMENTS table
    CREATE TABLE IF NOT EXISTS public.staff_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      assignment_type TEXT NOT NULL,
      assignment_name TEXT NOT NULL,
      assignment_reference_id TEXT,
      responsibility TEXT,
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      end_date DATE,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPLETED')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Create STAFF TASKS table
    CREATE TABLE IF NOT EXISTS public.staff_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED', 'OVERDUE')),
      deadline DATE NOT NULL,
      progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
      assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
      attachments JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 4. Create STAFF SCHEDULES table
    CREATE TABLE IF NOT EXISTS public.staff_schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      event_type TEXT NOT NULL CHECK (event_type IN ('TIMETABLE', 'ROUTE', 'SHIFT', 'APPOINTMENT', 'MEETING')),
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      is_recurring BOOLEAN DEFAULT false,
      recurrence_pattern TEXT,
      room_or_location TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 5. Create STAFF RESOURCES table
    CREATE TABLE IF NOT EXISTS public.staff_resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
      resource_type TEXT NOT NULL CHECK (resource_type IN ('CLASSROOM', 'LAB', 'VEHICLE', 'DEVICE', 'BUILDING', 'EQUIPMENT')),
      resource_name TEXT NOT NULL,
      serial_number TEXT,
      status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'ISSUED', 'RETURNED', 'DAMAGED', 'LOST', 'MAINTENANCE')),
      issued_at TIMESTAMPTZ,
      returned_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 6. Create STAFF PERMISSIONS table
    CREATE TABLE IF NOT EXISTS public.staff_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      module TEXT NOT NULL,
      actions JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(organisation_id, staff_id, module)
    );

    -- 7. Create STAFF PERFORMANCE table
    CREATE TABLE IF NOT EXISTS public.staff_performance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      score NUMERIC(5,2) CHECK (score BETWEEN 0 AND 100),
      kpi_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
      reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
      manager_feedback TEXT,
      review_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 8. Create STAFF ACTIVITY LOGS table
    CREATE TABLE IF NOT EXISTS public.staff_activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 9. Create STAFF LEAVE REQUESTS table
    CREATE TABLE IF NOT EXISTS public.staff_leave_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      leave_type TEXT NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'ANNUAL', 'PERSONAL', 'MATERNITY', 'OTHER')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
      reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 10. Create STAFF MESSAGES table
    CREATE TABLE IF NOT EXISTS public.staff_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      channel_name TEXT,
      recipient_id UUID,
      message_text TEXT NOT NULL,
      attachments JSONB DEFAULT '[]'::jsonb,
      read_by JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 11. Create STAFF NOTIFICATIONS table
    CREATE TABLE IF NOT EXISTS public.staff_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      notification_type TEXT NOT NULL CHECK (notification_type IN ('TASK', 'ASSIGNMENT', 'LEAVE', 'SYSTEM')),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 12. Create STAFF DOCUMENTS table
    CREATE TABLE IF NOT EXISTS public.staff_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      document_type TEXT NOT NULL CHECK (document_type IN ('CONTRACT', 'CERTIFICATE', 'ID_PROOF', 'TRAINING', 'POLICY', 'VERIFICATION')),
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
      folder TEXT NOT NULL DEFAULT 'General',
      tags JSONB DEFAULT '[]'::jsonb,
      version_history JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 13. Create STAFF WORKLOADS table
    CREATE TABLE IF NOT EXISTS public.staff_workloads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      staff_id UUID UNIQUE REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
      workload_percentage INT NOT NULL DEFAULT 0 CHECK (workload_percentage BETWEEN 0 AND 200),
      active_classes_count INT DEFAULT 0,
      active_tasks_count INT DEFAULT 0,
      active_routes_count INT DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Backfill staff_profiles from legacy teachers table
    INSERT INTO public.staff_profiles (id, organisation_id, user_id, employee_id, full_name, department, designation, employment_type, joining_date, status, qualification, salary, address)
    SELECT 
      id, 
      organisation_id, 
      user_id, 
      COALESCE(teacher_code, 'EMP-' || SUBSTRING(id::text, 1, 8)) AS employee_id, 
      full_name, 
      COALESCE(department, 'Academics') AS department, 
      COALESCE(designation, 'Teacher') AS designation, 
      CASE 
        WHEN employment_type = 'full_time' THEN 'FULL_TIME'
        WHEN employment_type = 'part_time' THEN 'PART_TIME'
        ELSE 'FULL_TIME'
      END AS employment_type,
      COALESCE(join_date, CURRENT_DATE) AS joining_date,
      CASE 
        WHEN status = 'active' THEN 'ACTIVE'
        WHEN status = 'inactive' THEN 'DEACTIVATED'
        ELSE 'ACTIVE'
      END AS status,
      qualification,
      salary,
      jsonb_build_object('street', address, 'city', city, 'state', state, 'zip', postal_code) AS address
    FROM public.teachers
    ON CONFLICT (user_id) DO NOTHING;

    -- Enable Row Level Security (RLS) on all WOS tables
    ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_resources ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_performance ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_activity_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_leave_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staff_workloads ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS org_isolation ON public.staff_profiles;
    DROP POLICY IF EXISTS org_isolation ON public.staff_assignments;
    DROP POLICY IF EXISTS org_isolation ON public.staff_tasks;
    DROP POLICY IF EXISTS org_isolation ON public.staff_schedules;
    DROP POLICY IF EXISTS org_isolation ON public.staff_resources;
    DROP POLICY IF EXISTS org_isolation ON public.staff_permissions;
    DROP POLICY IF EXISTS org_isolation ON public.staff_performance;
    DROP POLICY IF EXISTS org_isolation ON public.staff_activity_logs;
    DROP POLICY IF EXISTS org_isolation ON public.staff_leave_requests;
    DROP POLICY IF EXISTS org_isolation ON public.staff_messages;
    DROP POLICY IF EXISTS org_isolation ON public.staff_notifications;
    DROP POLICY IF EXISTS org_isolation ON public.staff_documents;
    DROP POLICY IF EXISTS org_isolation ON public.staff_workloads;

    -- Create RLS Policies
    CREATE POLICY org_isolation ON public.staff_profiles FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_assignments FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_tasks FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_schedules FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_resources FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_permissions FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_performance FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_activity_logs FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_leave_requests FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_messages FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_notifications FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_documents FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.staff_workloads FOR ALL USING (organisation_id = public.get_user_org_id());
  `;

  try {
    await client.query(query);
    console.log('Workforce schema tables, data backfill, and RLS policies created/updated successfully.');
  } catch (error) {
    console.error('Migration execution failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
