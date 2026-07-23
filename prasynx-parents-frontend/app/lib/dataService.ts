import apiClient from './apiClient';
import { auth } from './auth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (v: string | null | undefined): v is string => typeof v === 'string' && UUID_RE.test(v);

const parentId = () => {
  if (typeof window === 'undefined') return null;
  const session = auth.getSession();
  return session?.parent?.id || session?.user?.id || null;
};

const userId = () => {
  if (typeof window === 'undefined') return null;
  const session = auth.getSession();
  return session?.user?.id || null;
};

const orgId = () => {
  const id = auth.getOrganisationId();
  return isValidUuid(id) ? id : null;
};

// ==================== DASHBOARD ====================
export const dashboardApi = {
  get: (pid: string) => apiClient.get<any>(`/parents/dashboard/${pid}`),
};

// ==================== CHILDREN ====================
export const childApi = {
  getByParent: (pid: string) => apiClient.get<any>(`/parents/children/${pid}`),
};

// ==================== ATTENDANCE ====================
export const attendanceApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/attendance/${sid}`),
};

// ==================== PERFORMANCE ====================
export const performanceApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/performance/${sid}`),
};

// ==================== ASSIGNMENTS ====================
export const assignmentApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/assignments/${sid}`),
};

// ==================== EXAMS ====================
export const examApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/exams/${sid}`),
};

// ==================== TEACHERS ====================
export const teacherApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/teachers/${sid}`),
};

// ==================== FEES ====================
export const feeApi = {
  getSummary: (pid: string) => apiClient.get<any>(`/parents/fees-summary/${pid}`),
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/fees/${sid}`),
};

// ==================== TRANSPORT ====================
export const transportApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/transport/${sid}`),
  getBusLocation: (sid: string) => apiClient.get<any>(`/parents/bus-location/student/${sid}`),
};

// ==================== HEALTH ====================
export const healthApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/health/${sid}`),
  getVaccinations: (sid: string) => apiClient.get<any>(`/parents/vaccinations/${sid}`),
};

// ==================== ANNOUNCEMENTS ====================
export const announcementApi = {
  getAll: (oid: string) => apiClient.get<any>(`/parents/announcements/${oid}`),
};

// ==================== NOTIFICATIONS ====================
export const notificationApi = {
  getAll: (uid: string) => apiClient.get<any>(`/parents/notifications/${uid}`),
};

// ==================== EMERGENCY CONTACTS ====================
export const emergencyApi = {
  getByOrg: (oid: string) => apiClient.get<any>(`/parents/emergency-contacts/${oid}`),
};

// ==================== MESSAGES ====================
export const messageApi = {
  send: (data: any) => apiClient.post<any>('/parents/messages', data),
  getMessages: (uid: string, otherId: string) => apiClient.get<any>(`/parents/messages/${uid}/${otherId}`),
  getConversations: (uid: string) => apiClient.get<any>(`/parents/conversations/${uid}`),
  getUnreadCount: (uid: string) => apiClient.get<any>(`/parents/unread-count/${uid}`),
};

// ==================== COMPLAINTS ====================
export const complaintApi = {
  getByParent: (pid: string) => apiClient.get<any>(`/parents/complaints/${pid}`),
  create: (data: any) => apiClient.post<any>('/parents/complaint', data),
};

// ==================== PTM ====================
export const ptmApi = {
  getByParent: (pid: string) => apiClient.get<any>(`/parents/ptm-bookings/${pid}`),
  book: (data: any) => apiClient.post<any>('/parents/ptm-booking', data),
};

// ==================== LEAVE ====================
export const leaveApi = {
  getByParent: (pid: string) => apiClient.get<any>(`/parents/leave-requests/${pid}`),
  apply: (data: any) => apiClient.post<any>('/parents/leave-application', data),
};

// ==================== PART-TIME JOBS ====================
export const partTimeJobApi = {
  getAll: (oid: string, role?: string) => apiClient.get<any>(`/parents/part-time-jobs/${oid}${role ? `?role=${encodeURIComponent(role)}` : ''}`),
  apply: (data: any) => apiClient.post<any>('/parents/part-time-jobs/apply', data),
  getMyApplications: (uid: string) => apiClient.get<any>(`/parents/part-time-jobs/applications/${uid}`),
};

// ==================== HOSTEL ====================
export const hostelApi = {
  getByStudent: (sid: string) => apiClient.get<any>(`/parents/hostel/${sid}`),
  requestVisit: (data: any) => apiClient.post<any>('/parents/hostel-visit', data),
};
