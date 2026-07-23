-- Workforce Management System Tables
-- Extends existing staff management with enterprise-grade tables

-- Staff Departments
CREATE TABLE IF NOT EXISTS staff_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Designations
CREATE TABLE IF NOT EXISTS staff_designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'academic',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Attendance (for staff, not students)
CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'ON_LEAVE', 'LATE', 'HALF_DAY')),
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  remarks TEXT,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- Staff Attendance Corrections
CREATE TABLE IF NOT EXISTS staff_attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES staff_attendance(id) ON DELETE CASCADE,
  original_status TEXT,
  requested_status TEXT,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Assignments (Work Assignments)
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT NOT NULL DEFAULT 'academic' CHECK (assignment_type IN ('academic', 'administrative', 'committee', 'event', 'project', 'special')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED')),
  start_date DATE,
  deadline DATE,
  department_id UUID REFERENCES staff_departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Performance
CREATE TABLE IF NOT EXISTS staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  score INTEGER DEFAULT 0,
  kpi_metrics JSONB DEFAULT '{}',
  manager_feedback TEXT,
  review_date DATE DEFAULT CURRENT_DATE,
  review_period TEXT DEFAULT 'MONTHLY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Leave Balance
CREATE TABLE IF NOT EXISTS staff_leave_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  total_days INTEGER DEFAULT 0,
  used_days INTEGER DEFAULT 0,
  pending_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, leave_type)
);

-- Staff Training
CREATE TABLE IF NOT EXISTS staff_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  trainer TEXT,
  start_date DATE,
  end_date DATE,
  duration TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED')),
  participant_count INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Certifications
CREATE TABLE IF NOT EXISTS staff_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issued_by TEXT,
  issued_date DATE,
  expiry_date DATE,
  file_url TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Roles
CREATE TABLE IF NOT EXISTS staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Role Permissions
CREATE TABLE IF NOT EXISTS staff_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES staff_roles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  can_view BOOLEAN DEFAULT TRUE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Requests
CREATE TABLE IF NOT EXISTS staff_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('leave', 'resource', 'document', 'approval', 'transport', 'it_support')),
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Recruitment
CREATE TABLE IF NOT EXISTS staff_recruitment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES staff_departments(id),
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED', 'FILLED')),
  applicants INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Exits
CREATE TABLE IF NOT EXISTS staff_exits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exit_date DATE,
  exit_type TEXT DEFAULT 'voluntary' CHECK (exit_type IN ('voluntary', 'involuntary', 'retirement', 'transfer')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Alumni
CREATE TABLE IF NOT EXISTS staff_alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  last_designation TEXT,
  last_department TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Payroll
CREATE TABLE IF NOT EXISTS staff_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  base_salary DECIMAL(12, 2) DEFAULT 0,
  allowances DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2) DEFAULT 0,
  pay_frequency TEXT DEFAULT 'MONTHLY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Payslips
CREATE TABLE IF NOT EXISTS staff_payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  gross_pay DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_pay DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Circulars
CREATE TABLE IF NOT EXISTS staff_circulars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Settings
CREATE TABLE IF NOT EXISTS staff_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organization_profiles(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  working_days TEXT DEFAULT 'Monday-Saturday',
  auto_mark_absent_after TEXT DEFAULT '1 hour',
  half_day_after TEXT DEFAULT '4 hours',
  biometric_integrated BOOLEAN DEFAULT FALSE,
  allow_self_registration BOOLEAN DEFAULT FALSE,
  require_admin_approval BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_leave_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_recruitment ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_exits ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Organization-scoped access
CREATE POLICY org_isolation ON staff_departments FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_designations FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_attendance FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_attendance_corrections FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_assignments FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_performance FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_leave_balance FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_training FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_certifications FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_roles FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_role_permissions FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_requests FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_recruitment FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_exits FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_alumni FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_payroll FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_payslips FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_circulars FOR ALL USING (organisation_id = auth.uid()::text::uuid);
CREATE POLICY org_isolation ON staff_settings FOR ALL USING (organisation_id = auth.uid()::text::uuid);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_departments_org ON staff_departments(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_org_date ON staff_attendance(organisation_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_org ON staff_assignments(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_org ON staff_performance(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_requests_org ON staff_requests(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_balance_org ON staff_leave_balance(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_org ON staff_certifications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_org ON staff_roles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_payroll_org ON staff_payroll(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_payslips_org ON staff_payslips(organisation_id);
