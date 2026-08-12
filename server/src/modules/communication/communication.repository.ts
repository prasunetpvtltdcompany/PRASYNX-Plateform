import { requestDb } from '../../infrastructure/database/supabase';
import type { NotifyUserTarget } from '@prasynx/types';

export class CommunicationRepository {
  async parentIdsForStudent(studentId: string): Promise<string[]> {
    const { data, error } = await requestDb().from('parent_student_links').select('parent_id').eq('student_id', studentId);
    if (error) return [];
    return ((data as { parent_id?: string }[]) ?? []).map((r) => r.parent_id).filter((x): x is string => Boolean(x));
  }

  async insertNotifications(rows: NotifyUserTarget[]): Promise<void> {
    if (!rows.length) return;
    const { error } = await requestDb().from('notifications').insert(rows);
    if (error) throw error;
  }
}