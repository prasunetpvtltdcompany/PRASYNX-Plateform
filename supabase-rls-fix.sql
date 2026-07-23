-- Fix: Add missing INSERT policies for role-specific profile tables

-- PROFILES (for completeness, though trigger handles this)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- STUDENT PROFILES
CREATE POLICY "Students can insert own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PARENT PROFILES
CREATE POLICY "Parents can insert own profile"
  ON public.parent_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TEACHER PROFILES
CREATE POLICY "Teachers can insert own profile"
  ON public.teacher_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- INSTITUTION PROFILES
CREATE POLICY "Institutions can insert own profile"
  ON public.institution_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RECRUITER PROFILES
CREATE POLICY "Recruiters can insert own profile"
  ON public.recruiter_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ORGANIZATION PROFILES
CREATE POLICY "Organizations can insert own profile"
  ON public.organization_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
