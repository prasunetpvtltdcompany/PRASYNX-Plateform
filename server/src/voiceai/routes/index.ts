import { Router } from 'express';
import { callController } from '../controllers/call.controller';
import { conversationController } from '../controllers/conversation.controller';
import { complaintController } from '../controllers/complaint.controller';
import { appointmentController } from '../controllers/appointment.controller';
import { ticketController } from '../controllers/ticket.controller';
import { transcriptController } from '../controllers/transcript.controller';
import { notificationController } from '../controllers/notification.controller';
import { jobController } from '../controllers/job.controller';
import { verificationController } from '../controllers/verification.controller';
import { infoController } from '../controllers/info.controller';
import { preranaController } from '../controllers/prerana.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  incomingCallSchema,
  processMessageSchema,
  registerComplaintSchema,
  scheduleAppointmentSchema,
  createTicketSchema,
  sendNotificationSchema,
  postJobSchema,
  saveTranscriptSchema,
  verifyCallerSchema,
} from '../validators';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Prasunet AI Voice Assistant', version: '1.0.0' });
});

// ==================== CALL MANAGEMENT ====================
router.post('/incoming-call', validate(incomingCallSchema), asyncHandler(callController.incomingCall));
router.get('/calls', optionalAuth, asyncHandler(callController.listCalls));
router.get('/calls/:id', optionalAuth, asyncHandler(callController.getCall));
router.post('/calls/:id/end', optionalAuth, asyncHandler(callController.endCall));

// ==================== MESSAGE PROCESSING ====================
router.post('/process', validate(processMessageSchema), asyncHandler(conversationController.processMessage));

// ==================== COMPLAINTS ====================
router.post('/complaints', validate(registerComplaintSchema), asyncHandler(complaintController.registerComplaint));
router.get('/complaints', authenticate, asyncHandler(complaintController.listComplaints));
router.get('/complaints/:id', authenticate, asyncHandler(complaintController.getComplaint));

// ==================== APPOINTMENTS ====================
router.post('/appointments', validate(scheduleAppointmentSchema), asyncHandler(appointmentController.scheduleAppointment));
router.get('/appointments', authenticate, asyncHandler(appointmentController.listAppointments));
router.get('/appointments/:id', authenticate, asyncHandler(appointmentController.getAppointment));

// ==================== SUPPORT TICKETS ====================
router.post('/tickets', validate(createTicketSchema), asyncHandler(ticketController.createTicket));
router.get('/tickets', authenticate, asyncHandler(ticketController.listTickets));
router.get('/tickets/:id', authenticate, asyncHandler(ticketController.getTicket));

// ==================== TRANSCRIPTS ====================
router.post('/transcripts', validate(saveTranscriptSchema), asyncHandler(transcriptController.saveTranscript));
router.get('/transcripts/:callId', asyncHandler(transcriptController.getTranscript));

// ==================== NOTIFICATIONS ====================
router.post('/notifications', validate(sendNotificationSchema), asyncHandler(notificationController.sendNotification));

// ==================== JOBS ====================
router.post('/jobs', validate(postJobSchema), asyncHandler(jobController.postJob));
router.get('/jobs', asyncHandler(jobController.listJobs));
router.get('/jobs/:id', asyncHandler(jobController.getJob));

// ==================== VERIFICATION ====================
router.post('/verify', validate(verifyCallerSchema), asyncHandler(verificationController.verifyCaller));

// ==================== CONVERSATION ====================
router.get('/conversation/:callId', asyncHandler(conversationController.getConversationState));

// ==================== INFORMATION QUERIES ====================
router.post('/info-query', asyncHandler(infoController.handleInfoQuery));

// ==================== PRERANA AI ====================
router.post('/prerana/chat', asyncHandler(preranaController.chat));
router.get('/prerana/ptm/slots', asyncHandler(preranaController.getSlots));
router.post('/prerana/ptm/schedule', asyncHandler(preranaController.schedulePTM));
router.get('/prerana/analytics', asyncHandler(preranaController.getAnalytics));
router.post('/prerana/voice-call', asyncHandler(preranaController.voiceCall));
router.post('/prerana/translate', asyncHandler(preranaController.translate));
router.post('/prerana/info-query', asyncHandler(preranaController.handleInfoQuery));
router.get('/prerana/personas', asyncHandler(preranaController.getPersonas));
router.post('/prerana/knowledge-base/search', asyncHandler(preranaController.searchKnowledgeBase));
router.post('/prerana/action/execute', asyncHandler(preranaController.executeAction));

export default router;
