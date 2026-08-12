import { requestDb } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';
import type { AnnouncementSummary, ModuleConfigDTO, ModuleConfigRow } from '@prasynx/types';

export interface AttendanceStatusCounts {
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface FeeTotals {
  totalCharged: number;
  totalPaid: number;
}

const STAFF_ROLES = [
  'teacher',
  'admin',
  'accountant',
  'librarian',
  'transport_manager',
  'hostel_warden',
  'staff',
  'driver',
  'counsellor',
];

const MODULE_DEFAULTS: Array<{ module_key: string; module_name: string }> = [
  { module_key: 'attendance', module_name: 'Attendance' },
  { module_key: 'staff', module_name: 'Staff Management' },
  { module_key: 'exams', module_name: 'Exams & Grades' },
  { module_key: 'timetable', module_name: 'Timetable' },
  { module_key: 'finance', module_name: 'Fee Management' },
  { module_key: 'hostel', module_name: 'Hostel' },
  { module_key: 'transport', module_name: 'Transport' },
  { module_key: 'library', module_name: 'Library' },
  { module_key: 'health', module_name: 'Health' },
  { module_key: 'communication', module_name: 'Communication' },
];

/**
 * management.repository - the ONLY file in this module allowed to touch Supabase.
 * Uses the per-request RLS client (`requestDb`) so RLS + code-level tenant
 * checks both apply. Re-architected from the legacy dashboard.service.ts and
 * the legacy /module-config management routes.
 */
export class ManagementRepository {
  async countStudents(tenantId: string): Promise<number> {
    const { count, error } = await requestDb()
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', tenantId);
    if (error) throw error;
    return count ?? 0;
  }

  async countStaff(tenantId: string): Promise<number> {
    const { count, error } = await requestDb()
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', tenantId)
      .in('role', STAFF_ROLES);
    if (error) throw error;
    return count ?? 0;
  }

  async countClasses(tenantId: string): Promise<number> {
    const { count, error } = await requestDb()
      .from('classes')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', tenantId);
    if (error) throw error;
    return count ?? 0;
  }

  async countPendingAdmissions(tenantId: string): Promise<number> {
    const { count, error } = await requestDb()
      .from('admission_applications')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', tenantId)
      .eq('status', 'pending');
    if (error) throw error;
    return count ?? 0;
  }

  /** Count attendance_records for a single date, bucketed by status. */
  async attendanceCountsForDay(tenantId: string, date: string): Promise<AttendanceStatusCounts> {
    const { data, error } = await requestDb()
      .from('attendance_records')
      .select('attendance_status')
      .eq('organisation_id', tenantId)
      .eq('attendance_date', date);
    if (error) throw error;
    const counts: AttendanceStatusCounts = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const row of data ?? []) {
      const status = (row.attendance_status ?? 'Present').toLowerCase();
      if (status === 'late') counts.late++;
      else if (status === 'absent') counts.absent++;
      else if (status === 'excused') counts.excused++;
      else counts.present++;
    }
    return counts;
  }

  /** Sum of all student fees charged vs paid for the org. */
  async feeTotals(tenantId: string): Promise<FeeTotals> {
    const { data, error } = await requestDb()
      .from('student_fees')
      .select('total_amount,paid_amount')
      .eq('organisation_id', tenantId);
    if (error) throw error;
    let totalCharged = 0;
    let totalPaid = 0;
    for (const row of data ?? []) {
      totalCharged += row.total_amount ?? 0;
      totalPaid += row.paid_amount ?? 0;
    }
    return { totalCharged, totalPaid };
  }

  async recentAnnouncements(tenantId: string, limit = 5): Promise<AnnouncementSummary[]> {
    const { data, error } = await requestDb()
      .from('announcements')
      .select('id,title,content,priority,published_at,created_at')
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as unknown as AnnouncementSummary[]) ?? [];
  }

  // --- module configuration ---

  async listModuleConfig(tenantId: string): Promise<ModuleConfigDTO[]> {
    const { data, error } = await requestDb()
      .from('module_configuration')
      .select('*')
      .eq('organisation_id', tenantId)
      .order('module_name');
    if (error) throw error;
    return (data as ModuleConfigRow[] ?? []).map((r) => this.toDTO(r));
  }

  async findModuleConfig(tenantId: string, moduleKey: string): Promise<ModuleConfigDTO | null> {
    const { data, error } = await requestDb()
      .from('module_configuration')
      .select('*')
      .eq('organisation_id', tenantId)
      .eq('module_key', moduleKey)
      .maybeSingle();
    if (error) throw error;
    return data ? this.toDTO(data as ModuleConfigRow) : null;
  }

  async upsertModuleConfig(
    tenantId: string,
    moduleKey: string,
    updates: { enabled?: boolean; settings?: Record<string, unknown> },
  ): Promise<ModuleConfigDTO> {
    const existing = await this.findModuleConfig(tenantId, moduleKey);
    if (existing) {
      const changes: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.enabled !== undefined) changes.enabled = updates.enabled;
      if (updates.settings !== undefined) changes.settings = JSON.stringify(updates.settings);
      const { data, error } = await requestDb()
        .from('module_configuration')
        .update(changes)
        .eq('id', existing.id)
        .select()
        .single();
      if (error || !data) throw error ?? new Error('Module config could not be updated');
      return this.toDTO(data as ModuleConfigRow);
    }
    const row = {
      organisation_id: tenantId,
      module_key: moduleKey,
      module_name: moduleKey,
      enabled: updates.enabled ?? true,
      settings: updates.settings !== undefined ? JSON.stringify(updates.settings) : null,
    };
    const { data, error } = await requestDb().from('module_configuration').insert(row).select().single();
    if (error || !data) throw error ?? new Error('Module config could not be created');
    return this.toDTO(data as ModuleConfigRow);
  }

  /** Seed the org with default rows so GET is meaningful before any write. */
  async ensureDefaults(tenantId: string): Promise<ModuleConfigDTO[]> {
    const existing = await this.listModuleConfig(tenantId);
    const existingKeys = new Set(existing.map((m) => m.module_key));
    const missing = MODULE_DEFAULTS.filter((m) => !existingKeys.has(m.module_key));
    for (const m of missing) {
      await this.upsertModuleConfig(tenantId, m.module_key, { enabled: true });
    }
    return this.listModuleConfig(tenantId);
  }

  async deleteModuleConfig(tenantId: string, moduleKey: string): Promise<void> {
    const { error } = await requestDb()
      .from('module_configuration')
      .delete()
      .eq('organisation_id', tenantId)
      .eq('module_key', moduleKey);
    if (error) throw error;
  }

  private toDTO(row: ModuleConfigRow): ModuleConfigDTO {
    let settings: Record<string, unknown> | null = null;
    if (row.settings) {
      try {
        settings = JSON.parse(row.settings) as Record<string, unknown>;
      } catch {
        settings = null;
      }
    }
    return {
      id: row.id,
      organisation_id: row.organisation_id,
      module_key: row.module_key,
      module_name: row.module_name,
      enabled: row.enabled,
      settings,
      updated_at: row.updated_at ?? null,
    };
  }
}

export function assertModuleConfigFound(value: ModuleConfigDTO | null): ModuleConfigDTO {
  if (!value) throw new NotFoundError('Module configuration not found');
  return value;
}
