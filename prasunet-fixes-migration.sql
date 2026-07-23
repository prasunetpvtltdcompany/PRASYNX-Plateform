-- ============================================================================
-- PRASUNET ERP FIXES MIGRATION
-- Phase 0: Critical fixes for parents table, tenant isolation, schema cleanup
-- ============================================================================

-- ============================================================================
-- First, add missing updated_at columns to tables with BEFORE UPDATE triggers
-- that reference updated_at but are missing the column
-- ============================================================================
ALTER TABLE parents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- FIX 1: Add user_id to parents table (Phase 0.3)
-- ============================================================================
ALTER TABLE parents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);

-- Backfill existing parent records by matching email to users table
UPDATE parents p
SET user_id = u.id
FROM users u
WHERE u.email = p.email
  AND u.role = 'parent'
  AND p.user_id IS NULL;

-- Report unmatched records (run separately to check)
-- SELECT p.id, p.full_name, p.email FROM parents p WHERE p.user_id IS NULL;

-- ============================================================================
-- FIX 2: Rename profiles.organization_id to profiles.organisation_id
--         to match UK spelling used in all other tables
-- ============================================================================
ALTER TABLE public.profiles RENAME COLUMN organization_id TO organisation_id;

-- Update the trigger function to use correct column name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, organisation_id, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    (NEW.raw_user_meta_data ->> 'organisation_id')::UUID,
    true
  );
  RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX 3: Add user_id reference to parents insert on credential creation
--         in the parent_student_links table, add parents_id column to link to parents.id
-- ============================================================================
-- Add parents_id column to parent_student_links
ALTER TABLE parent_student_links ADD COLUMN IF NOT EXISTS parents_id UUID REFERENCES parents(id) ON DELETE CASCADE;

-- Backfill parents_id by matching parent email
UPDATE parent_student_links
SET parents_id = p.id
FROM parents p
WHERE p.email = (
  SELECT u.email FROM users u WHERE u.id = parent_student_links.parent_id
);

-- ============================================================================
-- FIX 4: Add class_id FK column to students table (Phase 2.2)
--         students.student_class stores class name as text; add proper FK
-- ============================================================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- Backfill class_id by matching student_class name to classes.name
UPDATE students s
SET class_id = c.id
FROM classes c
WHERE c.organisation_id = s.organisation_id
  AND c.name = s.student_class
  AND s.class_id IS NULL;

-- ============================================================================
-- FIX 5: Add missing indexes for query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organisation_role ON users(organisation_id, role);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_parents_org ON parents(organisation_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_classes_org ON classes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_teachers_org ON teachers(organisation_id);

-- ============================================================================
-- FIX 6: Create audit_logs table for middleware audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  method TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  status_code INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
