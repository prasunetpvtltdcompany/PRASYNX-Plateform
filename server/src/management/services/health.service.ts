import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

const STUDENT_SELECT = 'id, full_name, roll_number, blood_group, student_class:classes!students_class_id_fkey(name)';

export class HealthService {
  async dashboard(orgId: string) {
    const [studentsRes, recordsRes, vaccinationsRes, medicalRes, emergencyRes] = await Promise.all([
      supabase.from('students').select('id, full_name, blood_group').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('health_records').select('id, record_type, title, created_at').eq('organisation_id', orgId),
      supabase.from('vaccinations').select('id, next_due_date').eq('organisation_id', orgId),
      supabase.from('health_medical_records').select('id, record_type, created_at').eq('organisation_id', orgId),
      supabase.from('health_emergency_contacts').select('id').eq('organisation_id', orgId),
    ]);
    if (studentsRes.error) throw new BadRequestError(studentsRes.error.message);

    const students = studentsRes.data || [];
    const records = recordsRes.data || [];
    const vaccinations = vaccinationsRes.data || [];
    const medical = medicalRes.data || [];
    const emergency = emergencyRes.data || [];

    const recordTypes = (arr: any[], key: string = 'record_type') => {
      const map: Record<string, number> = {};
      arr.forEach((r: any) => { const t = r[key] || 'other'; map[t] = (map[t] || 0) + 1; });
      return map;
    };

    const upcoming = vaccinations
      .filter((v: any) => v.next_due_date && new Date(v.next_due_date) >= new Date(new Date().toDateString()))
      .sort((a: any, b: any) => +new Date(a.next_due_date) - +new Date(b.next_due_date))
      .slice(0, 5);

    const bloodGroups: Record<string, number> = {};
    students.forEach((s: any) => { const bg = s.blood_group || 'Unknown'; bloodGroups[bg] = (bloodGroups[bg] || 0) + 1; });

    return {
      total_students: students.length,
      students_with_blood_group: students.filter((s: any) => s.blood_group).length,
      total_records: records.length + medical.length,
      total_vaccinations: vaccinations.length,
      emergency_contacts: emergency.length,
      upcoming_vaccinations: upcoming.map((v: any) => ({ ...v })),
      by_record_type: recordTypes([...records.map((r: any) => ({ record_type: r.record_type })), ...medical.map((r: any) => ({ record_type: r.record_type }))]),
      by_blood_group: bloodGroups,
      recent_records: [...records, ...medical]
        .sort((a: any, b: any) => +new Date(b.created_at || 0) - +new Date(a.created_at || 0))
        .slice(0, 8)
        .map((r: any) => ({ id: r.id, record_type: r.record_type, title: r.title || r.record_type, created_at: r.created_at })),
    };
  }

  async students(orgId: string, search?: string) {
    let q = supabase.from('students')
      .select('id, full_name, roll_number, blood_group, status, date_of_birth')
      .eq('organisation_id', orgId);
    if (search) q = q.or(`full_name.ilike.%${search}%,roll_number.ilike.%${search}%`);
    const { data, error } = await q.order('full_name');
    if (error) throw new BadRequestError(error.message);
    return (data as any[]) || [];
  }

