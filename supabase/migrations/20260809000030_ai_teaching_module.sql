-- ============================================================================
-- AI TEACHING MODULE — AI Assistants, Conversations, Lessons, Quizzes, Content, Knowledge Base
-- ============================================================================
-- Backs the AI Teaching / AI Command Center endpoints (ai-teaching service).
-- These tables were referenced by ai-teaching.service.ts but never migrated,
-- which caused 500 "Could not find the table ..." errors.
-- Idempotent + missing-table-safe.
-- ============================================================================

-- AI assistants (tutors, homework, quiz generator, lesson planner, etc.)
CREATE TABLE IF NOT EXISTS public.ai_assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  assistant_type TEXT NOT NULL DEFAULT 'custom',  -- tutor | homework | quiz | lesson | content | grading | attendance | communication | custom
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.staff_records(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',           -- active | inactive
  config JSONB DEFAULT '{}'::jsonb,
  accuracy_score NUMERIC DEFAULT 90,               -- 0-100
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations (Q&A logs between users and assistants)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'system',          -- can be student/staff id or 'system'
  assistant_id TEXT DEFAULT 'default',
  query TEXT,
  response TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generated lessons
CREATE TABLE IF NOT EXISTS public.ai_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  topic TEXT,
  duration INTEGER DEFAULT 45,
  objectives JSONB DEFAULT '[]'::jsonb,
  content TEXT DEFAULT '',
  materials JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',             -- draft | published
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generated quizzes
CREATE TABLE IF NOT EXISTS public.ai_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  topic TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',       -- easy | medium | hard
  questions JSONB DEFAULT '[]'::jsonb,
  question_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',             -- draft | published
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generated educational content (notes, resources, etc.)
CREATE TABLE IF NOT EXISTS public.ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'document',   -- document | notes | worksheet | presentation
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  topic TEXT,
  content TEXT DEFAULT '',
  format TEXT DEFAULT 'text',
  status TEXT NOT NULL DEFAULT 'draft',             -- draft | published
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI knowledge base (learning resources umbrella)
CREATE TABLE IF NOT EXISTS public.ai_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL DEFAULT 'document',  -- document | video | link | file
  content TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  file_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',            -- active | archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_assistants_org ON public.ai_assistants(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistants_type ON public.ai_assistants(assistant_type);
CREATE INDEX IF NOT EXISTS idx_ai_assistants_status ON public.ai_assistants(status);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_org ON public.ai_conversations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON public.ai_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_lessons_org ON public.ai_lessons(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_lessons_subject ON public.ai_lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_lessons_class ON public.ai_lessons(class_id);

CREATE INDEX IF NOT EXISTS idx_ai_quizzes_org ON public.ai_quizzes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_quizzes_subject ON public.ai_quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_quizzes_class ON public.ai_quizzes(class_id);

CREATE INDEX IF NOT EXISTS idx_ai_generated_content_org ON public.ai_generated_content(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_type ON public.ai_generated_content(content_type);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_org ON public.ai_knowledge_base(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_type ON public.ai_knowledge_base(document_type);

-- ============================================================================
-- RLS (managed via service role in the backend, these are conservative defaults)
-- ============================================================================
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'public.ai_assistants','public.ai_conversations','public.ai_lessons',
    'public.ai_quizzes','public.ai_generated_content','public.ai_knowledge_base'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS ai_org_all_%I ON %I.%I;', split_part(t,'.',2), split_part(t,'.',1), split_part(t,'.',2));
    EXECUTE format('CREATE POLICY ai_org_all_%I ON %I.%I FOR ALL TO authenticated USING (organisation_id = (auth.jwt() ->> ''organisationId'')::uuid) WITH CHECK (organisation_id = (auth.jwt() ->> ''organisationId'')::uuid);', split_part(t,'.',2), split_part(t,'.',1), split_part(t,'.',2));
  END LOOP;
END $$;