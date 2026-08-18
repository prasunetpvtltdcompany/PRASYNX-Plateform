import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/backend-common';

export class ParentLoginController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: user, error } = await supabase.from('users')
      .select('id,full_name,email,password_hash,role,organisation_id,status')
      .eq('email', email).single();
    if (error || !user) return res.status(401).json({ error: 'User not found' });
    if (user.role !== 'parent') return res.status(403).json({ error: 'Unauthorized role' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account is not active' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { data: parent } = await supabase.from('parents').select('*').eq('user_id', user.id).eq('organisation_id', user.organisation_id).single();
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    let students: any[] = [];
    const { data: links } = await supabase.from('parent_student_links').select('student_id').eq('parent_id', user.id);
    if (links && links.length > 0) {
      const { data: linked } = await supabase.from('students').select('*').in('id', links.map(l => l.student_id));
      if (linked) students = linked;
    }

    res.json({ parent, user: { id: user.id, full_name: user.full_name, email: user.email, organisation_id: user.organisation_id }, students });
  }
}
export const parentLoginController = new ParentLoginController();
