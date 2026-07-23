-- Esports League & Tournament Management Schema for Prasunet ERP
-- Run this in Supabase SQL Editor

-- 1. ESPORTS LEAGUES
CREATE TABLE IF NOT EXISTS esports_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  game TEXT NOT NULL,
  platform TEXT,
  season TEXT,
  max_teams INTEGER DEFAULT 8,
  format TEXT DEFAULT 'round_robin' CHECK (format IN ('round_robin', 'single_elimination', 'double_elimination', 'swiss')),
  rules TEXT,
  prize_pool TEXT,
  banner_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_el_org ON esports_leagues(organisation_id);
CREATE INDEX IF NOT EXISTS idx_el_status ON esports_leagues(status);

-- 2. ESPORTS TEAMS
CREATE TABLE IF NOT EXISTS esports_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES esports_leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tag TEXT,
  logo_url TEXT,
  color TEXT,
  captain_id UUID,
  max_players INTEGER DEFAULT 5,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disqualified', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(league_id, name)
);

CREATE INDEX IF NOT EXISTS idx_et_league ON esports_teams(league_id);

-- 3. ESPORTS PLAYERS (student members of teams)
CREATE TABLE IF NOT EXISTS esports_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES esports_teams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player' CHECK (role IN ('captain', 'player', 'substitute')),
  jersey_number INTEGER,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, student_id)
);

CREATE INDEX IF NOT EXISTS ep_team ON esports_players(team_id);
CREATE INDEX IF NOT EXISTS ep_student ON esports_players(student_id);

-- 4. ESPORTS TOURNAMENTS (brackets/stages within a league)
CREATE TABLE IF NOT EXISTS esports_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES esports_leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('group_stage', 'quarterfinal', 'semifinal', 'final', 'grand_final')),
  bracket_type TEXT DEFAULT 'single_elimination',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS et_league ON esports_tournaments(league_id);

-- 5. ESPORTS MATCHES
CREATE TABLE IF NOT EXISTS esports_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES esports_tournaments(id) ON DELETE SET NULL,
  league_id UUID NOT NULL REFERENCES esports_leagues(id) ON DELETE CASCADE,
  team1_id UUID NOT NULL REFERENCES esports_teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES esports_teams(id) ON DELETE CASCADE,
  round INTEGER DEFAULT 1,
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES esports_teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  stream_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS em_tournament ON esports_matches(tournament_id);
CREATE INDEX IF NOT EXISTS em_league ON esports_matches(league_id);
CREATE INDEX IF NOT EXISTS em_status ON esports_matches(status);

-- 6. ESPORTS STANDINGS (league/group rankings)
CREATE TABLE IF NOT EXISTS esports_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES esports_leagues(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES esports_teams(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  score_for INTEGER DEFAULT 0,
  score_against INTEGER DEFAULT 0,
  rank INTEGER,
  UNIQUE(league_id, team_id)
);

CREATE INDEX IF NOT EXISTS es_league ON esports_standings(league_id);
CREATE INDEX IF NOT EXISTS es_rank ON esports_standings(rank);

-- 7. GAMING CURRICULUM (educational gaming resources)
CREATE TABLE IF NOT EXISTS gaming_curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  game TEXT,
  category TEXT CHECK (category IN ('strategy', 'coding', 'design', 'analysis', 'sportsmanship', 'other')),
  resource_url TEXT,
  duration_minutes INTEGER,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. LIVE STREAMS
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT DEFAULT 'twitch' CHECK (platform IN ('twitch', 'youtube', 'facebook', 'custom')),
  stream_url TEXT NOT NULL,
  embed_url TEXT,
  game TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  created_at TIMESTAMPTZ DEFAULT now()
);
