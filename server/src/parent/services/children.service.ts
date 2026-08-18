import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ChildrenService {
  async getChildren(parentId: string) {
    const { data, error } = await supabase
      .from('parent_student_links')
      .select('student:students(*)')
      .eq('parent_id', parentId);
    if (error) throw new BadRequestError(error.message);
    return data?.map((r: any) => r.student) || [];
  }
}
export const childrenService = new ChildrenService();
