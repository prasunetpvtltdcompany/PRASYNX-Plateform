/**
 * Legacy organisation controller for admin portal
 * Handles org verification, creation, and management access with inline supabase calls
 */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase, generatePassword } from '../lib/backend-common';
import { logCredential } from '../lib/credentialStore';
import { createAuthUser } from '../lib/auth-helper';

export class OrganisationController {
  async verifyOrg(req: Request, res: Response) {
    const { organisation_id, status } = req.body;
    if (!organisation_id || !status) {
      return res.status(400).json({ error: 'organisation_id and status required' });
    }

    const { error: orgError } = await supabase.from('organisations').update({ status }).eq('id', organisation_id);
    if (orgError) return res.status(500).json({ error: orgError.message });

    const userStatus = status === 'verified' ? 'active' : 'pending';
    const { error: userError } = await supabase
      .from('users')
      .update({ status: userStatus })
      .eq('organisation_id', organisation_id)
      .eq('role', 'management');

    if (userError) return res.status(500).json({ error: userError.message });
    return res.json({ message: 'Organisation and management access status updated' });
  }

  async createOrganisation(req: Request, res: Response) {
    const { name, address, phone, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }

    try {
      const { data: org, error: orgError } = await supabase
        .from('organisations')
        .insert({ name, address, phone, email, status: 'verified' })
        .select()
        .single();

      if (orgError) throw orgError;

      const password = generatePassword();
      const password_hash = await bcrypt.hash(password, 10);

      const { data: user, error: userError } = await supabase.from('users').insert({
        organisation_id: org.id,
        full_name: name,
        email,
        password_hash,
        role: 'management',
        status: 'active'
      }).select().single();

      if (userError) throw userError;

      logCredential(org.id, name, name, email, 'management', 'Admin Portal');

      res.json({
        success: true,
        message: 'Organisation created',
        organisation: org,
        credentials: { email, password, full_name: name, role: 'management' },
        user_id: user.id
      });
    } catch (error: any) {
      const message = error.message?.includes('fetch failed')
        ? 'Unable to reach Supabase. Check SUPABASE_URL and network connectivity.'
        : error.message;
      res.status(500).json({ error: message });
    }
  }

  async createManagementAccess(req: Request, res: Response) {
    const { organisation_id, full_name, email } = req.body;

    if (!organisation_id || !full_name || !email) {
      return res.status(400).json({ error: 'organisation_id, full_name, and email required' });
    }

    try {
      const password = generatePassword();
      const password_hash = await bcrypt.hash(password, 10);

      const { data: user, error: userError } = await supabase.from('users').insert({
        organisation_id,
        full_name,
        email,
        password_hash,
        role: 'management',
        status: 'active'
      }).select().single();

      if (userError) throw userError;

      try {
        await createAuthUser(email, password, full_name, 'management', organisation_id);
      } catch (authError: any) {
        await supabase.from('users').delete().eq('id', user.id);
        throw authError;
      }

      const { data: org } = await supabase.from('organisations').select('name').eq('id', organisation_id).maybeSingle();
      const orgName = org?.name || '';
      logCredential(organisation_id, orgName, full_name, email, 'management', 'Admin Portal');

      res.json({
        success: true,
        message: 'Management access created',
        credentials: {
          email,
          password,
          full_name,
          role: 'management'
        },
        user_id: user.id
      });
    } catch (error: any) {
      const message = error.message?.includes('fetch failed')
        ? 'Unable to reach Supabase. Check SUPABASE_URL and network connectivity.'
        : error.message;
      res.status(500).json({ error: message });
    }
  }
}

export const organisationController = new OrganisationController();
