import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class HealthService {
  async getByStudent(studentId: string) {
    const [reportsRes, vaccinesRes, medicalRes, checkupsRes, medicationsRes, moodRes, covidRes, emergencyRes] = await Promise.all([
      supabase.from('documents').select('*').eq('student_id', studentId).eq('document_type', 'Health Report').order('created_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('student_id', studentId).order('administered_date', { ascending: false }),
      supabase.from('health_medical_records').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('health_checkups').select('*').eq('student_id', studentId).order('scheduled_date', { ascending: false }),
      supabase.from('health_medications').select('*').eq('student_id', studentId).order('administered_at', { ascending: false }),
      supabase.from('health_mood_logs').select('*').eq('student_id', studentId).order('logged_at', { ascending: false }),
      supabase.from('health_covid_tracking').select('*').eq('student_id', studentId).order('reported_date', { ascending: false }),
      supabase.from('health_emergency_contacts').select('*').eq('student_id', studentId)
    ]);
    return {
      reports: reportsRes.data || [], vaccinations: vaccinesRes.data || [], medicalRecords: medicalRes.data || [],
      checkups: checkupsRes.data || [], medications: medicationsRes.data || [], moodLogs: moodRes.data || [],
      covidTracking: covidRes.data || [], emergencyContacts: emergencyRes.data || []
    };
  }
}
export const healthService = new HealthService();
