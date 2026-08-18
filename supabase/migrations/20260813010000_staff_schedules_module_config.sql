-- Missing tables: staff_schedules + module_configuration
-- Paste this into the Supabase SQL editor and run it once.

-- ==================== STAFF SCHEDULES ====================

CREATE TABLE IF NOT EXISTS public.staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  room_or_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_staff_schedules"
  ON public.staff_schedules FOR ALL
  USING (organisation_id = (auth.jwt() ->> 'organisationId')::uuid)
  WITH CHECK (organisation_id = (auth.jwt() ->> 'organisationId')::uuid);

-- ==================== MODULE CONFIGURATION ====================

CREATE TABLE IF NOT EXISTS public.module_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL CHECK (module_key ~ '^[a-z0-9_-]+$'),
  module_name TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, module_key)
);

ALTER TABLE public.module_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_module_configuration"
  ON public.module_configuration FOR ALL
  USING (organisation_id = (auth.jwt() ->> 'organisationId')::uuid)
  WITH CHECK (organisation_id = (auth.jwt() ->> 'organisationId')::uuid);

-- Refresh PostgREST schema cache so the API picks up the new tables immediately
NOTIFY pgrst, 'reload schema';
