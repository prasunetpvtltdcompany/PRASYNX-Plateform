-- Gamification + Learning Games schema for Prasunet ERP
-- Learning game catalog
CREATE TABLE IF NOT EXISTS learning_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
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

-- Assignments of games to students or classes
CREATE TABLE IF NOT EXISTS game_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
  game_id UUID REFERENCES learning_games(id),
  class_id UUID,
  student_id UUID,
  assigned_by UUID,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student game play sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
  game_id UUID REFERENCES learning_games(id),
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

-- XP / point balance per student
CREATE TABLE IF NOT EXISTS student_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
  student_id UUID UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Achievement definition templates
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'trophy',
  xp_reward INTEGER DEFAULT 0,
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student achievements earned
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
  student_id UUID,
  achievement_id UUID REFERENCES achievement_definitions(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- Leaderboard (snapshot/cached)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id),
  student_id UUID,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);
