import { Request, Response } from 'express';
import { ticketService } from '../services/ticketService';
import { sendSuccess } from '../utils/response';

export class InfoController {
  async handleInfoQuery(req: Request, res: Response) {
    const { query } = req.body;
    let response = "I'm sorry, I don't have access to that information right now. Let me create a support ticket for the relevant department to follow up with you.";

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

export const infoController = new InfoController();
