export type UserRole = 'student' | 'parent' | 'teacher' | 'recruiter' | 'admin' | 'institution' | 'organization' | 'visitor';

export interface AIContext {
  role: UserRole;
  userId: string;
  schoolId?: string;
  page: string;
  portal: string;
  studentId?: string;
  parentId?: string;
  teacherId?: string;
  recruiterId?: string;
  adminId?: string;
  classId?: string;
  jobId?: string;
  sessionId: string;
  data?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  userId: string;
  role: UserRole;
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AIMemory {
  id: string;
  userId: string;
  key: string;
  value: string;
  type: 'preference' | 'fact' | 'goal' | 'history';
  createdAt: string;
  updatedAt: string;
}

export interface AIAction {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiredRole: UserRole[];
  handler: (params: Record<string, unknown>, context: AIContext) => Promise<AIActionResult>;
}

export interface AIActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export interface AIStructuredResponse {
  title: string;
  summary: string;
  recommendations: string[];
  actions: { label: string; action: string; params?: Record<string, unknown> }[];
  charts?: Record<string, unknown>;
  nextSteps: string[];
}

export interface AIProactiveInsight {
  id: string;
  type: 'alert' | 'insight' | 'reminder' | 'suggestion';
  severity: 'low' | 'medium' | 'high';
  message: string;
  icon: string;
  action?: { label: string; action: string };
  createdAt: string;
}

export interface AIRequest {
  message: string;
  conversationId?: string;
  context: AIContext;
}

export interface AIResponse {
  message: string;
  structured?: AIStructuredResponse;
  conversationId: string;
  insights?: AIProactiveInsight[];
  actions?: { label: string; action: string; params?: Record<string, unknown> }[];
}
