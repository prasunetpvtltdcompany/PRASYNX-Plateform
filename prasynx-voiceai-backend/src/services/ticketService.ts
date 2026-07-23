import { supabase } from '../config/database';
import { TicketRecord } from '../types';
import { AppError } from '../utils/errors';

function generateTicketId(): string {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export class TicketService {
  async create(data: {
    callerName: string;
    callerRole: string;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedDepartment: string;
  }): Promise<TicketRecord> {
    const ticketId = generateTicketId();
    const { data: record, error } = await supabase
      .from('voice_tickets')
      .insert({
        ticket_id: ticketId,
        caller_name: data.callerName,
        caller_role: data.callerRole,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority,
        assigned_department: data.assignedDepartment,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new AppError(`Failed to create ticket: ${error.message}`, 500);
    return record;
  }

  async getById(id: string): Promise<TicketRecord> {
    const { data, error } = await supabase
      .from('voice_tickets')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new AppError('Ticket not found', 404);
    return data;
  }

  async getByTicketId(ticketId: string): Promise<TicketRecord> {
    const { data, error } = await supabase
      .from('voice_tickets')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();
    if (error || !data) throw new AppError('Ticket not found', 404);
    return data;
  }

  async list(limit = 20, offset = 0): Promise<TicketRecord[]> {
    const { data, error } = await supabase
      .from('voice_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new AppError(`Failed to list tickets: ${error.message}`, 500);
    return data || [];
  }

  async updateStatus(id: string, status: TicketRecord['status']): Promise<TicketRecord> {
    const { data, error } = await supabase
      .from('voice_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(`Failed to update ticket: ${error.message}`, 500);
    return data;
  }
}

export const ticketService = new TicketService();
