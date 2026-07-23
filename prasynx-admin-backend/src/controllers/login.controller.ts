/**
 * Legacy login controller for admin portal
 * Handles admin authentication with inline supabase calls
 */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../lib/backend-common';

export class LoginController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id,full_name,email,password_hash,role')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'User not found' });
    if (!['admin', 'supervisor', 'owner'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { data: organisations } = await supabase.from('organisations').select('*');
    res.json({ user: { id: user.id, full_name: user.full_name, role: user.role }, organisations });
  }
}

export const loginController = new LoginController();
