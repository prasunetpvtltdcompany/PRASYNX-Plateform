-- drop_organisation_plan_columns: plan/billing data now lives in `subscriptions`
-- (per-org plan_key/cycle/amount) and `subscription_plans` (prices & limits).
-- This migration is self-contained: it ensures the billing tables + backfill exist
-- before dropping the now-redundant plan columns from `organisations`.

-- Ensure the billing tables exist (idempotent with 20260815020000_billing_subscriptions.sql)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  yearly_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  student_capacity INTEGER NOT NULL DEFAULT 500,
  max_admins INTEGER NOT NULL DEFAULT 2,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL UNIQUE REFERENCES public.organisations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_key TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'yearly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'failed', 'void')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the India pricing catalog (only if the key does not exist yet — never
-- overwrite prices that are already set in the live database).
INSERT INTO public.subscription_plans
  (plan_key, name, description, currency, monthly_price, yearly_price,
   student_capacity, max_admins, features, sort_order) VALUES
('starter', 'Starter', 'For small single-campus schools', 'INR', 7999, 89999, 200, 2,
 '["Up to 200 students","2 admin accounts","Management portal","Basic analytics","Email support"]'::jsonb, 1),
('growth', 'Growth', 'For growing schools with staff & fee management', 'INR', 9999, 99999, 500, 5,
 '["Up to 500 students","5 admin accounts","Staff portal","Fees & finance module","Email + chat support"]'::jsonb, 2),
('professional', 'Professional', 'Most popular for mid-size schools', 'INR', 14999, 149999, 1000, 15,
 '["Up to 1,000 students","15 admin accounts","Student & parent portals","Exams & report cards","Priority support"]'::jsonb, 3),
('premium', 'Premium', 'For large institutions & chains', 'INR', 24999, 259999, 2000, 25,
 '["Up to 2,000 students","25 admin accounts","All portals + AI insights","Transport & hostel modules","SSO + API access"]'::jsonb, 4),
('enterprise', 'Enterprise', 'Custom solution for groups & boards', 'INR', 0, 0, 100000, 1000,
 '["Unlimited students","Unlimited admin accounts","Custom integrations","Dedicated success manager","On-prem / private cloud"]'::jsonb, 5)
ON CONFLICT (plan_key) DO NOTHING;

-- Backfill subscriptions for any organisation still missing one (defaults to Starter/yearly at catalog price)
INSERT INTO public.subscriptions
  (organisation_id, plan_key, status, billing_cycle, amount, currency, auto_renew, start_date, current_period_start)
SELECT o.id, COALESCE(sp.plan_key, 'starter'), 'active', 'yearly',
       COALESCE(sp.yearly_price, 0), 'INR', true, o.created_at, o.created_at
FROM public.organisations o
LEFT JOIN public.subscription_plans sp ON sp.plan_key = 'starter'
ON CONFLICT (organisation_id) DO NOTHING;

-- Current-period invoice per active subscription with an amount
INSERT INTO public.invoices
  (organisation_id, subscription_id, invoice_number, amount, currency, status, issue_date, due_date, items)
SELECT s.organisation_id, s.id,
  'INV-' || UPPER(SUBSTRING(REPLACE(s.id::text, '-', ''), 1, 6)),
  s.amount, s.currency, 'paid', CURRENT_DATE - 15, CURRENT_DATE - 5,
  jsonb_build_array(jsonb_build_object(
    'description', 'Subscription – ' || COALESCE(sp.name, s.plan_key),
    'amount', s.amount,
    'period', to_char(CURRENT_DATE, 'Mon YYYY')
  ))
FROM public.subscriptions s
LEFT JOIN public.subscription_plans sp ON sp.id = s.plan_id
WHERE s.status = 'active' AND s.amount > 0
ON CONFLICT (invoice_number) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices(organisation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'plans readable by authenticated'
  ) THEN
    CREATE POLICY "plans readable by authenticated" ON public.subscription_plans
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT 'subscriptions' AS tbl
    UNION ALL
    SELECT 'invoices'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = r.tbl AND policyname = 'org_scope'
    ) THEN
      EXECUTE format('CREATE POLICY org_scope ON public.%I USING (organisation_id IN (SELECT get_user_org_id()))', r.tbl);
    END IF;
  END LOOP;
END $$;

-- ==================== DROP redundant plan/billing columns ====================
ALTER TABLE public.organisations
  DROP COLUMN IF EXISTS plan,
  DROP COLUMN IF EXISTS billing_cycle,
  DROP COLUMN IF EXISTS plan_price,
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS student_capacity,
  DROP COLUMN IF EXISTS max_admins,
  DROP COLUMN IF EXISTS subscription_start,
  DROP COLUMN IF EXISTS expiry_date;
