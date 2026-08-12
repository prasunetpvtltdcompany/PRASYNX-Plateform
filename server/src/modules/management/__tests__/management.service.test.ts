import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManagementService } from '../management.service';
import type { ManagementRepository } from '../management.repository';
import type { AnnouncementSummary, ModuleConfigDTO } from '@prasynx/types';

const ORG = '00000000-0000-0000-0000-00000000000a';
const TODAY = new Date().toISOString().slice(0, 10);

const announcement = (i: number): AnnouncementSummary => ({
  id: `00000000-0000-0000-0000-0000000000a${i}`,
  title: `Notice ${i}`,
  content: null,
  priority: 'normal',
  published_at: null,
  created_at: new Date().toISOString(),
});

const moduleConfig = (key: string, enabled: boolean): ModuleConfigDTO => ({
  id: `00000000-0000-0000-0000-00000000000${key.length}`,
  organisation_id: ORG,
  module_key: key,
  module_name: key,
  enabled,
  settings: null,
  updated_at: null,
});

function stubRepo(): ManagementRepository {
  return {
    countStudents: async () => 120,
    countStaff: async () => 18,
    countClasses: async () => 12,
    countPendingAdmissions: async () => 3,
    attendanceCountsForDay: async (_t: string, date: string) =>
      date === TODAY ? { present: 90, absent: 6, late: 3, excused: 1 } : { present: 0, absent: 0, late: 0, excused: 0 },
    feeTotals: async () => ({ totalCharged: 250000, totalPaid: 175000 }),
    recentAnnouncements: async () => [announcement(1), announcement(2)],
    listModuleConfig: async () => [moduleConfig('attendance', true), moduleConfig('finance', false)],
    findModuleConfig: async (_t: string, key: string) => (key === 'attendance' ? moduleConfig('attendance', true) : null),
    upsertModuleConfig: async (_t: string, key: string, updates: { enabled?: boolean; settings?: Record<string, unknown> }) => {
      const base = moduleConfig(key, updates.enabled ?? true);
      if (updates.settings !== undefined) base.settings = updates.settings;
      return base;
    },
    ensureDefaults: async (_t: string) => [moduleConfig('attendance', true), moduleConfig('finance', false)],
    deleteModuleConfig: async () => {},
  } as unknown as ManagementRepository;
}

describe('ManagementService', () => {
  let service: ManagementService;

  beforeEach(() => {
    service = new ManagementService(stubRepo());
  });

  describe('dashboard', () => {
    it('aggregates counts, attendance and fee overview in a single call', async () => {
      const dash = await service.dashboard(ORG);
      expect(dash.stats.totalStudents).toBe(120);
      expect(dash.stats.totalStaff).toBe(18);
      expect(dash.stats.totalClasses).toBe(12);
      expect(dash.stats.pendingAdmissions).toBe(3);
      expect(dash.stats.attendanceToday).toEqual({ total: 100, present: 90, absent: 6, late: 3, excused: 1, percentage: 90 });
      expect(dash.stats.feeOverview).toEqual({ totalCharged: 250000, totalPaid: 175000, outstanding: 75000 });
      expect(dash.recentAnnouncements).toHaveLength(2);
    });

    it('returns zero attendance percentage when no records exist', async () => {
      const repo = stubRepo();
      repo.attendanceCountsForDay = async () => ({ present: 0, absent: 0, late: 0, excused: 0 });
      const dash = await new ManagementService(repo).dashboard(ORG);
      expect(dash.stats.attendanceToday.total).toBe(0);
      expect(dash.stats.attendanceToday.percentage).toBe(0);
    });

    it('never reports negative outstanding fees', async () => {
      const repo = stubRepo();
      repo.feeTotals = async () => ({ totalCharged: 1000, totalPaid: 2500 });
      const dash = await new ManagementService(repo).dashboard(ORG);
      expect(dash.stats.feeOverview.outstanding).toBe(0);
    });
  });

  describe('module configuration', () => {
    it('lists modules, seeding defaults through the repo', async () => {
      const modules = await service.listModules(ORG);
      expect(modules).toHaveLength(2);
      expect(modules.find((m) => m.module_key === 'finance')?.enabled).toBe(false);
    });

    it('returns null for an unknown module', async () => {
      const mod = await service.getModule(ORG, 'nope');
      expect(mod).toBeNull();
    });

    it('updates a module with enabled + settings', async () => {
      const updated = await service.updateModule(ORG, 'attendance', { enabled: false, settings: { allowLate: true } });
      expect(updated.enabled).toBe(false);
      expect(updated.settings).toEqual({ allowLate: true });
    });

    it('deletes a module', async () => {
      const deleteSpy = vi.fn();
      const repo = stubRepo();
      repo.deleteModuleConfig = deleteSpy;
      await new ManagementService(repo).deleteModule(ORG, 'finance');
      expect(deleteSpy).toHaveBeenCalledWith(ORG, 'finance');
    });
  });
});
