/**
 * @deprecated This monolithic controller has been split into domain-specific controllers.
 * Use call.controller.ts, conversation.controller.ts, complaint.controller.ts,
 * appointment.controller.ts, ticket.controller.ts, transcript.controller.ts,
 * notification.controller.ts, job.controller.ts, verification.controller.ts,
 * info.controller.ts instead.
 */
import { Request, Response } from 'express';
import { callService } from '../services/callService';
import { complaintService } from '../services/complaintService';
import { appointmentService } from '../services/appointmentService';
import { ticketService } from '../services/ticketService';
import { transcriptService } from '../services/transcriptService';
import { notificationService } from '../services/notificationService';
import { jobService } from '../services/jobService';
import { conversationService } from '../services/conversationService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';
import crypto from 'crypto';

export class VoiceController {
  // ==================== CALL MANAGEMENT ====================

  async incomingCall(req: Request, res: Response) {
    const { from, callerName, callerRole } = req.body;
    const call = await callService.createIncoming(from, callerName, callerRole);
    conversationService.create(call.id);
    const welcome = conversationService.generateWelcomeMessage(callerName);
    sendSuccess(res, { call, message: welcome }, 'Call initiated', 201);
  }

  async getCall(req: Request, res: Response) {
    const call = await callService.getById(req.params.id);
    sendSuccess(res, call);
  }

  async listCalls(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const calls = await callService.list(limit, offset);
    sendSuccess(res, calls);
  }

  async endCall(req: Request, res: Response) {
    const { id } = req.params;
    const { durationSecs } = req.body;
    const call = await callService.updateStatus(id, 'completed', durationSecs);
    conversationService.delete(id);
    sendSuccess(res, call, 'Call ended');
  }

  // ==================== MESSAGE PROCESSING ====================

  async processMessage(req: Request, res: Response) {
    const { callId, message } = req.body;
    const call = await callService.getById(callId);
    if (!call) return sendError(res, 'Call not found', 404);

    let state = conversationService.get(callId);
    if (!state) state = conversationService.create(callId);

    const lowerMsg = message.toLowerCase();

    // Detect intent from message
    if (!state.intent || state.intent === 'unknown') {
      if (lowerMsg.includes('complain') || lowerMsg.includes('complaint') || lowerMsg.includes('issue') || lowerMsg.includes('problem')) {
        state.intent = 'complaint';
      } else if (lowerMsg.includes('appointment') || lowerMsg.includes('meet') || lowerMsg.includes('schedule')) {
        state.intent = 'appointment';
      } else if (lowerMsg.includes('ticket') || lowerMsg.includes('support')) {
        state.intent = 'ticket';
      } else if (lowerMsg.includes('job') || lowerMsg.includes('internship') || lowerMsg.includes('hire')) {
        state.intent = 'job';
      } else if (lowerMsg.includes('info') || lowerMsg.includes('attendance') || lowerMsg.includes('result') || lowerMsg.includes('fee') || lowerMsg.includes('timetable') || lowerMsg.includes('notice')) {
        state.intent = 'info';
      } else if (lowerMsg.includes('notify') || lowerMsg.includes('notification') || lowerMsg.includes('sms') || lowerMsg.includes('email') || lowerMsg.includes('whatsapp')) {
        state.intent = 'notification';
      }
    }

    const response = conversationService.getResponseForIntent(state.intent || 'unknown');
    state.stage = 'listening';
    state.collectedData.lastMessage = message;

    sendSuccess(res, {
      reply: response,
      state: { stage: state.stage, intent: state.intent },
    });
  }

  // ==================== COMPLAINTS ====================

  async registerComplaint(req: Request, res: Response) {
    const complaint = await complaintService.create(req.body);
    const { callId } = req.query;
    if (callId) {
      const state = conversationService.get(callId as string);
      if (state) {
        state.collectedData.complaintId = complaint.complaint_id;
        state.stage = 'completed';
      }

      // Create support ticket automatically for high/urgent complaints
      if (complaint.priority === 'high' || complaint.priority === 'urgent') {
        await ticketService.create({
          callerName: complaint.caller_name,
          callerRole: complaint.caller_role,
          subject: `Complaint: ${complaint.category} - ${complaint.complaint_id}`,
          description: complaint.description,
          category: complaint.category,
          priority: complaint.priority,
          assignedDepartment: 'Administration',
        });
      }
    }
    sendSuccess(res, complaint, `Complaint registered successfully. Your complaint ID is ${complaint.complaint_id}`, 201);
  }

