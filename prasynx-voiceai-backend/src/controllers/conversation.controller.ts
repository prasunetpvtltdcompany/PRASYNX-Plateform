import { Request, Response } from 'express';
import { callService } from '../services/callService';
import { conversationService } from '../services/conversationService';
import { ticketService } from '../services/ticketService';
import { sendSuccess, sendError } from '../utils/response';

export class ConversationController {
  async processMessage(req: Request, res: Response) {
    const { callId, message } = req.body;
    const call = await callService.getById(callId);
    if (!call) return sendError(res, 'Call not found', 404);

    let state = conversationService.get(callId);
    if (!state) state = conversationService.create(callId);

    const lowerMsg = message.toLowerCase();

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

  async getConversationState(req: Request, res: Response) {
    const state = conversationService.get(req.params.callId);
    if (!state) return sendError(res, 'No active conversation found for this call', 404);
    sendSuccess(res, state);
  }
}

export const conversationController = new ConversationController();
