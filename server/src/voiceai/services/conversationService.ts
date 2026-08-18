import { CallRecord } from '../types';

export interface ConversationState {
  callId: string;
  stage: 'greeting' | 'identifying' | 'listening' | 'processing' | 'confirming' | 'completed';
  intent?: 'complaint' | 'appointment' | 'ticket' | 'job' | 'info' | 'notification' | 'unknown';
  collectedData: Record<string, any>;
}

const conversations = new Map<string, ConversationState>();

export class ConversationService {
  create(callId: string): ConversationState {
    const state: ConversationState = {
      callId,
      stage: 'greeting',
      collectedData: {},
    };
    conversations.set(callId, state);
    return state;
  }

  get(callId: string): ConversationState | undefined {
    return conversations.get(callId);
  }

  update(callId: string, updates: Partial<ConversationState>): ConversationState {
    const state = conversations.get(callId);
    if (!state) throw new Error('Conversation not found');
    Object.assign(state, updates);
    return state;
  }

  delete(callId: string) {
    conversations.delete(callId);
  }

  generateWelcomeMessage(callerName?: string): string {
    const name = callerName || 'there';
    return `Hello ${name}! Welcome to Prasunet AI Voice Assistant. I can help you with complaints, appointments, support tickets, job postings, and more. How can I assist you today?`;
  }

  generateSummary(state: ConversationState): string {
    const lines: string[] = [];
    lines.push(`Call Summary (ID: ${state.callId})`);
    if (state.collectedData.callerName) {
      lines.push(`Caller: ${state.collectedData.callerName} (${state.collectedData.callerRole || 'Unknown'})`);
    }
    if (state.intent) {
      lines.push(`Intent: ${state.intent}`);
    }
    if (state.collectedData.complaintId) {
      lines.push(`Complaint Registered: ${state.collectedData.complaintId}`);
    }
    if (state.collectedData.ticketId) {
      lines.push(`Support Ticket: ${state.collectedData.ticketId}`);
    }
    if (state.collectedData.appointmentDate) {
      lines.push(`Appointment Scheduled: ${state.collectedData.appointmentDate} at ${state.collectedData.appointmentTime}`);
    }
    if (state.collectedData.jobTitle) {
      lines.push(`Job Posted: ${state.collectedData.jobTitle}`);
    }
    lines.push(`Status: ${state.stage}`);
    return lines.join('\n');
  }

  getResponseForIntent(intent: string): string {
    const responses: Record<string, string> = {
      complaint: "I understand you'd like to register a complaint. Please tell me the category (e.g., academic, behavior, facilities, bullying, teacher, or other) and describe the issue in detail.",
      appointment: "I'd be happy to schedule an appointment for you. Please tell me who you'd like to meet, the purpose, and your preferred date and time.",
      ticket: "I'll create a support ticket for you. Please provide the subject, description, and the department this should be assigned to.",
      job: "I can help you with job postings or finding opportunities. Are you looking to post a job or find one?",
      info: "I can look up information about attendance, results, fees, timetable, and notices. Please specify what you'd like to know.",
      notification: "I can send notifications via SMS, email, WhatsApp, or app notification. What message would you like to send and to whom?",
    };
    return responses[intent] || "I'm not sure I understood. Could you please repeat that? You can say complaint, appointment, support ticket, job, information, or notification.";
  }
}

export const conversationService = new ConversationService();
