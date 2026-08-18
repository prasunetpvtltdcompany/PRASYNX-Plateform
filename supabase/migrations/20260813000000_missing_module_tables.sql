-- Missing module tables for management portal (alumni, career, gamification)
-- Paste this into the Supabase SQL editor and run it once.

-- ==================== ALUMNI MANAGEMENT ====================

CREATE TABLE IF NOT EXISTS public.alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  graduation_year INTEGER,
  current_occupation TEXT,
  company TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alumni_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alumni_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  alumni_id UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
  amount NUMERIC DEFAULT 0,
  purpose TEXT,
  donation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alumni_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  alumni_id UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
  expertise TEXT,
  availability TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== CAREER MANAGEMENT ====================

CREATE TABLE IF NOT EXISTS public.career_internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT,
  description TEXT,
  duration TEXT,
  stipend TEXT,
  application_deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_psychometric_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_college_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID,
  college_name TEXT,
  program TEXT,
  application_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID,
  skill TEXT,
  score INTEGER DEFAULT 0,
  assessed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.career_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  session_date TIMESTAMPTZ,
  session_time TEXT,
  location TEXT,
  max_participants INTEGER,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== GAMIFICATION / LEARNING GAMES ====================

CREATE TABLE IF NOT EXISTS public.learning_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  difficulty TEXT DEFAULT 'beginner',
  game_type TEXT DEFAULT 'quiz',
  game_url TEXT,
  thumbnail_url TEXT,
  max_score INTEGER DEFAULT 100,
  duration_minutes INTEGER DEFAULT 10,
  instructions TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.learning_games(id) ON DELETE CASCADE,
  class_id UUID,
  student_id UUID,
  assigned_by UUID,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.learning_games(id) ON DELETE CASCADE,
  assignment_id UUID,
  student_id UUID,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  time_spent_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'trophy',
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID,
  achievement_id UUID REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Refresh PostgREST schema cache so the API picks up the new tables immediately
NOTIFY pgrst, 'reload schema';