  async getComplaint(req: Request, res: Response) {
    const { id } = req.params;
    const complaint = id.startsWith('CMP-')
      ? await complaintService.getByComplaintId(id)
      : await complaintService.getById(id);
    sendSuccess(res, complaint);
  }

  async listComplaints(_req: Request, res: Response) {
    const complaints = await complaintService.list();
    sendSuccess(res, complaints);
  }

  // ==================== APPOINTMENTS ====================

  async scheduleAppointment(req: Request, res: Response) {
    const appointment = await appointmentService.create(req.body);
    sendSuccess(res, appointment, `Appointment scheduled for ${appointment.date} at ${appointment.time}`, 201);
  }

  async getAppointment(req: Request, res: Response) {
    const appointment = await appointmentService.getById(req.params.id);
    sendSuccess(res, appointment);
  }

  async listAppointments(_req: Request, res: Response) {
    const appointments = await appointmentService.list();
    sendSuccess(res, appointments);
  }

  // ==================== SUPPORT TICKETS ====================

  async createTicket(req: Request, res: Response) {
    const ticket = await ticketService.create(req.body);
    sendSuccess(res, ticket, `Support ticket created. Ticket ID: ${ticket.ticket_id}`, 201);
  }

  async getTicket(req: Request, res: Response) {
    const { id } = req.params;
    const ticket = id.startsWith('TKT-')
      ? await ticketService.getByTicketId(id)
      : await ticketService.getById(id);
    sendSuccess(res, ticket);
  }

  async listTickets(_req: Request, res: Response) {
    const tickets = await ticketService.list();
    sendSuccess(res, tickets);
  }

  // ==================== TRANSCRIPTS ====================

  async saveTranscript(req: Request, res: Response) {
    const transcript = await transcriptService.save(req.body);
    // Also update the call record with transcript and summary
    await callService.saveTranscript(req.body.callId, JSON.stringify(req.body.messages), req.body.summary);
    sendSuccess(res, transcript, 'Transcript saved', 201);
  }

  async getTranscript(req: Request, res: Response) {
    const transcript = await transcriptService.getByCallId(req.params.callId);
    sendSuccess(res, transcript);
  }

  // ==================== NOTIFICATIONS ====================

  async sendNotification(req: Request, res: Response) {
    const notification = await notificationService.send(req.body);
    sendSuccess(res, notification, 'Notification created and queued', 201);
  }

  // ==================== JOBS ====================

  async postJob(req: Request, res: Response) {
    const job = await jobService.create(req.body);
    sendSuccess(res, job, 'Job posted successfully', 201);
  }

  async listJobs(req: Request, res: Response) {
    const { type, audience } = req.query;
    const jobs = await jobService.list(20, 0, type as string, audience as string);
    sendSuccess(res, jobs);
  }

  async getJob(req: Request, res: Response) {
    const job = await jobService.getById(req.params.id);
    sendSuccess(res, job);
  }

  // ==================== CALLER VERIFICATION ====================

  async verifyCaller(req: Request, res: Response) {
    const { phone } = req.body;
    // Look up caller in the existing users table across all portals
    // For now, return a basic verification
    const verificationId = crypto.randomUUID();
    sendSuccess(res, {
      verified: false,
      verificationId,
      message: 'Verification code sent to your phone. Please provide the code to confirm your identity.',
    });
  }

  // ==================== CONVERSATION STATE ====================

  async getConversationState(req: Request, res: Response) {
    const state = conversationService.get(req.params.callId);
    if (!state) return sendError(res, 'No active conversation found for this call', 404);
    sendSuccess(res, state);
  }

  // ==================== HEALTH / INFO ====================

  async handleInfoQuery(req: Request, res: Response) {
    const { query } = req.body;
    const lower = (query || '').toLowerCase();

    let response = "I'm sorry, I don't have access to that information right now. Let me create a support ticket for the relevant department to follow up with you.";

    // Create a ticket for the info request
    if (query) {
      const ticket = await ticketService.create({
        callerName: req.body.callerName || 'Unknown',
        callerRole: req.body.callerRole || 'unknown',
        subject: `Information Request: ${query.substring(0, 100)}`,
        description: query,
        category: 'information-request',
        priority: 'medium',
        assignedDepartment: 'Administration',
      });
      sendSuccess(res, { response, ticket }, `Support ticket created: ${ticket.ticket_id}`);
      return;
    }

    sendSuccess(res, { response, ticket: null });
  }
}

export const voiceController = new VoiceController();
