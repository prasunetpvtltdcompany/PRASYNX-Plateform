import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class FeeService {
  async getFeesSummary(parentId: string) {
    const { data: links, error: linksError } = await supabase
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parentId);
    if (linksError) throw new BadRequestError(linksError.message);

    const studentIds = links?.map((r: any) => r.student_id) || [];
    const [feesResult, documentsResult] = await Promise.all([
      supabase.from('student_fees').select('*, payments:fee_payments(*)').in('student_id', studentIds),
      supabase.from('documents').select('*').in('user_id', studentIds).in('document_type', ['Receipt', 'Tax Statement'])
    ]);

    const fees = feesResult.data || [];
    const totalDue = fees.reduce((s: number, f: any) => f.status === 'pending' ? s + parseFloat(f.amount || 0) : s, 0);
    const totalPaid = fees.reduce((s: number, f: any) => {
      return s + (f.payments?.reduce((ss: number, p: any) => ss + parseFloat(p.amount_paid || 0), 0) || 0);
    }, 0);
    const overdueCount = fees.filter((f: any) => f.status === 'overdue').length;

    return { studentFees: fees, feeDocuments: documentsResult.data || [], totalDue, totalPaid, overdueCount };
  }

  async getFeesByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false });

    if (error) throw new BadRequestError(error.message);

    const fees = data || [];
    const totalDue = fees.reduce((s: number, f: any) => f.status === 'pending' ? s + parseFloat(f.amount || 0) : s, 0);
    const totalPaid = fees.reduce((s: number, f: any) => s + parseFloat(f.paid_amount || 0), 0);
    const overdueCount = fees.filter((f: any) => f.status === 'overdue').length;

    return { studentFees: fees, totalDue, totalPaid, overdueCount };
  }
}
export const feeService = new FeeService();
