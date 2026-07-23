-- Add workforce management columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES staff_departments(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation_id UUID REFERENCES staff_designations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive', 'terminated'));

-- Add created_at to users if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for faster organization queries
CREATE INDEX IF NOT EXISTS idx_users_org_status ON users(organisation_id, status);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_designation ON users(designation);
