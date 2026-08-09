import apiClient from './apiClient';
import { auth } from './auth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (v: string | null | undefined): v is string => typeof v === 'string' && UUID_RE.test(v);

const studentId = () => {
  if (typeof window === 'undefined') return null;
  const session = auth.getSession();
  return session?.student?.id || null;
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
  getStats: () =>
    apiClient.get<any>(`/student/dashboard/${studentId()}`),
};

// ==================== TIMETABLE ====================
export const timetableApi = {
  getByStudent: () =>
    apiClient.get<any[]>(`/student/timetable/student/${studentId()}`),
  getByClass: (classId: string) =>
    apiClient.get<any[]>(`/student/timetable/${classId}`),
};

// ==================== ATTENDANCE ====================
export const attendanceApi = {
  getByStudent: () =>
    apiClient.get<any[]>(`/student/attendance/${studentId()}`),
};

// ==================== ASSIGNMENTS ====================
export const assignmentApi = {
  getByStudent: () =>
    apiClient.get<any[]>(`/student/assignments/${studentId()}`),
  submit: (assignmentId: string, data: any) =>
    apiClient.post<any>(`/student/assignments/${assignmentId}/submit`, data),
};

// ==================== EXAMS ====================
export const examApi = {
  getByStudent: () =>
    apiClient.get<any[]>(`/student/exams/${studentId()}`),
  getResult: (examId: string) =>
    apiClient.get<any>(`/student/exam-result/${examId}/${studentId()}`),
  getQuestions: (examId: string) =>
    apiClient.get<any[]>(`/student/exam-questions/${examId}`),
  submit: (data: any) =>
    apiClient.post<any>('/student/exam-submissions', data),
};

// ==================== MARKS ====================
export const marksApi = {
  getByStudent: () =>
    apiClient.get<any[]>(`/student/marks/${studentId()}`),
};

// ==================== FEES ====================
export const feeApi = {
  getByStudent: () =>
    apiClient.get<any[]>(`/student/fees/${studentId()}`),
  getPaymentHistory: () =>
    apiClient.get<any[]>(`/student/payment-history/${studentId()}`),
  getReceipt: (paymentId: string) =>
    apiClient.get<any>(`/student/receipt/${paymentId}`),
  pay: (data: any) =>
    apiClient.post<any>('/student/fee-payments', data),
};

// ==================== LIBRARY ====================
export const libraryApi = {
  getByUser: () =>
    apiClient.get<any[]>(`/student/library/${userId()}`),
};

// ==================== CERTIFICATES ====================
export const certificateApi = {
  getByUser: () =>
    apiClient.get<any[]>(`/student/certificates/${userId()}`),
};

// ==================== SCHOLARSHIPS ====================
export const scholarshipApi = {
  getByStudent: () =>
    apiClient.get<any[]>(`/student/scholarships/${studentId()}`),
};

// ==================== EVENTS ====================
export const eventApi = {
  getAll: () =>
    apiClient.get<any[]>(`/student/events/${orgId()}`),
};

// ==================== CLUBS ====================
export const clubApi = {
  getAll: () =>
    apiClient.get<any[]>(`/student/clubs/${orgId()}`),
};

// ==================== HEALTH ====================
export const healthApi = {
  getByStudent: () =>
    apiClient.get<any>(`/student/health/${studentId()}`),
  getEmergency: () =>
    apiClient.get<any[]>(`/student/health/emergency/${studentId()}`),
  createRecord: (data: any) =>
    apiClient.post<any>('/student/health/medical-records', data),
  createCheckup: (data: any) =>
    apiClient.post<any>('/student/health/checkups', data),
  createMedication: (data: any) =>
    apiClient.post<any>('/student/health/medications', data),
  createVaccination: (data: any) =>
    apiClient.post<any>('/student/health/vaccinations', data),
  createEmergencyContact: (data: any) =>
    apiClient.post<any>('/student/health/emergency', data),
  logMood: (data: any) =>
    apiClient.post<any>('/student/health/mood', data),
};

// ==================== MESSAGES ====================
export const messageApi = {
  getConversations: () =>
    apiClient.get<any[]>(`/student/conversations/${userId()}`),
  getMessages: (teacherId: string) =>
    apiClient.get<any[]>(`/student/messages/${studentId()}/${teacherId}`),
  send: (data: any) =>
    apiClient.post<any>('/student/messages', data),
  markRead: (id: string) =>
    apiClient.patch<any>(`/student/messages/${id}/read`),
  getUnreadCount: () =>
    apiClient.get<any>(`/student/unread-count/${userId()}`),
};

// ==================== HOSTEL ====================
export const hostelApi = {
  getByStudent: () =>
    apiClient.get<any>(`/student/hostel/${studentId()}`),
};

// ==================== TRANSPORT ====================
export const transportApi = {
  getByStudent: () =>
    apiClient.get<any>(`/student/transport/${studentId()}`),
};

// ==================== ANNOUNCEMENTS ====================
export const announcementApi = {
  getAll: () =>
    apiClient.get<any[]>(`/student/announcements/${studentId()}/${orgId()}`),
};

// ==================== TEACHERS ====================
export const teacherApi = {
  getAll: () =>
    apiClient.get<any[]>(`/student/teachers/${orgId()}`),
};

// ==================== CAREER / INTERNSHIPS ====================
export const careerApi = {
  getSessions: () =>
    apiClient.get<any[]>(`/student/career-sessions/${orgId()}`),
  getInternships: () =>
    apiClient.get<any[]>(`/student/internships/${orgId()}`),
};

// ==================== PART-TIME JOBS ====================
export const partTimeJobApi = {
  getAll: (oid: string, role?: string) =>
    apiClient.get<any[]>(`/student/part-time-jobs/${oid}${role ? `?role=${encodeURIComponent(role)}` : ''}`),
  apply: (data: any) =>
    apiClient.post<any>('/student/part-time-jobs/apply', data),
  getMyApplications: (uid: string) =>
    apiClient.get<any[]>(`/student/part-time-jobs/applications/${uid}`),
};

// ==================== CANTEEN ====================
export const canteenApi = {
  getByStudent: () =>
    apiClient.get<any>(`/student/canteen/${studentId()}`),
  createOrder: (data: any) =>
    apiClient.post<any>('/student/canteen-orders', data),
};
