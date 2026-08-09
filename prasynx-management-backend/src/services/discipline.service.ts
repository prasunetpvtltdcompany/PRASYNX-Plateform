import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

const VALID_STATUS = ['reported', 'under_review', 'actioned', 'resolved', 'closed'];
const VALID_SEVERITY = ['minor', 'moderate', 'major', 'critical'];
const VALID_ACTIONS = ['warning', 'detention', 'suspension', 'expulsion', 'counselling', 'other'];

export class DisciplineService {
  private withJoins(select: string) {
    return supabase.from('behavioral_incidents')
      .select(`${select}, student:students(full_name, roll_number), reported_by_user:users!reported_by(full_name), resolved_by_user:users!resolved_by(full_name)`);
  }

  async list(orgId: string, filters: { status?: string; severity?: string; student_id?: string; search?: string } = {}) {
    const clean = (v?: string) => (v && v !== 'undefined' && v !== 'null' ? v : undefined);
    let q = this.withJoins('*').eq('organisation_id', orgId);
    const status = clean(filters.status);
    const severity = clean(filters.severity);
    const student_id = clean(filters.student_id);
    const search = clean(filters.search);
    if (status) q = q.eq('status', status);
    if (severity) q = q.eq('severity', severity);
    if (student_id) q = q.eq('student_id', student_id);
    if (search) {
      q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    const { data, error } = await q.order('reported_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return (data as any[]) || [];
  }

  async getById(orgId: string, id: string) {
    const { data, error } = await this.withJoins('*').eq('organisation_id', orgId).eq('id', id).single();
    if (error) throw new NotFoundError('Incident not found');
    const row = data as any;
    const log = await this.getLog(orgId, id);
    return { ...row, log };
  }

  async getLog(orgId: string, incidentId: string) {
    const { data, error } = await supabase.from('behavioral_incident_log')
      .select('*, created_by_user:users!created_by(full_name, role)')
      .eq('organisation_id', orgId)
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('[discipline] log fetch skipped:', error.message);
      return [];
    }
    return (data as any[]) || [];
  }

  private async writeLog(orgId: string, incidentId: string, logType: string, payload: { from_value?: string | null; to_value?: string | null; note?: string | null }, userId?: string) {
    const { error } = await supabase.from('behavioral_incident_log').insert({
      incident_id: incidentId,
      organisation_id: orgId,
      log_type: logType,
      from_value: payload.from_value ?? null,
      to_value: payload.to_value ?? null,
      note: payload.note ?? null,
      created_by: userId || null,
    });
    // Logging is best-effort: if the table is missing the incident must still save.
    if (error) console.warn('[discipline] log write skipped:', error.message);
  }

  async uploadEvidence(orgId: string, body: any) {
    const dataUrl: string | undefined = body?.file;
    if (!dataUrl) throw new BadRequestError('file (base64 data URL) required');
    if (typeof dataUrl !== 'string') throw new BadRequestError('Invalid file payload');

    const match = dataUrl.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
    if (!match) throw new BadRequestError('Only JPEG, PNG, WebP or GIF images are allowed');
    const mime = match[1];
    const base64 = match[2];
    const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 2 * 1024 * 1024) throw new BadRequestError('Image must be under 2MB');

    const fileName = `${orgId}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { data, error } = await supabase.storage.from('incident-evidence').upload(fileName, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (error) throw new BadRequestError(`Upload failed: ${error.message}`);
    if (!data?.path) throw new BadRequestError('Upload returned no path');

    const { data: urlData } = await supabase.storage.from('incident-evidence').getPublicUrl(data.path);
    return { url: urlData.publicUrl, path: data.path };
  }

  async create(orgId: string, body: any, userId?: string) {
    const { student_id, incident_type, title, description, severity, location, status, evidence_url } = body;
    if (!student_id) throw new BadRequestError('student_id required');
    if (!title) throw new BadRequestError('title required');
    if (!incident_type) throw new BadRequestError('incident_type required');
    if (severity && !VALID_SEVERITY.includes(severity)) throw new BadRequestError('Invalid severity');
    if (status && !VALID_STATUS.includes(status)) throw new BadRequestError('Invalid status');

    const { data, error } = await supabase.from('behavioral_incidents').insert({
      organisation_id: orgId,
      student_id,
      incident_type,
      title,
      description: description || null,
      severity: severity || 'minor',
      location: location || null,
      reported_by: userId || null,
      status: status || 'reported',
      evidence_url: evidence_url || null,
    }).select().single();
    if (error) throw new BadRequestError(error.message);

    await this.writeLog(orgId, data.id, 'reported', { to_value: 'reported', note: title }, userId);
    return this.getById(orgId, data.id);
  }

  async update(orgId: string, id: string, body: any, userId?: string) {
    const { data: existing } = await supabase.from('behavioral_incidents').select('status, action_taken, action_detail, resolution_notes, reported_by, reported_at, resolved_at').eq('organisation_id', orgId).eq('id', id).single();
    if (!existing) throw new NotFoundError('Incident not found');

    const fields = ['incident_type', 'title', 'description', 'severity', 'location', 'action_taken', 'action_detail', 'action_date', 'status', 'resolution_notes'];
    const patch: any = {};
    fields.forEach(f => { if (body[f] !== undefined) patch[f] = body[f] || null; });

    if (patch.severity && !VALID_SEVERITY.includes(patch.severity)) throw new BadRequestError('Invalid severity');
    if (patch.status && !VALID_STATUS.includes(patch.status)) throw new BadRequestError('Invalid status');
    if (patch.action_taken && !VALID_ACTIONS.includes(patch.action_taken)) throw new BadRequestError('Invalid action');

    if (patch.status && ['resolved', 'closed'].includes(patch.status)) {
      patch.resolved_by = userId || null;
      patch.resolved_at = new Date().toISOString();
    }
    if (patch.status && patch.status === 'reported') {
      patch.resolved_by = null;
      patch.resolved_at = null;
    }

    const { error } = await supabase.from('behavioral_incidents').update(patch).eq('organisation_id', orgId).eq('id', id);
    if (error) throw new BadRequestError(error.message);

    if (patch.status && patch.status !== existing.status) {
      await this.writeLog(orgId, id, 'status_change', { from_value: existing.status, to_value: patch.status, note: `Status changed to ${patch.status.replace('_', ' ')}` }, userId);
    }
    if (patch.action_taken !== undefined && patch.action_taken !== (existing.action_taken || null)) {
      await this.writeLog(orgId, id, 'action_taken', {
        from_value: existing.action_taken || null,
        to_value: patch.action_taken,
        note: patch.action_taken ? `Action: ${patch.action_taken.replace('_', ' ')}${patch.action_detail ? ' — ' + patch.action_detail : ''}` : 'Action removed',
      }, userId);
    }
    if (patch.resolution_notes !== undefined && patch.resolution_notes !== (existing.resolution_notes || null) && patch.resolution_notes) {
      await this.writeLog(orgId, id, 'resolution', { to_value: 'resolved', note: patch.resolution_notes }, userId);
    }

    return this.getById(orgId, id);
  }

  async remove(orgId: string, id: string) {
    const { error } = await supabase.from('behavioral_incidents').delete().eq('organisation_id', orgId).eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async dashboard(orgId: string) {
    const { data, error } = await supabase.from('behavioral_incidents')
      .select('id, severity, status, student_id, incident_type, action_taken, reported_by, reported_at, title')
      .eq('organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);
    const incidents = data || [];

    const statusCount = (s: string) => incidents.filter(i => i.status === s).length;
    const severityCount = (s: string) => incidents.filter(i => i.severity === s).length;
    const actionCount = (a: string) => incidents.filter(i => i.action_taken === a).length;

    const byStudent = new Map<string, number>();
    incidents.forEach(i => byStudent.set(i.student_id, (byStudent.get(i.student_id) || 0) + 1));
    const repeatOffenders = [...byStudent.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const monthly = incidents.filter(i => new Date(i.reported_at) >= new Date(last30)).length;

    // Resolve rate: resolved/closed vs total
    const resolved = statusCount('resolved') + statusCount('closed');
    const resolveRate = incidents.length ? Math.round((resolved / incidents.length) * 100) : 0;

    const active = incidents.filter(i => !['resolved', 'closed'].includes(i.status));

    return {
      total_incidents: incidents.length,
      open_incidents: active.length,
      resolved: resolved,
      pending_action: active.filter(i => !i.action_taken).length,
      avg_resolution_days: this.avgResolutionDays(incidents),
      by_status: {
        reported: statusCount('reported'),
        under_review: statusCount('under_review'),
        actioned: statusCount('actioned'),
        resolved: statusCount('resolved'),
        closed: statusCount('closed'),
      },
      by_severity: {
        minor: severityCount('minor'),
        moderate: severityCount('moderate'),
        major: severityCount('major'),
        critical: severityCount('critical'),
      },
      by_action: {
        warning: actionCount('warning'),
        detention: actionCount('detention'),
        suspension: actionCount('suspension'),
        expulsion: actionCount('expulsion'),
        counselling: actionCount('counselling'),
        other: actionCount('other'),
        none: incidents.filter(i => !i.action_taken).length,
      },
      by_type: this.countBy(incidents, 'incident_type'),
      repeat_offenders: repeatOffenders.map(([student_id, count]) => ({ student_id, count })),
      incidents_last_30_days: monthly,
      resolve_rate: resolveRate,
      trending: this.trending(incidents),
    };
  }

  private countBy(items: any[], key: string) {
    const map: Record<string, number> = {};
    items.forEach(i => { const v = i[key] || 'Unspecified'; map[v] = (map[v] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
  }

  private avgResolutionDays(incidents: any[]) {
    const resolvedList = incidents.filter(i => ['resolved', 'closed'].includes(i.status) && i.reported_at && i.resolved_at);
    if (!resolvedList.length) return 0;
    const total = resolvedList.reduce((sum, i) => {
      const ms = new Date(i.resolved_at).getTime() - new Date(i.reported_at).getTime();
      return sum + Math.max(0, ms) / (24 * 60 * 60 * 1000);
    }, 0);
    return Math.round((total / resolvedList.length) * 10) / 10;
  }

  private trending(incidents: any[]) {
    const map: Record<string, number> = {};
    incidents.forEach(i => {
      const d = new Date(i.reported_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-6).map(([month, count]) => ({ month, count }));
  }
}

export const disciplineService = new DisciplineService();
