import crypto from 'crypto';
import QRCode from 'qrcode';
import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class QrAttendanceService {
  async generateQR(body: { teacher_id: string; class_id?: string; subject?: string; period?: string; org_id: string }) {
    const { teacher_id, class_id, subject, period, org_id } = body;
    if (!teacher_id || !org_id) throw new BadRequestError('Required fields: teacher_id, org_id');

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: session, error: insertError } = await supabase
      .from('qr_sessions')
      .insert({ teacher_id, class_id: class_id || null, subject: subject || null, period: period || null, token, expires_at: expiresAt, is_active: true, created_at: new Date().toISOString() })
      .select().single();
    if (insertError) throw new BadRequestError(insertError.message);

    const qrData = JSON.stringify({ token, teacher_id, class_id: class_id || null, subject: subject || null, period: period || null, org_id });
    const qrDataUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 2, color: { dark: '#1e40af', light: '#ffffff' } });

    return { session, qrDataUrl, expires_at: expiresAt, token };
  }

  async getScanCount(token: string) {
    const { data: session, error } = await supabase.from('qr_sessions').select('*').eq('token', token).single();
    if (error || !session) throw new NotFoundError('QR session not found');
    if (new Date(session.expires_at) < new Date()) return { count: 0 };

    let query = supabase.from('attendance_records').select('*', { count: 'exact', head: true })
      .eq('attendance_date', new Date().toISOString().slice(0, 10)).eq('teacher_id', session.teacher_id);
    if (session.class_id) query = query.eq('class_id', session.class_id);
    const { count, error: countError } = await query;
    if (countError) throw new BadRequestError(countError.message);
    return { count: count || 0 };
  }
}
export const qrAttendanceService = new QrAttendanceService();
