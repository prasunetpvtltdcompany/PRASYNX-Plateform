import type { Request } from 'express';
import type { AuthenticatedUser } from '@prasynx/types';

export interface JwtPayload {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  role: string;
  organisation_id?: string;
  organisationId?: string;
  tenantId?: string | null;
  sessionId?: string;
  portal?: string;
  [key: string]: any;
}

export type AuthRequest = Request & { user?: AuthenticatedUser };

export interface CallRecord {
  id: string;
  caller_id: string;
  caller_name: string;
  caller_role: string;
  phone_number: string;
  status: 'incoming' | 'active' | 'completed' | 'missed';
  started_at: string;
  ended_at?: string;
  duration_secs?: number;
  transcript?: string;
  summary?: string;
  created_at: string;
}

export interface ComplaintRecord {
  id: string;
  complaint_id: string;
  caller_id: string;
  caller_name: string;
  caller_role: string;
  student_name?: string;
  student_id?: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRecord {
  id: string;
  caller_id: string;
  caller_name: string;
  caller_role: string;
  with_person: string;
  with_role: string;
  purpose: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

export interface TicketRecord {
  id: string;
  ticket_id: string;
  caller_id: string;
  caller_name: string;
  caller_role: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_department: string;
  created_at: string;
  updated_at: string;
}

export interface TranscriptRecord {
  id: string;
  call_id: string;
  caller_id: string;
  caller_name: string;
  caller_role: string;
  messages: TranscriptMessage[];
  summary: string;
  created_at: string;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface NotificationRecord {
  id: string;
  recipient_id: string;
  recipient_phone?: string;
  recipient_email?: string;
  channel: 'sms' | 'email' | 'whatsapp' | 'app';
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
}

export interface JobRecord {
  id: string;
  provider_id: string;
  provider_name: string;
  title: string;
  description: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  location: string;
  salary_range?: string;
  skills: string[];
  target_audience: ('student' | 'staff' | 'parent')[];
  status: 'open' | 'closed' | 'filled';
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
