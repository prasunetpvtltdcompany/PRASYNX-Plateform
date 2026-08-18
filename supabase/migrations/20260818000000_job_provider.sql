-- Job Provider portal: company profiles + provider messages.
-- Ported from prasynx-jobprovider-backend. The merged backend mounts at /api/job-provider
-- and queries job_providers / provider_messages / part_time_jobs(provider_id).
CREATE TABLE IF NOT EXISTS public.job_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  location TEXT,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  auto_respond BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.job_providers(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.part_time_job_applications(id) ON DELETE CASCADE,
  message TEXT,
  direction TEXT NOT NULL DEFAULT 'outbound',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The legacy backend scopes jobs by provider; part_time_jobs only had organisation_id.
ALTER TABLE public.part_time_jobs
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.job_providers(id) ON DELETE CASCADE;

ALTER TABLE public.job_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_messages ENABLE ROW LEVEL SECURITY;