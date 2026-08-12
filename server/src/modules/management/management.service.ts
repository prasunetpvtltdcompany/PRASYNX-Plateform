import { ManagementRepository } from './management.repository';
import type {
  ManagementDashboardDTO,
  ModuleConfigDTO,
} from '@prasynx/types';

/**
 * Management portal domain logic, re-architected from the legacy
 * dashboard.service.ts and /module-config management routes into the monolith
 * repository/service pattern.
 */
export class ManagementService {
  constructor(private repo: ManagementRepository) {}

  /** Aggregate the org-scoped management dashboard in a single request. */
  async dashboard(tenantId: string): Promise<ManagementDashboardDTO> {
    const today = new Date().toISOString().slice(0, 10);

    const [totalStudents, totalStaff, totalClasses, pendingAdmissions, attendanceToday, fee, recentAnnouncements] =
      await Promise.all([
        this.repo.countStudents(tenantId),
        this.repo.countStaff(tenantId),
        this.repo.countClasses(tenantId),
        this.repo.countPendingAdmissions(tenantId),
        this.repo.attendanceCountsForDay(tenantId, today),
        this.repo.feeTotals(tenantId),
        this.repo.recentAnnouncements(tenantId, 5),
      ]);

    const attendanceTotal = attendanceToday.present + attendanceToday.absent + attendanceToday.late + attendanceToday.excused;
    const attendancePercentage = attendanceTotal > 0 ? Math.round((attendanceToday.present / attendanceTotal) * 100) : 0;

    return {
      stats: {
        totalStudents,
        totalStaff,
        totalClasses,
        pendingAdmissions,
        attendanceToday: { ...attendanceToday, total: attendanceTotal, percentage: attendancePercentage },
        feeOverview: { ...fee, outstanding: Math.max(0, fee.totalCharged - fee.totalPaid) },
      },
      recentAnnouncements,
    };
  }

  /** List enabled modules for the org, seeding defaults on first read. */
  async listModules(tenantId: string): Promise<ModuleConfigDTO[]> {
    return this.repo.ensureDefaults(tenantId);
  }

  async getModule(tenantId: string, moduleKey: string): Promise<ModuleConfigDTO | null> {
    return this.repo.findModuleConfig(tenantId, moduleKey);
  }

  async updateModule(
    tenantId: string,
    moduleKey: string,
    updates: { enabled?: boolean; settings?: Record<string, unknown> },
  ): Promise<ModuleConfigDTO> {
    return this.repo.upsertModuleConfig(tenantId, moduleKey, updates);
  }

  async deleteModule(tenantId: string, moduleKey: string): Promise<void> {
    await this.repo.deleteModuleConfig(tenantId, moduleKey);
  }
}

export const managementService = new ManagementService(new ManagementRepository());
