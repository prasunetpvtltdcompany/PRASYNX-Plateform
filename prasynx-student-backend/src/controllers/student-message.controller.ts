import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class StudentMessageController {
  async send(req: Request, res: Response) {
    const { sender_id, recipient_id, message } = req.body;
    try {
      const { data, error } = await supabase.from('direct_messages').insert({ sender_id, recipient_id, message }).select();
      if (error) throw error;
      sendCreated(res, data?.[0]);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getMessages(req: Request, res: Response) {
    const { student_id, teacher_id } = req.params;
    try {
      const { data, error } = await supabase.from('direct_messages').select('*').or(`and(sender_id.eq.${student_id},recipient_id.eq.${teacher_id}),and(sender_id.eq.${teacher_id},recipient_id.eq.${student_id})`).order('created_at', { ascending: true });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async markRead(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { data, error } = await supabase.from('direct_messages').update({ read_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getConversations(req: Request, res: Response) {
    const { user_id } = req.params;
    try {
      const { data, error } = await supabase.from('direct_messages').select('*').or(`sender_id.eq.${user_id},recipient_id.eq.${user_id}`).order('created_at', { ascending: false });
      if (error) throw error;
      const convMap = new Map<string, any>();
      for (const msg of data || []) {
        const otherId = msg.sender_id === user_id ? msg.recipient_id : msg.sender_id;
        if (!convMap.has(otherId)) convMap.set(otherId, msg);
      }
      const participants = [...convMap.keys()];
      if (participants.length === 0) return sendSuccess(res, []);
      const { data: teachers } = await supabase.from('staff_records').select('id, full_name, subject').in('id', participants);
      const teacherMap = new Map((teachers || []).map(t => [t.id, t]));
      const conversations = [...convMap.entries()].map(([pid, lastMsg]) => ({
        participant_id: pid,
        participant: teacherMap.get(pid) || { id: pid, full_name: pid, subject: null },
        last_message: lastMsg.message,
        last_message_time: lastMsg.created_at,
        unread_count: 0
      }));
      sendSuccess(res, conversations);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getUnreadCount(req: Request, res: Response) {
    const { user_id } = req.params;
    try {
      const { data, error } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true }).eq('recipient_id', user_id).is('read_at', null);
      if (error) throw error;
      sendSuccess(res, { unread_count: data?.length || 0 });
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentMessageController = new StudentMessageController();
