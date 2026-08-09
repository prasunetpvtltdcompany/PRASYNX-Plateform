-- staff_tasks enhancements: task type, start date, location
ALTER TABLE public.staff_tasks
  ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS location TEXT;