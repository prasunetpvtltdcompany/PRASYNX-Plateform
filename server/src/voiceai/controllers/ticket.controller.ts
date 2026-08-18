import { Request, Response } from 'express';
import { ticketService } from '../services/ticketService';
import { sendSuccess } from '../utils/response';

export class TicketController {
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
}

export const ticketController = new TicketController();
