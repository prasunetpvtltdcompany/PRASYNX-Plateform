-- staff_leave_requests: add paid/unpaid category
ALTER TABLE public.staff_leave_requests
  ADD COLUMN IF NOT EXISTS leave_category TEXT NOT NULL DEFAULT 'PAID'
  CHECK (leave_category IN ('PAID', 'UNPAID'));