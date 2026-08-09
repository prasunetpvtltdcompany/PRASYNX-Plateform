export type PortalRole = 'admin' | 'management' | 'staff' | 'student' | 'parent' | 'job_provider';

export interface User {
  id: string;
  organisation_id?: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  status: string;
  created_at?: string;
}

export interface Organisation {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  logo?: string;
  status: 'pending' | 'verified' | 'suspended';
  created_at?: string;
}

export interface Student {
  id: string;
  organisation_id: string;
  full_name: string;
  roll_number: string;
  student_class?: string;
  section?: string;
  phone?: string;
  parent_email?: string;
  parent_phone?: string;
  avatar?: string;
  status: string;
  created_at?: string;
}

export interface Staff {
  id: string;
  user_id: string;
  organisation_id: string;
  full_name: string;
  staff_unique_id: string;
  subject?: string;
  phone?: string;
  avatar?: string;
  status: string;
  created_at?: string;
}

export interface Class {
  id: string;
  organisation_id: string;
  name: string;
  section?: string;
  grade_level?: string;
  capacity?: number;
  status: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  organisation_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  subject?: string;
  teacher_id?: string;
}

export interface FeeRecord {
  id: string;
  student_id: string;
  organisation_id: string;
  total: number;
  paid: number;
  pending: number;
  due_date: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
}

export interface ExamResult {
  id: string;
  student_id: string;
  organisation_id: string;
  subject: string;
  score: number;
  max_score: number;
  exam_date: string;
  grade?: string;
}

export interface Assignment {
  id: string;
  organisation_id: string;
  class_id?: string;
  subject: string;
  title: string;
  description: string;
  due_date: string;
  status: 'active' | 'submitted' | 'graded';
  max_score?: number;
}

export interface TimetableEntry {
  id: string;
  organisation_id: string;
  class_id?: string;
  day: string;
  time: string;
  subject: string;
  teacher_name?: string;
  room?: string;
}

export interface JobProvider {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
}

export interface PartTimeJob {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  type: 'local' | 'online';
  area: string;
  pay_type: 'fixed' | 'hourly';
  pay_amount: number;
  duration: string;
  slots: number;
  skills: string;
  contact_info: string;
  target_role?: string;
  status: 'active' | 'closed' | 'filled';
  created_at?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_role: string;
  cover_note?: string;
  resume_url?: string;
  status: 'pending' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  organisation?: Organisation;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface DashboardStats {
  total_students?: number;
  total_staff?: number;
  total_classes?: number;
  present_today?: number;
  absent_today?: number;
  pending_fees?: number;
  total_revenue?: number;
  average_attendance?: number;
  upcoming_exams?: number;
  pending_assignments?: number;
}

export interface PtmSlot {
  id: string;
  date: string;
  day: string;
  time: string;
  teacher_name: string;
  available: boolean;
}
