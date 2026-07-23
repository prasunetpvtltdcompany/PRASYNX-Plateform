-- ============================================================================
-- PRASYNX MULTI-TENANT AUTH SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ORGANIZATIONS (schools, colleges, institutes, academies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'school' CHECK (type IN ('school','college','institute','academy','other')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. PROFILES (linked to auth.users, all users have a profile)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','management','student','staff','parent','job_provider')),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. MANAGEMENT ACCOUNTS (created by admin, linked to organization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.management_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  designation TEXT DEFAULT 'Principal',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. STUDENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  roll_number TEXT,
  class TEXT,
  section TEXT,
  admission_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. STAFF
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id TEXT,
  department TEXT,
  designation TEXT,
  subject TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. PARENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. PARENT-STUDENT RELATIONSHIPS (supports multiple children)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.parent_student_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent','guardian','other')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- ============================================================================
-- 8. JOB PROVIDERS (independent, not tied to any organization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.job_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 9. AUDIT TRAIL
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  fail_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  refresh_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.password_reset_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  reset_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 10. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_students_organization ON public.students(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_organization ON public.staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_parents_organization ON public.parents(organization_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student ON public.parent_student_relationships(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON public.parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_user ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_management_accounts_org ON public.management_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);

-- ============================================================================
-- 11. TRIGGER: AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, organization_id, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    (NEW.raw_user_meta_data ->> 'organization_id')::UUID,
    true
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 12. TRIGGER: UPDATE updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_parents_updated_at BEFORE UPDATE ON public.parents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_management_accounts_updated_at BEFORE UPDATE ON public.management_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_job_providers_updated_at BEFORE UPDATE ON public.job_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 13. ROW LEVEL SECURITY — ORGANIZATION ISOLATION
-- ============================================================================

-- ---------- PROFILES ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin can read ALL profiles
CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Management can read profiles in their own organization
CREATE POLICY "Management can read org profiles"
  ON public.profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'management')
  );

-- Staff can read profiles in their own organization
CREATE POLICY "Staff can read org profiles"
  ON public.profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff WHERE user_id = auth.uid()
    )
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff')
  );

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------- ORGANIZATIONS ----------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Admin can read all organizations
CREATE POLICY "Admin can read all organizations"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Management can read their own organization
CREATE POLICY "Management can read own organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- Staff can read their own organization
CREATE POLICY "Staff can read own organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.staff WHERE user_id = auth.uid()
    )
  );

-- Students can read their own organization
CREATE POLICY "Students can read own organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.students WHERE user_id = auth.uid()
    )
  );

-- Parents can read their own organization
CREATE POLICY "Parents can read own organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.parents WHERE user_id = auth.uid()
    )
  );

-- Only admin can insert/update/delete organizations
CREATE POLICY "Admin can insert organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete organizations"
  ON public.organizations FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------- STUDENTS ----------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Students can view own record
CREATE POLICY "Students can view own record"
  ON public.students FOR SELECT
  USING (user_id = auth.uid());

-- Management can read all students in their org
CREATE POLICY "Management can read org students"
  ON public.students FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- Staff can read all students in their org
CREATE POLICY "Staff can read org students"
  ON public.students FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff WHERE user_id = auth.uid()
    )
  );

-- Parents can read their linked children
CREATE POLICY "Parents can read linked children"
  ON public.students FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM public.parent_student_relationships
      WHERE parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
    )
  );

-- Admin can read all students
CREATE POLICY "Admin can read all students"
  ON public.students FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Management can insert/update/delete students in their org
CREATE POLICY "Management can insert students"
  ON public.students FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Management can update org students"
  ON public.students FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Management can delete org students"
  ON public.students FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- ---------- STAFF ----------
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Staff can view own record
CREATE POLICY "Staff can view own record"
  ON public.staff FOR SELECT
  USING (user_id = auth.uid());

-- Management can read all staff in their org
CREATE POLICY "Management can read org staff"
  ON public.staff FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- Staff can read all staff in their org
CREATE POLICY "Staff can read org staff"
  ON public.staff FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff WHERE user_id = auth.uid()
    )
  );

-- Admin can read all staff
CREATE POLICY "Admin can read all staff"
  ON public.staff FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Management can insert/update/delete staff in their org