  async records(orgId: string, filters: { student_id?: string; record_type?: string } = {}) {
    const clean = (v?: string) => (v && v !== 'undefined' && v !== 'null' ? v : undefined);
    const student_id = clean(filters.student_id);
    const record_type = clean(filters.record_type);
    let q = supabase.from('health_records')
      .select(`*, student:students(${STUDENT_SELECT})`)
      .eq('organisation_id', orgId);
    if (student_id) q = q.eq('student_id', student_id);
    if (record_type) q = q.eq('record_type', record_type);
    const { data, error } = await q.order('recorded_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    const rows = (data as any[]) || [];

    const userIds = [...new Set(rows.map((r: any) => r.recorded_by).filter((id: string) => id && id !== 'Student' && id !== 'Parent'))];
    const userMap: Record<string, string> = {};
    if (userIds.length) {
      const { data: users, error: userErr } = await supabase.from('users')
        .select('id, full_name')
        .in('id', userIds);
      if (!userErr) {
        (users || []).forEach((u: any) => { userMap[u.id] = u.full_name || u.id; });
      }
    }

    return rows.map((r: any) => ({
      ...r,
      recorded_by: r.recorded_by ? (userMap[r.recorded_by] || r.recorded_by) : 'Student/Parent',
    }));
  }

  async createRecord(orgId: string, body: any, userId?: string) {
    const { student_id, record_type, title, description, value } = body;
    if (!student_id) throw new BadRequestError('student_id required');
    if (!record_type) throw new BadRequestError('record_type required');
    if (!title) throw new BadRequestError('title required');
    const { data, error } = await supabase.from('health_records').insert({
      organisation_id: orgId, student_id, record_type,
      title, description: description || null, value: value || null,
      recorded_by: userId || null, recorded_at: new Date().toISOString(),
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async vaccinations(orgId: string, filters: { student_id?: string } = {}) {
    const student_id = filters.student_id && filters.student_id !== 'undefined' && filters.student_id !== 'null' ? filters.student_id : undefined;
    let q = supabase.from('vaccinations')
      .select(`*, student:students(${STUDENT_SELECT})`)
      .eq('organisation_id', orgId);
    if (student_id) q = q.eq('student_id', student_id);
    const { data, error } = await q.order('vaccination_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return (data as any[]) || [];
  }

  async createVaccination(orgId: string, body: any) {
    const { student_id, vaccine_name, vaccination_date, next_due_date, administered_by, notes } = body;
    if (!student_id) throw new BadRequestError('student_id required');
    if (!vaccine_name) throw new BadRequestError('vaccine_name required');
    const { data, error } = await supabase.from('vaccinations').insert({
      organisation_id: orgId, student_id, vaccine_name,
      vaccination_date: vaccination_date || new Date().toISOString().slice(0, 10),
      next_due_date: next_due_date || null,
      administered_by: administered_by || null,
      notes: notes || null,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async medicalRecords(orgId: string, filters: { student_id?: string } = {}) {
    const student_id = filters.student_id && filters.student_id !== 'undefined' && filters.student_id !== 'null' ? filters.student_id : undefined;
    let q = supabase.from('health_medical_records')
      .select(`*, student:students(${STUDENT_SELECT})`)
      .eq('organisation_id', orgId);
    if (student_id) q = q.eq('student_id', student_id);
    const { data, error } = await q.order('record_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return (data as any[]) || [];
  }

  async createMedicalRecord(orgId: string, body: any) {
    const { student_id, record_type, diagnosis, treatment, medication, doctor_name, record_date, notes } = body;
    if (!student_id) throw new BadRequestError('student_id required');
    if (!record_type) throw new BadRequestError('record_type required');
    const { data, error } = await supabase.from('health_medical_records').insert({
      organisation_id: orgId, student_id, record_type,
      diagnosis: diagnosis || null, treatment: treatment || null,
      medication: medication || null, doctor_name: doctor_name || null,
      record_date: record_date || new Date().toISOString().slice(0, 10),
      notes: notes || null,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async emergencyContacts(orgId: string) {
    const { data, error } = await supabase.from('health_emergency_contacts')
      .select(`*, student:students(${STUDENT_SELECT})`)
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return (data as any[]) || [];
  }

  async aiInsights(orgId: string) {
    const [studentsRes, recordsRes, vaccinationsRes, medicalRes, emergencyRes] = await Promise.all([
      supabase.from('students').select('id, full_name, blood_group').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('health_records').select('id, record_type, title, created_at').eq('organisation_id', orgId),
      supabase.from('vaccinations').select('id, student_id, vaccine_name, vaccination_date, next_due_date').eq('organisation_id', orgId),
      supabase.from('health_medical_records').select('id, record_type, diagnosis, created_at').eq('organisation_id', orgId),
      supabase.from('health_emergency_contacts').select('id').eq('organisation_id', orgId),
    ]);
    if (studentsRes.error) throw new BadRequestError(studentsRes.error.message);

    const students = studentsRes.data || [];
    const records = recordsRes.data || [];
    const vaccinations = vaccinationsRes.data || [];
    const medical = medicalRes.data || [];
    const emergency = emergencyRes.data || [];

    const total = students.length || 1;
    const today = new Date(new Date().toDateString());

    const upcoming = vaccinations
      .filter((v: any) => v.next_due_date)
      .map((v: any) => {
        const due = new Date(v.next_due_date);
        const days = Math.round((+due - +today) / 86400000);
        return {
          vaccine_name: v.vaccine_name,
          student_name: students.find((s: any) => s.id === v.student_id)?.full_name || 'Student',
          date: due.toLocaleDateString(),
          days,
        };
      })
      .filter((v: any) => v.days >= 0)
      .sort((a: any, b: any) => a.days - b.days)
      .slice(0, 8);

    const overdue = vaccinations
      .map((v: any) => {
        const due = new Date(v.next_due_date);
        return { ...v, days: Math.round((+today - +due) / 86400000) };
      })
      .filter((v: any) => v.next_due_date && v.days > 0)
      .sort((a: any, b: any) => b.days - a.days);

    const risk_flags: any[] = [];

    if (overdue.length) {
      risk_flags.push({
        title: `${overdue.length} overdue vaccination${overdue.length > 1 ? 's' : ''}`,
        detail: `${overdue[0].vaccine_name} for ${students.find((s: any) => s.id === overdue[0].student_id)?.full_name || 'a student'} is overdue by ${overdue[0].days} day${overdue[0].days > 1 ? 's' : ''}.`,
        severity: overdue.length >= 5 ? 'high' : 'medium',
      });
    }

    const allergyCount = records.filter((r: any) => r.record_type === 'allergy').length;
    if (allergyCount) {
      risk_flags.push({
        title: `${allergyCount} recorded allerg${allergyCount > 1 ? 'ies' : 'y'}`,
        detail: 'Allergy records exist for active students — ensure staff are briefed on emergency protocols.',
        severity: allergyCount >= 5 ? 'high' : 'low',
      });
    }

    const conditions = records.filter((r: any) => r.record_type === 'condition').length;
    if (conditions) {
      risk_flags.push({
        title: `${conditions} chronic condition${conditions > 1 ? 's' : ''} on file`,
        detail: 'Students with chronic conditions should have updated emergency contacts and medication plans.',
        severity: conditions >= 5 ? 'medium' : 'low',
      });
    }

    const noVaccinationCount = students.filter((s: any) => !vaccinations.some((v: any) => v.student_id === s.id)).length;
    if (noVaccinationCount) {
      risk_flags.push({
        title: `${noVaccinationCount} students without vaccination records`,
        detail: `${Math.round((noVaccinationCount / total) * 100)}% of active students have no vaccination history in the system.`,
        severity: noVaccinationCount / total > 0.5 ? 'high' : 'medium',
      });
    }

    const noBloodGroup = students.filter((s: any) => !s.blood_group).length;
    if (noBloodGroup) {
      risk_flags.push({
        title: `${noBloodGroup} students missing blood group`,
        detail: 'Blood group is critical for emergency medical response. Request parents to complete the profile.',
        severity: noBloodGroup / total > 0.5 ? 'medium' : 'low',
      });
    }

    if (!emergency.length) {
      risk_flags.push({
        title: 'No emergency contacts on file',
        detail: 'Encourage parents to upload emergency contact details for every student.',
        severity: 'high',
      });
    }

    const recordCount = records.length + medical.length;
    const withData = new Set([...records.map((r: any) => r.student_id), ...medical.map((r: any) => r.student_id)]).size;
    const engagement = Math.min(100, Math.round((withData / total) * 100));

    let score = 100;
    score -= Math.min(35, overdue.length * 6);
    score -= Math.min(15, noVaccinationCount);
    score -= Math.min(15, noBloodGroup);
    score -= Math.min(20, Math.round((noVaccinationCount / total) * 40));
    score -= Math.min(15, emergency.length ? 0 : 15);
    score = Math.max(5, Math.min(100, score));

    const vaccinationCoverage = Math.min(100, Math.round(((total - noVaccinationCount) / total) * 100));

    const atRiskStudents = students
      .map((s: any) => {
        const flags: string[] = [];
        const studentOverdue = overdue.filter((v: any) => v.student_id === s.id);
        if (studentOverdue.length) flags.push(`${studentOverdue.length} overdue dose${studentOverdue.length > 1 ? 's' : ''}`);
        if (!vaccinations.some((v: any) => v.student_id === s.id)) flags.push('no vaccination record');
        if (!s.blood_group) flags.push('no blood group');
        const allergies = records.filter((r: any) => r.record_type === 'allergy' && r.student_id === s.id).length;
        if (allergies) flags.push(`${allergies} allerg${allergies > 1 ? 'ies' : 'y'}`);
        const conditions = records.filter((r: any) => r.record_type === 'condition' && r.student_id === s.id).length;
        if (conditions) flags.push(`${conditions} condition${conditions > 1 ? 's' : ''}`);
        const injuries = records.filter((r: any) => r.record_type === 'injury' && r.student_id === s.id).length;
        if (injuries) flags.push(`${injuries} injur${injuries > 1 ? 'ies' : 'y'}`);
        return { student: s, flags };
      })
      .filter((x: any) => x.flags.length > 0)
      .sort((a: any, b: any) => b.flags.length - a.flags.length)
      .slice(0, 6)
      .map((x: any) => ({
        id: x.student.id,
        full_name: x.student.full_name,
        blood_group: x.student.blood_group || null,
        flag_count: x.flags.length,
        flags: x.flags.slice(0, 3),
      }));

    const trends: Record<string, any> = {
      vaccination_coverage: `${vaccinationCoverage}%`,
      students_tracked: `${students.length} active`,
      records_on_file: recordCount,
      emergency_contacts: emergency.length,
      engagement_rate: `${engagement}%`,
      overdue_doses: overdue.length,
    };

    const recommendations: string[] = [];
    if (overdue.length) recommendations.push(`Schedule catch-up sessions for ${overdue.length} overdue vaccination${overdue.length > 1 ? 's' : ''}.`);
    if (noBloodGroup) recommendations.push(`Launch a blood group awareness drive — ${noBloodGroup} students are missing this critical field.`);
    if (!emergency.length) recommendations.push('Prompt parents to add emergency contacts through the parent/student portal.');
    if (recordCount === 0) recommendations.push('Encourage parents to submit routine check-up records via the student portal.');
    if (noVaccinationCount) recommendations.push(`Verify vaccination status for ${noVaccinationCount} students with no records.`);
    if (allergyCount) recommendations.push('Circulate the allergy list to the infirmary and relevant class teachers.');
    if (!recommendations.length) recommendations.push('No immediate actions required. Continue maintaining regular health records.');

    return {
      health_score: score,
      engagement_rate: engagement,
      vaccination_coverage: vaccinationCoverage,
      risk_flags: risk_flags.slice(0, 6),
      upcoming_vaccinations: upcoming,
      at_risk_students: atRiskStudents,
      overdue_vaccinations: overdue.slice(0, 5).map((v: any) => ({
        vaccine_name: v.vaccine_name,
        student_name: students.find((s: any) => s.id === v.student_id)?.full_name || 'Student',
        days: v.days,
      })),
      trends,
      recommendations,
      generated_at: new Date().toISOString(),
    };
  }

  async studentProfile(orgId: string, studentId: string) {
    const [studentRes, recordsRes, vaccinationsRes, medicalRes, emergencyRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, blood_group, date_of_birth, gender, status, student_class:classes!students_class_id_fkey(name)').eq('organisation_id', orgId).eq('id', studentId).single(),
      supabase.from('health_records').select('*').eq('organisation_id', orgId).eq('student_id', studentId).order('recorded_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('organisation_id', orgId).eq('student_id', studentId).order('vaccination_date', { ascending: false }),
      supabase.from('health_medical_records').select('*').eq('organisation_id', orgId).eq('student_id', studentId).order('record_date', { ascending: false }),
      supabase.from('health_emergency_contacts').select('*').eq('organisation_id', orgId).eq('student_id', studentId),
    ]);
    if (studentRes.error) throw new NotFoundError('Student not found');
    return {
      ...studentRes.data,
      records: recordsRes.data || [],
      vaccinations: vaccinationsRes.data || [],
      medical_records: medicalRes.data || [],
      emergency_contacts: emergencyRes.data || [],
    };
  }
}

export const healthService = new HealthService();
