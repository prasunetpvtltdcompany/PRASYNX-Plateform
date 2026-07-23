export type PortalRole = 'admin' | 'management' | 'staff' | 'student' | 'parent' | 'job_provider';

export interface PortalConfig {
  backendPort: number;
  frontendPort: number;
  sessionKey: string;
  role: PortalRole;
}

export const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  admin: { backendPort: 4001, frontendPort: 3001, sessionKey: 'adminSession', role: 'admin' },
  management: { backendPort: 4002, frontendPort: 3002, sessionKey: 'managementSession', role: 'management' },
  staff: { backendPort: 4003, frontendPort: 3003, sessionKey: 'staffSession', role: 'staff' },
  student: { backendPort: 4004, frontendPort: 3004, sessionKey: 'studentSession', role: 'student' },
  parents: { backendPort: 4005, frontendPort: 3005, sessionKey: 'parentSession', role: 'parent' },
  jobprovider: { backendPort: 4006, frontendPort: 3006, sessionKey: 'jobProviderSession', role: 'job_provider' },
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthPayload {
  id: string;
  email: string;
  role?: string;
  type?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  type?: string;
  role?: string;
  iat?: number;
  exp?: number;
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
