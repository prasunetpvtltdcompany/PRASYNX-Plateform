-- Add payment method to payslips and flexible components to salary structure
ALTER TABLE public.staff_payslips
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'BANK';

ALTER TABLE public.staff_payroll
  ADD COLUMN IF NOT EXISTS components JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'staff_payslips_payment_method_check'
      AND conrelid = 'public.staff_payslips'::regclass
  ) THEN
    ALTER TABLE public.staff_payslips
      ADD CONSTRAINT staff_payslips_payment_method_check
      CHECK (payment_method IN ('CASH', 'BANK'));
  END IF;
END $$;