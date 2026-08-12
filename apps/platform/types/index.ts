export type UserRole =
  | 'student'
  | 'parent'
  | 'teacher'
  | 'institution'
  | 'recruiter'
  | 'organization'
  | 'admin'
  | 'management'
  | 'staff'
  | 'job_provider';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  school: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[];
  career_interests: string[];
  resume_url: string | null;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  child_name: string | null;
  child_class: string | null;
  school_name: string | null;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  institution_name: string | null;
  subject: string | null;
  experience: string | null;
  qualification: string | null;
}

export interface InstitutionProfile {
  id: string;
  user_id: string;
  institution_name: string | null;
  institution_type: string | null;
  website: string | null;
  address: string | null;
  student_count: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  industry: string | null;
  website: string | null;
  company_size: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface OrganizationProfile {
  id: string;
  user_id: string;
  organization_name: string | null;
  organization_type: string | null;
  website: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export const ROLE_DASHBOARD_MAP: Record<UserRole, string> = {
  student: '/student/dashboard',
  parent: '/parent/dashboard',
  teacher: '/staff/dashboard',
  institution: '/management/dashboard',
  recruiter: '/job-provider/dashboard',
  organization: '/organization/dashboard',
  admin: '/admin/dashboard',
  management: '/management/dashboard',
  staff: '/staff/dashboard',
  job_provider: '/job-provider/dashboard',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  parent: 'Parent',
  teacher: 'Teacher',
  institution: 'Institution',
  recruiter: 'Recruiter',
  organization: 'Organization',
  admin: 'Admin',
  management: 'Management',
  staff: 'Staff',
  job_provider: 'Job Provider',
};
