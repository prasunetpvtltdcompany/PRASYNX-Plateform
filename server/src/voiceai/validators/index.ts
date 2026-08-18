import { z } from 'zod';

export const incomingCallSchema = z.object({
  from: z.string().min(1, 'Caller phone number is required'),
  callerName: z.string().optional(),
  callerRole: z.enum(['admin', 'management', 'staff', 'student', 'parents', 'jobprovider', 'unknown']).optional(),
});

export const processMessageSchema = z.object({
  callId: z.uuid('Invalid call ID'),
  message: z.string().min(1, 'Message is required'),
});

export const executeFunctionSchema = z.object({
  functionName: z.string().min(1),
  arguments: z.record(z.string(), z.any()).optional(),
});

export const registerComplaintSchema = z.object({
  callerId: z.string().optional(),
  callerName: z.string().min(1, 'Caller name is required'),
  callerRole: z.string().min(1, 'Caller role is required'),
  callerPhone: z.string().optional(),
  studentName: z.string().optional(),
  studentId: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const scheduleAppointmentSchema = z.object({
  callerName: z.string().min(1),
  callerRole: z.string().min(1),
  withPerson: z.string().min(1, 'Person to meet is required'),
  withRole: z.string().min(1),
  purpose: z.string().min(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  notes: z.string().optional(),
});

export const createTicketSchema = z.object({
  callerName: z.string().min(1),
  callerRole: z.string().min(1),
  subject: z.string().min(5),
  description: z.string().min(10),
  category: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedDepartment: z.string().min(1),
});

export const sendNotificationSchema = z.object({
  recipientId: z.string().optional(),
  recipientPhone: z.string().optional(),
  recipientEmail: z.email().optional().or(z.literal('')),
  channel: z.enum(['sms', 'email', 'whatsapp', 'app']),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const postJobSchema = z.object({
  providerName: z.string().min(1),
  title: z.string().min(5),
  description: z.string().min(20),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract']),
  location: z.string().min(1),
  salaryRange: z.string().optional(),
  skills: z.array(z.string()).min(1),
  targetAudience: z.array(z.enum(['student', 'staff', 'parent'])).min(1),
});

export const saveTranscriptSchema = z.object({
  callId: z.uuid(),
  callerId: z.string().optional(),
  callerName: z.string().min(1),
  callerRole: z.string().min(1),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string(),
  })),
  summary: z.string().min(1),
});

export const verifyCallerSchema = z.object({
  phone: z.string().min(1),
  name: z.string().optional(),
  role: z.string().optional(),
});
