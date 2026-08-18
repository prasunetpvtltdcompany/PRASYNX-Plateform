import { Router, Request, Response } from 'express';
import { supabase } from '../../config/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../../lib/mail.service';
import { config } from '../../config';
import { authenticate } from '../middleware/auth';

/**
 * Job Provider API — ported from prasynx-jobprovider-backend (self-contained
 * under src/jobprovider). Mounted at /api/job-provider.
 */
const router = Router();

// ==================== AUTH ====================

router.post('/register', async (req: Request, res: Response) => {
  const { company_name, contact_name, email, password, phone, website } = req.body;
  if (!company_name || !contact_name || !email || !password) {
    return res.status(400).json({ error: 'Required: company_name, contact_name, email, password' });
  }
  try {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const { data: user, error: userError } = await supabase.from('users').insert({
      full_name: contact_name,
      email,
      password_hash: hashed,
      role: 'job_provider',
      organisation_id: null,
      status: 'active',
    }).select().single();
    if (userError) throw userError;
    const { data: provider, error: providerError } = await supabase.from('job_providers').insert({
      user_id: user.id,
      company_name,
      contact_name,
      phone: phone || '',
      website: website || '',
    }).select().single();
    if (providerError) {
      await supabase.from('users').delete().eq('id', user.id);
      throw providerError;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'job_provider', organisationId: null },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
    res.status(201).json({
      token,
      provider: {
        id: provider.id,
        company_name: provider.company_name,
        contact_name: provider.contact_name,
        email: user.email,
        phone: provider.phone,
        website: provider.website,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Required: email, password' });
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, status')
      .eq('email', email)
      .eq('role', 'job_provider')
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account is not active' });
    const { data: provider } = await supabase
      .from('job_providers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'job_provider', organisationId: null },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json({
      token,
      provider: {
        id: provider.id,
        company_name: provider.company_name,
        contact_name: provider.contact_name,
        email: user.email,
        phone: provider.phone,
        website: provider.website,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PASSWORD RESET ====================

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('role', 'job_provider')
      .maybeSingle();
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await supabase.from('password_reset_tokens').insert({
      email,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, resetLink);
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res.status(400).json({ error: 'Email, token, and new password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: storedToken } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .maybeSingle();
    if (!storedToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    if (new Date(storedToken.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', storedToken.id);
    if (tokenError) throw tokenError;
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashed })
      .eq('email', email)
      .eq('role', 'job_provider');
    if (updateError) throw updateError;
    res.json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh-token', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], config.jwtSecret) as any;
    const token = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role, organisationId: decoded.organisationId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
    res.json({ token, expires_in: config.jwtExpiresIn });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ==================== DASHBOARD ====================

router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data: jobs } = await supabase
      .from('part_time_jobs')
      .select('id, title, status, created_at')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    const { data: applications } = await supabase
      .from('part_time_job_applications')
      .select('id, status, part_time_jobs!inner(provider_id)')
      .eq('part_time_jobs.provider_id', providerId);
    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter((j: any) => j.status === 'active').length || 0;
    const totalApps = applications?.length || 0;
    const pendingApps = applications?.filter((a: any) => a.status === 'pending').length || 0;
    res.json({
      totalJobs,
      activeJobs,
      totalApplications: totalApps,
      pendingApplications: pendingApps,
      recentJobs: jobs?.slice(0, 5) || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== JOBS CRUD ====================

router.get('/jobs', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data, error } = await supabase
      .from('part_time_jobs')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/jobs', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const body = req.body;
  const allowedFields = ['title', 'description', 'type', 'area', 'pay_type', 'pay_amount', 'duration', 'slots', 'skills', 'contact_info', 'target_role'];
  const jobData: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) jobData[field] = body[field];
  }
  if (!jobData.title) return res.status(400).json({ error: 'Required: title' });
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    jobData.provider_id = provider.id;
    jobData.status = 'active';
    const { data, error } = await supabase.from('part_time_jobs').insert(jobData).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/jobs/:id', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  const body = req.body;
  const allowedFields = ['title', 'description', 'type', 'area', 'pay_type', 'pay_amount', 'duration', 'slots', 'skills', 'contact_info', 'target_role', 'status'];
  const updates: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data: job } = await supabase.from('part_time_jobs').select('provider_id').eq('id', id).maybeSingle();
    if (!job || job.provider_id !== providerId) return res.status(403).json({ error: 'Not your job' });
    const { data, error } = await supabase.from('part_time_jobs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/jobs/:id', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data: job } = await supabase.from('part_time_jobs').select('provider_id').eq('id', id).maybeSingle();
    if (!job || job.provider_id !== providerId) return res.status(403).json({ error: 'Not your job' });
    const { error } = await supabase.from('part_time_jobs').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== APPLICATIONS ====================

router.get('/jobs/:id/applications', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data: job } = await supabase.from('part_time_jobs').select('provider_id').eq('id', id).maybeSingle();
    if (!job || job.provider_id !== providerId) return res.status(403).json({ error: 'Not your job' });
    const { data, error } = await supabase
      .from('part_time_job_applications')
      .select('*')
      .eq('job_id', id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/applications/:id/status', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'shortlisted', 'interview', 'hired', 'rejected'];
  if (!status) return res.status(400).json({ error: 'Required: status' });
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data: app } = await supabase
      .from('part_time_job_applications')
      .select('id, job_id')
      .eq('id', id)
      .maybeSingle();
    if (!app) return res.status(404).json({ error: 'Application not found' });
    const { data: job } = await supabase.from('part_time_jobs').select('provider_id').eq('id', app.job_id).maybeSingle();
    if (!job || job.provider_id !== providerId) return res.status(403).json({ error: 'Not your job' });
    const { data, error } = await supabase
      .from('part_time_job_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ALL APPLICATIONS (across all jobs) ====================

router.get('/applications', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { status } = req.query;
    let query = supabase
      .from('part_time_job_applications')
      .select('*, part_time_jobs!inner(title, provider_id)')
      .eq('part_time_jobs.provider_id', providerId);
    if (status && status !== 'all') query = query.eq('status', status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/applications/shortlisted', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data, error } = await supabase
      .from('part_time_job_applications')
      .select('*, part_time_jobs!inner(title, provider_id)')
      .eq('part_time_jobs.provider_id', providerId)
      .eq('status', 'shortlisted')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/applications/interviews', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data, error } = await supabase
      .from('part_time_job_applications')
      .select('*, part_time_jobs!inner(title, provider_id)')
      .eq('part_time_jobs.provider_id', providerId)
      .eq('status', 'interview')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/applications/hired', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data, error } = await supabase
      .from('part_time_job_applications')
      .select('*, part_time_jobs!inner(title, provider_id)')
      .eq('part_time_jobs.provider_id', providerId)
      .eq('status', 'hired')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD ENHANCED ====================

router.get('/dashboard/enhanced', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const providerId = provider.id;
    const { data: jobs } = await supabase
      .from('part_time_jobs')
      .select('id, title, status, created_at, pay_amount, pay_type')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    const { data: applications } = await supabase
      .from('part_time_job_applications')
      .select('id, status, created_at, applicant_role, part_time_jobs!inner(provider_id,title)')
      .eq('part_time_jobs.provider_id', providerId);

    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter((j: any) => j.status === 'active').length || 0;
    const closedJobs = jobs?.filter((j: any) => j.status === 'closed' || j.status === 'filled').length || 0;

    const totalApps = applications?.length || 0;
    const pendingApps = applications?.filter((a: any) => a.status === 'pending').length || 0;
    const shortlistedApps = applications?.filter((a: any) => a.status === 'shortlisted').length || 0;
    const interviewApps = applications?.filter((a: any) => a.status === 'interview').length || 0;
    const hiredApps = applications?.filter((a: any) => a.status === 'hired').length || 0;
    const rejectedApps = applications?.filter((a: any) => a.status === 'rejected').length || 0;

    const appsByRole: Record<string, number> = {};
    applications?.forEach((a: any) => {
      const role = a.applicant_role || 'unknown';
      appsByRole[role] = (appsByRole[role] || 0) + 1;
    });

    const appsOverTime: Record<string, number> = {};
    applications?.forEach((a: any) => {
      const day = a.created_at?.split('T')[0] || 'unknown';
      appsOverTime[day] = (appsOverTime[day] || 0) + 1;
    });

    res.json({
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications: totalApps,
      pendingApplications: pendingApps,
      shortlisted: shortlistedApps,
      interviews: interviewApps,
      hired: hiredApps,
      rejected: rejectedApps,
      conversionRate: totalApps > 0 ? Math.round((hiredApps / totalApps) * 100) : 0,
      appsByRole,
      appsOverTime: Object.entries(appsOverTime).map(([date, count]) => ({ date, count })),
      recentJobs: jobs?.slice(0, 5) || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MESSAGES ====================

router.post('/messages', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { application_id, message } = req.body;
  if (!application_id || !message) return res.status(400).json({ error: 'Required: application_id, message' });
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const { data, error } = await supabase
      .from('provider_messages')
      .insert({
        provider_id: provider.id,
        application_id,
        message,
        direction: 'outbound',
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/messages', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data: provider } = await supabase.from('job_providers').select('id').eq('user_id', userId).maybeSingle();
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    const { data, error } = await supabase
      .from('provider_messages')
      .select('*, part_time_job_applications!inner(job_id, applicant_name)')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROFILE ====================

router.get('/profile', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const { data, error } = await supabase.from('job_providers').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Provider not found' });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { company_name, contact_name, phone, website, description, logo_url, location } = req.body;
  try {
    const updates: any = {};
    if (company_name !== undefined) updates.company_name = company_name;
    if (contact_name !== undefined) updates.contact_name = contact_name;
    if (phone !== undefined) updates.phone = phone;
    if (website !== undefined) updates.website = website;
    if (description !== undefined) updates.description = description;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (location !== undefined) updates.location = location;
    const { data, error } = await supabase
      .from('job_providers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SETTINGS ====================

router.patch('/settings', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { email_notifications, sms_notifications, auto_respond } = req.body;
  try {
    const { data, error } = await supabase
      .from('job_providers')
      .update({
        email_notifications: email_notifications ?? true,
        sms_notifications: sms_notifications ?? false,
        auto_respond: auto_respond ?? false,
      })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    res.json({
      success: true,
      settings: {
        email_notifications: data.email_notifications,
        sms_notifications: data.sms_notifications,
        auto_respond: data.auto_respond,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;