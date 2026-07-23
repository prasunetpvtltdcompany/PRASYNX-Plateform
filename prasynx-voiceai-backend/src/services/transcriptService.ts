import { supabase } from '../config/database';
import { TranscriptRecord } from '../types';
import { AppError } from '../utils/errors';

export class TranscriptService {
  async save(data: {
    callId: string;
    callerName: string;
    callerRole: string;
    messages: TranscriptRecord['messages'];
    summary: string;
  }): Promise<TranscriptRecord> {
    const { data: record, error } = await supabase
      .from('voice_transcripts')
      .insert({
        call_id: data.callId,
        caller_name: data.callerName,
        caller_role: data.callerRole,
        messages: data.messages,
        summary: data.summary,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new AppError(`Failed to save transcript: ${error.message}`, 500);
    return record;
  }

  async getByCallId(callId: string): Promise<TranscriptRecord> {
    const { data, error } = await supabase
      .from('voice_transcripts')
      .select('*')
      .eq('call_id', callId)
      .single();
    if (error || !data) throw new AppError('Transcript not found', 404);
    return data;
  }

  async list(limit = 20, offset = 0): Promise<TranscriptRecord[]> {
    const { data, error } = await supabase
      .from('voice_transcripts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new AppError(`Failed to list transcripts: ${error.message}`, 500);
    return data || [];
  }
}

export const transcriptService = new TranscriptService();
