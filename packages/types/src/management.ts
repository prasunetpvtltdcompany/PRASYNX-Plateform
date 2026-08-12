/** Management portal module DTOs (re-architected from the legacy management backend). */

export interface AttendanceTodayCounts {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface FeeOverview {
  totalCharged: number;
  totalPaid: number;
  outstanding: number;
}

export interface ManagementDashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  pendingAdmissions: number;
  attendanceToday: AttendanceTodayCounts;
  feeOverview: FeeOverview;
}

export interface ManagementDashboardDTO {
  stats: ManagementDashboardStats;
  recentAnnouncements: AnnouncementSummary[];
}

export interface AnnouncementSummary {
  id: string;
  title: string;
  content: string | null;
  priority: string | null;
  published_at: string | null;
  created_at?: string;
}

/** Row shape for the module_configuration table. */
export interface ModuleConfigRow {
  id: string;
  organisation_id: string;
  module_key: string;
  module_name: string;
  enabled: boolean;
  settings: string | null;
  updated_at?: string | null;
}

export interface ModuleConfigDTO {
  id: string;
  organisation_id: string;
  module_key: string;
  module_name: string;
  enabled: boolean;
  settings: Record<string, unknown> | null;
  updated_at?: string | null;
}
