import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class BiometricsService {
  // ==================== DASHBOARD ====================
  async getDashboard(orgId: string) {
    const [devicesRes, templatesRes, logsRes] = await Promise.all([
      supabase.from('biometric_devices').select('*').eq('organisation_id', orgId),
      supabase.from('biometric_templates').select('id, template_type, is_active', { count: 'exact' }).eq('organisation_id', orgId),
      supabase.from('biometric_attendance_logs').select('*', { count: 'exact' }).eq('organisation_id', orgId).order('verified_at', { ascending: false }).limit(50),
    ]);

    const devices = devicesRes.data || [];
    const templates = templatesRes.data || [];
    const recentLogs = logsRes.data || [];

    const activeDevices = devices.filter(d => d.status === 'active').length;
    const activeTemplates = templates.filter(t => t.is_active).length;
    const todayLogs = recentLogs.filter(l => {
      const d = new Date(l.verified_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    });

    return {
      summary: {
        totalDevices: devices.length,
        activeDevices,
        totalTemplates: templates.length,
        activeTemplates,
        totalLogs: logsRes.count || 0,
        todayLogs: todayLogs.length,
      },
      recentLogs,
      deviceBreakdown: devices.reduce((acc: any, d: any) => {
        acc[d.device_type] = (acc[d.device_type] || 0) + 1;
        return acc;
      }, {}),
      statusBreakdown: devices.reduce((acc: any, d: any) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  // ==================== DEVICES ====================
  async getDevices(orgId: string) {
    const { data } = await supabase
      .from('biometric_devices')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async createDevice(orgId: string, data: any) {
    const device = {
      organisation_id: orgId,
      device_name: data.device_name,
      device_type: data.device_type,
      model: data.model,
      serial_number: data.serial_number,
      location: data.location,
      ip_address: data.ip_address,
      port: data.port,
      api_endpoint: data.api_endpoint,
      api_key: data.api_key,
      status: data.status || 'inactive',
      firmware_version: data.firmware_version,
      settings: data.settings || {},
    };
    const { data: result, error } = await supabase.from('biometric_devices').insert(device).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateDevice(deviceId: string, data: any) {
    const { data: result, error } = await supabase.from('biometric_devices').update(data).eq('id', deviceId).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteDevice(deviceId: string) {
    const { error } = await supabase.from('biometric_devices').delete().eq('id', deviceId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // ==================== TEMPLATES ====================
  async getTemplates(orgId: string, userId?: string) {
    let query = supabase
      .from('biometric_templates')
      .select('*, device:biometric_devices(device_name, device_type)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query;
    return data || [];
  }

  async enrollTemplate(orgId: string, data: any) {
    const template = {
      organisation_id: orgId,
      user_id: data.user_id,
      user_type: data.user_type,
      device_id: data.device_id,
      template_type: data.template_type,
      template_data: data.template_data,
      template_hash: data.template_hash,
      quality_score: data.quality_score,
      is_active: data.is_active ?? true,
      expiry_date: data.expiry_date,
    };
    const { data: result, error } = await supabase.from('biometric_templates').insert(template).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateTemplate(templateId: string, data: any) {
    const { data: result, error } = await supabase.from('biometric_templates').update(data).eq('id', templateId).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteTemplate(templateId: string) {
    const { error } = await supabase.from('biometric_templates').delete().eq('id', templateId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // ==================== ATTENDANCE LOGS ====================
  async getAttendanceLogs(orgId: string, filters?: { userId?: string; deviceId?: string; status?: string; from?: string; to?: string }) {
    let query = supabase
      .from('biometric_attendance_logs')
      .select('*, device:biometric_devices(device_name, device_type)')
      .eq('organisation_id', orgId)
      .order('verified_at', { ascending: false })
      .limit(100);

    if (filters?.userId) query = query.eq('user_id', filters.userId);
    if (filters?.deviceId) query = query.eq('device_id', filters.deviceId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.from) query = query.gte('verified_at', filters.from);
    if (filters?.to) query = query.lte('verified_at', filters.to);

    const { data } = await query;
    return data || [];
  }

  async recordAttendance(orgId: string, data: any) {
    const log = {
      organisation_id: orgId,
      device_id: data.device_id,
      user_id: data.user_id,
      user_type: data.user_type,
      template_id: data.template_id,
      verification_type: data.verification_type,
      match_score: data.match_score,
      status: data.status || 'verified',
      error_message: data.error_message,
      direction: data.direction,
      verified_at: data.verified_at || new Date().toISOString(),
    };
    const { data: result, error } = await supabase.from('biometric_attendance_logs').insert(log).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  // ==================== DEVICE ASSIGNMENTS ====================
  async getAssignments(orgId: string, deviceId?: string) {
    let query = supabase
      .from('biometric_device_assignments')
      .select('*, device:biometric_devices(device_name, device_type)')
      .eq('organisation_id', orgId)
      .order('assigned_at', { ascending: false });
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data } = await query;
    return data || [];
  }

  async createAssignment(orgId: string, data: any) {
    const assignment = {
      organisation_id: orgId,
      device_id: data.device_id,
      location_type: data.location_type,
      location_id: data.location_id,
      location_name: data.location_name,
      is_primary: data.is_primary ?? false,
      schedule: data.schedule || {},
    };
    const { data: result, error } = await supabase.from('biometric_device_assignments').insert(assignment).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteAssignment(assignmentId: string) {
    const { error } = await supabase.from('biometric_device_assignments').delete().eq('id', assignmentId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }
}

export const biometricsService = new BiometricsService();
