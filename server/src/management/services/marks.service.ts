import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class MarksService {
  async getExamResults(examId: string) {
    const { data, error } = await supabase.from('exam_results')
      .select('*, student:students(full_name, roll_number)')
      .eq('exam_id', examId).order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async enterMarks(orgId: string, body: { exam_id: string; marks: { student_id: string; marks_obtained: number; max_marks: number; remarks?: string }[] }) {
    const { exam_id, marks } = body;
    if (!exam_id || !marks?.length) throw new BadRequestError('exam_id and marks[] required');

    const records = marks.map(m => ({
      organisation_id: orgId,
      exam_id,
      student_id: m.student_id,
      marks_obtained: m.marks_obtained,
      max_marks: m.max_marks,
      remarks: m.remarks,
    }));

    const { data, error } = await supabase.from('exam_results').upsert(records, { onConflict: 'exam_id,student_id' }).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async publishResults(examId: string) {
    const { data, error } = await supabase.from('exams').update({ status: 'results_published' }).eq('id', examId).select().single();
    if (error) throw new BadRequestError(error.message);
    const { error: pubError } = await supabase.from('exam_results').update({ is_published: true }).eq('exam_id', examId);
    if (pubError) throw new BadRequestError(pubError.message);
    return data;
  }

  async getStudentPerformance(orgId: string, studentId: string) {
    const { data, error } = await supabase.from('exam_results')
      .select('*, exam:exams(name, exam_date, subject:subjects(name))')
      .eq('organisation_id', orgId).eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getClassPerformance(orgId: string, classId: string) {
    const { data: exams } = await supabase.from('exams').select('id').eq('organisation_id', orgId).eq('class_id', classId);
    if (!exams?.length) return [];
    const examIds = exams.map(e => e.id);
    const { data, error } = await supabase.from('exam_results')
      .select('*, exam:exams(name), student:students(full_name, roll_number)')
      .in('exam_id', examIds).order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getGradeSummary(orgId: string) {
    const { data, error } = await supabase.from('exam_results')
      .select('marks_obtained, max_marks, student:students(full_name), exam:exams(name, class:classes!exams_class_id_fkey(name))')
      .eq('organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getRankings(orgId: string, examId: string) {
    const { data, error } = await supabase.from('exam_results')
      .select('student_id, marks_obtained, max_marks, student:students(full_name, roll_number)')
      .eq('organisation_id', orgId)
      .eq('exam_id', examId);
    if (error) throw new BadRequestError(error.message);
    if (!data?.length) return [];

    const grouped = new Map<string, { student_id: string; full_name: string; roll_number: string; total: number; max: number; count: number }>();
    for (const r of data) {
      const row = r as any;
      const sid = row.student_id;
      if (!grouped.has(sid)) {
        grouped.set(sid, { student_id: sid, full_name: row.student?.full_name || '', roll_number: row.student?.roll_number || '', total: 0, max: 0, count: 0 });
      }
      const entry = grouped.get(sid)!;
      entry.total += Number((r as any).marks_obtained);
      entry.max += Number((r as any).max_marks);
      entry.count += 1;
    }

    const results = Array.from(grouped.values())
      .map(r => ({ ...r, percentage: r.max > 0 ? Math.round((r.total / r.max) * 10000) / 100 : 0 }))
      .sort((a, b) => b.total - a.total)
      .map((r, i) => ({ rank: i + 1, ...r }));

    return results;
  }

  async getReportCard(orgId: string, studentId: string, examId: string) {
    const { data, error } = await supabase.from('exam_results')
      .select('marks_obtained, max_marks, remarks, exam:exams(name, exam_date), subject:subjects(name)')
      .eq('organisation_id', orgId)
      .eq('student_id', studentId)
      .eq('exam_id', examId);
    if (error) throw new BadRequestError(error.message);
    if (!data?.length) return null;

    const { data: student } = await supabase.from('students')
      .select('full_name, roll_number, class_student_map!inner(class:classes!class_student_map_class_id_fkey(name))')
      .eq('id', studentId).single();

    const examInfo = data[0].exam as any;
    const subjects = data.map((r: any) => ({
      subject: r.subject?.name || '',
      marks_obtained: r.marks_obtained,
      max_marks: r.max_marks,
      percentage: r.max_marks > 0 ? Math.round((Number(r.marks_obtained) / Number(r.max_marks)) * 10000) / 100 : 0,
      remarks: r.remarks,
    }));

    const totalObtained = subjects.reduce((s, x) => s + Number(x.marks_obtained), 0);
    const totalMax = subjects.reduce((s, x) => s + Number(x.max_marks), 0);
    const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;

    let grade = '';
    if (overallPercentage >= 90) grade = 'A+';
    else if (overallPercentage >= 80) grade = 'A';
    else if (overallPercentage >= 70) grade = 'B+';
    else if (overallPercentage >= 60) grade = 'B';
    else if (overallPercentage >= 50) grade = 'C';
    else if (overallPercentage >= 40) grade = 'D';
    else grade = 'F';

    const studentInfo = student as any;
    return {
      student: studentInfo ? { name: studentInfo.full_name, roll: studentInfo.roll_number, class: studentInfo.class_student_map?.class?.name } : null,
      exam: { name: examInfo?.name, date: examInfo?.exam_date },
      subjects,
      summary: { total_obtained: totalObtained, total_max: totalMax, percentage: overallPercentage, grade },
    };
  }
}

export const marksService = new MarksService();
