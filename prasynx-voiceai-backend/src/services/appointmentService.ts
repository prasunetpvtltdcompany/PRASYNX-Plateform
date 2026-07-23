import { supabase } from '../config/database';
import { AppointmentRecord } from '../types';
import { AppError } from '../utils/errors';

export class AppointmentService {
  async create(data: {
    callerName: string;
    callerRole: string;
    withPerson: string;
    withRole: string;
    purpose: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<AppointmentRecord> {
    const { data: record, error } = await supabase
      .from('voice_appointments')
      .insert({
        caller_name: data.callerName,
        caller_role: data.callerRole,
        with_person: data.withPerson,
        with_role: data.withRole,
        purpose: data.purpose,
        date: data.date,
        time: data.time,
        notes: data.notes || null,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new AppError(`Failed to schedule appointment: ${error.message}`, 500);
    return record;
  }

  async getById(id: string): Promise<AppointmentRecord> {
    const { data, error } = await supabase.from('voice_appointments').select('*').eq('id', id).single();
    if (error || !data) throw new AppError('Appointment not found', 404);
    return data;
  }

  async list(limit = 20, offset = 0): Promise<AppointmentRecord[]> {
    const { data, error } = await supabase
      .from('voice_appointments')
      .select('*')
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw new AppError(`Failed to list appointments: ${error.message}`, 500);
    return data || [];
  }

  async updateStatus(id: string, status: AppointmentRecord['status']): Promise<AppointmentRecord> {
    const { data, error } = await supabase
      .from('voice_appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(`Failed to update appointment: ${error.message}`, 500);
    return data;
  }
}

export const appointmentService = new AppointmentService();
