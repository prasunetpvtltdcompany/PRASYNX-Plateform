import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

/**
 * Dashboard Service
 * 
 * Handles all business logic for dashboard statistics and overview data.
 * Functions: getDashboardStats
 */
export class DashboardService {
  async getDashboardStats(organisationId: string) {
    const [students, staff, classes, announcements] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('organisation_id', organisationId),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('organisation_id', organisationId).eq('role', 'staff'),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('organisation_id', organisationId),
      supabase.from('announcements').select('*').eq('organisation_id', organisationId).order('created_at', { ascending: false }).limit(5)
    ]);

    return {
      stats: {
        totalStudents: students.count || 0,
        totalStaff: staff.count || 0,
        totalClasses: classes.count || 0
      },
      recentAnnouncements: announcements.data || []
    };
  }
}

export const dashboardService = new DashboardService();
