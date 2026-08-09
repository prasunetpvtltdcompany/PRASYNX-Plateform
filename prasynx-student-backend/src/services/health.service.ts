import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class HealthService {
  async getByStudent(studentId: string) {
    const [reportsRes, vaccinesRes, medicalRes, checkupsRes, medicationsRes, moodRes, covidRes, emergencyRes, healthRecordsRes] = await Promise.all([
      supabase.from('documents').select('*').eq('student_id', studentId).eq('document_type', 'Health Report').order('created_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('student_id', studentId).order('vaccination_date', { ascending: false, nullsFirst: true }),
      supabase.from('health_medical_records').select('*').eq('student_id', studentId).order('record_date', { ascending: false }),
      supabase.from('health_checkups').select('*').eq('student_id', studentId).order('checkup_date', { ascending: false, nullsFirst: true }),
      supabase.from('health_medications').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('health_mood_logs').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('health_covid_tracking').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('health_emergency_contacts').select('*').eq('student_id', studentId),
      supabase.from('health_records').select('*').eq('student_id', studentId).eq('recorded_by', 'Student').order('recorded_at', { ascending: false })
    ]);
    const healthRecords = healthRecordsRes.data || [];
    return {
      reports: reportsRes.data || [], vaccinations: vaccinesRes.data || [],
      medicalRecords: [...healthRecords, ...(medicalRes.data || [])],
      checkups: checkupsRes.data || [], medications: medicationsRes.data || [],
      moodLogs: moodRes.data || [], covidTracking: covidRes.data || [],
      emergencyContacts: emergencyRes.data || []
    };
  }
}
export const healthService = new HealthService();
