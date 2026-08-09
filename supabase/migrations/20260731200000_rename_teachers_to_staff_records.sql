-- Rename teachers → staff_records (unified staff table for teaching + non-teaching staff)
-- Add role column, drop teacher_code in favour of staff_unique_id as canonical employee ID.
-- Safe to run on existing projects. RLS policies follow the renamed table automatically.

DO $$
BEGIN
  IF to_regclass('public.teachers') IS NOT NULL AND to_regclass('public.staff_records') IS NULL THEN
    ALTER TABLE public.teachers RENAME TO staff_records;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.staff_records ADD COLUMN IF NOT EXISTS role TEXT;

-- Backfill role from users where available
UPDATE public.staff_records sr
SET role = u.role
FROM public.users u
WHERE sr.user_id = u.id AND (sr.role IS NULL OR sr.role = '');

UPDATE public.staff_records SET role = 'staff' WHERE role IS NULL OR role = '';

-- Preserve legacy employee IDs before dropping teacher_code
UPDATE public.staff_records
SET staff_unique_id = teacher_code
WHERE staff_unique_id IS NULL AND teacher_code IS NOT NULL;

-- Drop legacy teacher_code constraints/column
ALTER TABLE IF EXISTS public.staff_records DROP CONSTRAINT IF EXISTS teachers_teacher_code_key;
ALTER TABLE IF EXISTS public.staff_records DROP CONSTRAINT IF EXISTS teachers_teacher_code_org_key;
DROP INDEX IF EXISTS idx_teachers_org_code;

-- Rename remaining objects for consistency (best-effort, existence-guarded)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'staff_records' AND indexname = 'idx_teachers_org') THEN
    ALTER INDEX idx_teachers_org RENAME TO idx_staff_records_org;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'staff_records' AND indexname = 'idx_teachers_unique_id') THEN
    ALTER INDEX idx_teachers_unique_id RENAME TO idx_staff_records_org_unique_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.staff_records'::regclass AND conname = 'teachers_pkey') THEN
    ALTER TABLE public.staff_records RENAME CONSTRAINT teachers_pkey TO staff_records_pkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.staff_records'::regclass AND conname = 'teachers_user_id_fkey') THEN
    ALTER TABLE public.staff_records RENAME CONSTRAINT teachers_user_id_fkey TO staff_records_user_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.staff_records'::regclass AND conname = 'teachers_organisation_id_fkey') THEN
    ALTER TABLE public.staff_records RENAME CONSTRAINT teachers_organisation_id_fkey TO staff_records_organisation_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.staff_records'::regclass AND conname = 'teachers_assigned_class_fkey') THEN
    ALTER TABLE public.staff_records RENAME CONSTRAINT teachers_assigned_class_fkey TO staff_records_assigned_class_fkey;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.staff_records DROP COLUMN IF EXISTS teacher_code;
