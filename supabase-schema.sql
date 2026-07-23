-- ============================================================================
-- PRASYNX EDUCATION OS — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor to set up the entire auth + profile system
-- ============================================================================

-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USER PROFILES (syncs with auth.users via trigger)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student','parent','teacher','institution','recruiter','organization','admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. ROLE-SPECIFIC PROFILE TABLES
-- ============================================================================

-- STUDENT
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school TEXT,
  college TEXT,
  course TEXT,
  year TEXT,
  skills TEXT[] DEFAULT '{}',
  career_interests TEXT[] DEFAULT '{}',
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PARENT
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_name TEXT,
  child_class TEXT,
  school_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TEACHER
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name TEXT,
  subject TEXT,
  experience TEXT,
  qualification TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INSTITUTION
CREATE TABLE IF NOT EXISTS public.institution_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name TEXT,
  institution_type TEXT,
  website TEXT,
  address TEXT,
  student_count INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RECRUITER
CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  industry TEXT,
  website TEXT,
  company_size TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ORGANIZATION
CREATE TABLE IF NOT EXISTS public.organization_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT,
  organization_type TEXT,
  website TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP (database trigger)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    true
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. AUTO-UPDATE profile.updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_teacher_profiles_updated_at
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_institution_profiles_updated_at
  BEFORE UPDATE ON public.institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_recruiter_profiles_updated_at
  BEFORE UPDATE ON public.recruiter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_organization_profiles_updated_at
  BEFORE UPDATE ON public.organization_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STUDENT PROFILES
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all student profiles"
  ON public.student_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PARENT PROFILES
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own profile"
  ON public.parent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can update own profile"
  ON public.parent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- TEACHER PROFILES
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own profile"
  ON public.teacher_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile"
  ON public.teacher_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all teacher profiles"
  ON public.teacher_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSTITUTION PROFILES
ALTER TABLE public.institution_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutions can view own profile"
  ON public.institution_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Institutions can update own profile"
  ON public.institution_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RECRUITER PROFILES
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can view own profile"
  ON public.recruiter_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can update own profile"
  ON public.recruiter_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ORGANIZATION PROFILES
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view own profile"
  ON public.organization_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Organizations can update own profile"
  ON public.organization_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('resumes', 'resumes', false),
  ('certificates', 'certificates', false),
  ('documents', 'documents', false),
  ('institution-assets', 'institution-assets', false)
ON CONFLICT (id) DO NOTHING;

-- AVATARS: any authenticated user can upload, everyone can view
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND owner = auth.uid());

-- RESUMES: users can only view/update/delete their own
CREATE POLICY "Users can view own resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND owner = auth.uid());

CREATE POLICY "Users can upload resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own resumes"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resumes' AND owner = auth.uid());

CREATE POLICY "Users can delete own resumes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND owner = auth.uid());

-- CERTIFICATES / DOCUMENTS / INSTITUTION-ASSETS: similar ownership policies
CREATE POLICY "Users can view own certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates' AND owner = auth.uid());

CREATE POLICY "Users can upload certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND owner = auth.uid());

CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Institutions can view own assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'institution-assets' AND owner = auth.uid());

CREATE POLICY "Institutions can upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'institution-assets' AND auth.role() = 'authenticated');

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Get all users with a specific role (admin only)
CREATE OR REPLACE FUNCTION public.get_users_by_role(target_role TEXT)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT * FROM public.profiles
  WHERE role = target_role
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Check if current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = required_role
  );
$$;

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user ON public.teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_user ON public.institution_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_user ON public.recruiter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user ON public.organization_profiles(user_id);
