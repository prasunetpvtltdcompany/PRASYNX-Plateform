import { supabase } from '../config/database';
import { ComplaintRecord } from '../types';
import { AppError } from '../utils/errors';

function generateComplaintId(): string {
  const prefix = 'CMP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export class ComplaintService {
  async create(data: {
    callerName: string;
    callerRole: string;
    callerPhone?: string;
    studentName?: string;
    studentId?: string;
    category: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<ComplaintRecord> {
    const complaintId = generateComplaintId();
    const { data: record, error } = await supabase
      .from('voice_complaints')
      .insert({
        complaint_id: complaintId,
        caller_name: data.callerName,
        caller_role: data.callerRole,
        caller_phone: data.callerPhone || null,
        student_name: data.studentName || null,
        student_id: data.studentId || null,
        category: data.category,
        description: data.description,
        priority: data.priority,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new AppError(`Failed to register complaint: ${error.message}`, 500);
    return record;
  }

  async getByComplaintId(complaintId: string): Promise<ComplaintRecord> {
    const { data, error } = await supabase
      .from('voice_complaints')
      .select('*')
      .eq('complaint_id', complaintId)
      .single();
    if (error || !data) throw new AppError('Complaint not found', 404);
    return data;
  }

  async getById(id: string): Promise<ComplaintRecord> {
    const { data, error } = await supabase.from('voice_complaints').select('*').eq('id', id).single();
    if (error || !data) throw new AppError('Complaint not found', 404);
    return data;
  }

  async list(limit = 20, offset = 0): Promise<ComplaintRecord[]> {
    const { data, error } = await supabase
      .from('voice_complaints')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new AppError(`Failed to list complaints: ${error.message}`, 500);
    return data || [];
  }

  async updateStatus(id: string, status: ComplaintRecord['status'], notes?: string): Promise<ComplaintRecord> {
    const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (notes !== undefined) updates.notes = notes;
    const { data, error } = await supabase.from('voice_complaints').update(updates).eq('id', id).select().single();
    if (error) throw new AppError(`Failed to update complaint: ${error.message}`, 500);
    return data;
  }
}

export const complaintService = new ComplaintService();
