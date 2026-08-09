-- Events / Clubs / Sports Teams tables for the Announcements module
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('academic','sports','cultural','meeting','holiday','other')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  coordinator TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sports_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT,
  sport_type TEXT,
  coach TEXT,
  max_players INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update" ON public.events FOR UPDATE USING (true);
CREATE POLICY "events_delete" ON public.events FOR DELETE USING (true);

CREATE POLICY "clubs_select" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "clubs_insert" ON public.clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "clubs_update" ON public.clubs FOR UPDATE USING (true);
CREATE POLICY "clubs_delete" ON public.clubs FOR DELETE USING (true);

CREATE POLICY "sports_teams_select" ON public.sports_teams FOR SELECT USING (true);
CREATE POLICY "sports_teams_insert" ON public.sports_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "sports_teams_update" ON public.sports_teams FOR UPDATE USING (true);
CREATE POLICY "sports_teams_delete" ON public.sports_teams FOR DELETE USING (true);