import { create } from 'zustand';
import * as api from '../services/api';
import {
  DashboardStats,
  AttendanceRecord,
  FeeRecord,
  ExamResult,
  Assignment,
  TimetableEntry,
  Notification,
  PartTimeJob,
  JobApplication,
} from '../types';

interface DataState {
  dashboard: DashboardStats | null;
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  results: ExamResult[];
  assignments: Assignment[];
  timetable: TimetableEntry[];
  notifications: Notification[];
  jobs: PartTimeJob[];
  applications: JobApplication[];

  fetchDashboard: (role: string, orgId?: string) => Promise<void>;
  fetchAttendance: (studentId: string) => Promise<void>;
  fetchFees: (studentId: string) => Promise<void>;
  fetchResults: (studentId: string) => Promise<void>;
  fetchAssignments: (classId?: string) => Promise<void>;
  fetchTimetable: (classId?: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchJobs: (providerId?: string) => Promise<void>;
  fetchApplications: (jobId?: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  dashboard: null,
  attendance: [],
  fees: [],
  results: [],
  assignments: [],
  timetable: [],
  notifications: [],
  jobs: [],
  applications: [],

  fetchDashboard: async (role, orgId) => {
    let url = '';
    switch (role) {
      case 'admin': url = `/v2/admin/analytics/dashboard`; break;
      case 'management': url = `/v2/management/dashboard/${orgId}`; break;
      case 'staff': url = `/v2/staff/dashboard`; break;
      case 'student': url = `/v2/student/dashboard`; break;
      case 'parent': url = `/v2/parents/dashboard`; break;
      case 'job_provider': url = `/job-provider/dashboard`; break;
      default: return;
    }
    const result = await api.apiGet<DashboardStats>(url);
    if (result.success && result.data) {
      set({ dashboard: result.data });
    }
  },

  fetchAttendance: async (studentId) => {
    const result = await api.apiGet<AttendanceRecord[]>(`/v2/student/attendance/${studentId}`);
    if (result.success && result.data) {
      set({ attendance: result.data });
    }
  },

  fetchFees: async (studentId) => {
    const result = await api.apiGet<FeeRecord[]>(`/v2/parents/fees/${studentId}`);
    if (result.success && result.data) {
      set({ fees: result.data });
    }
  },

  fetchResults: async (studentId) => {
    const result = await api.apiGet<ExamResult[]>(`/v2/student/results/${studentId}`);
    if (result.success && result.data) {
      set({ results: result.data });
    }
  },

  fetchAssignments: async (classId) => {
    const url = classId ? `/v2/student/assignments?classId=${classId}` : `/v2/student/assignments`;
    const result = await api.apiGet<Assignment[]>(url);
    if (result.success && result.data) {
      set({ assignments: result.data });
    }
  },

  fetchTimetable: async (classId) => {
    const url = classId ? `/v2/student/timetable?classId=${classId}` : `/v2/student/timetable`;
    const result = await api.apiGet<TimetableEntry[]>(url);
    if (result.success && result.data) {
      set({ timetable: result.data });
    }
  },

  fetchNotifications: async () => {
    const result = await api.apiGet<Notification[]>(`/v2/notifications`);
    if (result.success && result.data) {
      set({ notifications: result.data });
    }
  },

  fetchJobs: async (providerId) => {
    const url = providerId ? `/job-provider/jobs` : `/voice/jobs`;
    const result = await api.apiGet<PartTimeJob[]>(url);
    if (result.success && result.data) {
      set({ jobs: result.data });
    }
  },

  fetchApplications: async (jobId) => {
    const url = jobId ? `/job-provider/jobs/${jobId}/applications` : `/job-provider/applications`;
    const result = await api.apiGet<JobApplication[]>(url);
    if (result.success && result.data) {
      set({ applications: result.data });
    }
  },
}));
