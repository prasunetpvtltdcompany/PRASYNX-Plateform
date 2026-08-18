-- organisation_plans: add plan / billing / contact / configuration fields to organisations.
-- The main `organisations` table predates this repo's migration history (created manually /
-- in the base Supabase schema), so this migration only ADDs the columns needed by the
-- admin-panel "Add Organization" flow.

ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan IN ('starter', 'growth', 'professional', 'premium', 'enterprise')),
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'yearly'
    CHECK (billing_cycle IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS plan_price NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS student_capacity INTEGER NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS max_admins INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS secondary_email TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS modules JSONB NOT NULL DEFAULT '["management","staff","student","parent"]'::jsonb;

-- Backfill: every existing school keeps working with sensible defaults.
UPDATE public.organisations
SET billing_cycle = 'yearly', student_capacity = 500, max_admins = 2
WHERE billing_cycle IS NULL OR student_capacity IS NULL OR max_admins IS NULL;
