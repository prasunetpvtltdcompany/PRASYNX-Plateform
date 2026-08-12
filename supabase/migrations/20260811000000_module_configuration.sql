-- Management portal: per-org module enable/disable configuration.
-- Re-architected from the legacy `module_configuration` table used by the
-- management backend /module-config routes.

create table if not exists public.module_configuration (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  module_key text not null check (module_key ~ '^[a-z0-9_-]+$'),
  module_name text not null default '',
  enabled boolean not null default true,
  settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, module_key)
);

alter table public.module_configuration enable row level security;

create policy "org_isolation_module_configuration"
  on public.module_configuration for all
  using (organisation_id = (auth.jwt() ->> 'organisationId')::uuid)
  with check (organisation_id = (auth.jwt() ->> 'organisationId')::uuid);
