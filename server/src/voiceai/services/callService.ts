import { supabase } from '../config/database';
import { CallRecord } from '../types';
import { AppError } from '../utils/errors';

export class CallService {
  async createIncoming(from: string, callerName?: string, callerRole?: string): Promise<CallRecord> {
    const { data, error } = await supabase
      .from('voice_calls')
      .insert({
        caller_phone: from,
        caller_name: callerName || 'Unknown',
        caller_role: callerRole || 'unknown',
        status: 'incoming',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new AppError(`Failed to create call: ${error.message}`, 500);
    return data;
  }

  async getById(id: string): Promise<CallRecord> {
    const { data, error } = await supabase.from('voice_calls').select('*').eq('id', id).single();
    if (error || !data) throw new AppError('Call not found', 404);
    return data;
  }

  async list(limit = 20, offset = 0): Promise<CallRecord[]> {
    const { data, error } = await supabase
      .from('voice_calls')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new AppError(`Failed to list calls: ${error.message}`, 500);
    return data || [];
  }

  async updateStatus(id: string, status: CallRecord['status'], durationSecs?: number): Promise<CallRecord> {
    const updates: Record<string, any> = { status };
    if (status === 'completed' || status === 'missed') {
      updates.ended_at = new Date().toISOString();
    }
    if (durationSecs !== undefined) updates.duration_secs = durationSecs;
    const { data, error } = await supabase.from('voice_calls').update(updates).eq('id', id).select().single();
    if (error) throw new AppError(`Failed to update call: ${error.message}`, 500);
    return data;
  }

  async saveTranscript(id: string, transcript: string, summary?: string): Promise<CallRecord> {
    const updates: Record<string, any> = { transcript };
    if (summary) updates.summary = summary;
    const { data, error } = await supabase.from('voice_calls').update(updates).eq('id', id).select().single();
    if (error) throw new AppError(`Failed to save transcript: ${error.message}`, 500);
    return data;
  }
}

export const callService = new CallService();