CREATE POLICY "Management can insert staff"
  ON public.staff FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Management can update org staff"
  ON public.staff FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Management can delete org staff"
  ON public.staff FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- ---------- PARENTS ----------
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- Parents can view own record
CREATE POLICY "Parents can view own record"
  ON public.parents FOR SELECT
  USING (user_id = auth.uid());

-- Management can read all parents in their org
CREATE POLICY "Management can read org parents"
  ON public.parents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- Admin can read all parents
CREATE POLICY "Admin can read all parents"
  ON public.parents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Management can insert/update/delete parents in their org
CREATE POLICY "Management can insert parents"
  ON public.parents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Management can update org parents"
  ON public.parents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Management can delete org parents"
  ON public.parents FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- ---------- PARENT-STUDENT RELATIONSHIPS ----------
ALTER TABLE public.parent_student_relationships ENABLE ROW LEVEL SECURITY;

-- Parents can view their own relationships
CREATE POLICY "Parents can view own relationships"
  ON public.parent_student_relationships FOR SELECT
  USING (
    parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
  );

-- Management can view all relationships in their org
CREATE POLICY "Management can view org relationships"
  ON public.parent_student_relationships FOR SELECT
  USING (
    parent_id IN (SELECT id FROM public.parents WHERE organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    ))
  );

-- ---------- MANAGEMENT ACCOUNTS ----------
ALTER TABLE public.management_accounts ENABLE ROW LEVEL SECURITY;

-- Management can view own record
CREATE POLICY "Management can view own record"
  ON public.management_accounts FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all management accounts
CREATE POLICY "Admin can read all management accounts"
  ON public.management_accounts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admin can insert/update/delete management accounts
CREATE POLICY "Admin can insert management accounts"
  ON public.management_accounts FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update management accounts"
  ON public.management_accounts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete management accounts"
  ON public.management_accounts FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------- JOB PROVIDERS ----------
ALTER TABLE public.job_providers ENABLE ROW LEVEL SECURITY;

-- Job providers can view own record
CREATE POLICY "Job providers can view own record"
  ON public.job_providers FOR SELECT
  USING (user_id = auth.uid());

-- Job providers can update own record
CREATE POLICY "Job providers can update own record"
  ON public.job_providers FOR UPDATE
  USING (user_id = auth.uid());

-- Admin can read all job providers
CREATE POLICY "Admin can read all job providers"
  ON public.job_providers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------- AUDIT LOGS ----------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin can read all audit logs
CREATE POLICY "Admin can read all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Management can read audit logs for their org
CREATE POLICY "Management can read org audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.management_accounts WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can insert audit logs
CREATE POLICY "Users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ---------- LOGIN LOGS ----------
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Admin can read all login logs
CREATE POLICY "Admin can read all login logs"
  ON public.login_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can read their own login logs
CREATE POLICY "Users can read own login logs"
  ON public.login_logs FOR SELECT
  USING (user_id = auth.uid());

-- Authenticated users can insert login logs
CREATE POLICY "Users can insert login logs"
  ON public.login_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ---------- SESSIONS ----------
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Users can read own sessions
CREATE POLICY "Users can read own sessions"
  ON public.sessions FOR SELECT
  USING (user_id = auth.uid());

-- Admin can read all sessions
CREATE POLICY "Admin can read all sessions"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------- PASSWORD RESET LOGS ----------
ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

-- Admin can read all password reset logs
CREATE POLICY "Admin can read all reset logs"
  ON public.password_reset_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can read own reset logs
CREATE POLICY "Users can read own reset logs"
  ON public.password_reset_logs FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- 14. HELPER FUNCTIONS
-- ============================================================================

-- Get current user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Check if current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = required_role
  );
$$;

-- Create admin user function (call from seed or admin setup)
CREATE OR REPLACE FUNCTION public.create_admin_user(admin_email TEXT, admin_password TEXT, admin_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users
  new_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    new_user_id,
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', admin_name, 'role', 'admin')
  );
  
  -- Profile is auto-created by trigger, update role
  UPDATE public.profiles SET role = 'admin', full_name = admin_name WHERE id = new_user_id;
  
  RETURN new_user_id;
END;
$$;
