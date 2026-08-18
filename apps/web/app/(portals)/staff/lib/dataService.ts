import apiClient from './apiClient';
import { auth } from './auth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (v: string | null | undefined): v is string => typeof v === 'string' && UUID_RE.test(v);

const teacherId = () => {
  if (typeof window === 'undefined') return null;
  const session = auth.getSession();
  return session?.teacher?.id || session?.user?.id || null;
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
  getStats: (tid: string) =>
    apiClient.get<any>(`/staff/dashboard/${tid}`),
};

// ==================== CLASSES ====================
export const classApi = {
  getByTeacher: (tid: string) =>
    apiClient.get<any>(`/staff/classes/${tid}`),
};

// ==================== SECTIONS ====================
export const sectionApi = {
  getByClass: (classId: string) =>
    apiClient.get<any>(`/staff/sections/by-class/${classId}`),
};

// ==================== STUDENTS ====================
export const studentApi = {
  getByTeacher: (tid: string) =>
    apiClient.get<any>(`/staff/students/${tid}`),
};

// ==================== ANNOUNCEMENTS ====================
export const announcementApi = {
  getAll: (oid: string) =>
    apiClient.get<any>(`/staff/announcements/${oid}`),
  create: (data: any) =>
    apiClient.post<any>('/staff/announcements', data),
};

// ==================== NOTIFICATIONS ====================
export const notificationApi = {
  getAll: (uid: string) =>
    apiClient.get<any>(`/staff/notifications/${uid}`),
};

// ==================== TIMETABLE ====================
export const timetableApi = {
  getByTeacher: (tid: string) =>
    apiClient.get<any>(`/staff/timetable/${tid}`),
};

// ==================== ATTENDANCE ====================
export const attendanceApi = {
  getReport: (studentId: string) =>
    apiClient.get<any>(`/staff/attendance-report/${studentId}`),
  getRecords: (params: { class_id: string; date: string; section_id?: string; subject_id?: string; attendance_type?: string }) =>
    apiClient.get<any>(`/staff/attendance/records?${new URLSearchParams(params as any).toString()}`),
  saveRecords: (data: any) =>
    apiClient.post<any>('/staff/attendance/records/save', data),
};

// ==================== GRADES ====================
export const gradeApi = {
  getByStudent: (studentId: string) =>
    apiClient.get<any>(`/staff/grades/${studentId}`),
  create: (data: any) =>
    apiClient.post<any>('/staff/grades', data),
};

// ==================== ASSIGNMENTS ====================
export const assignmentApi = {
  getByTeacher: (tid: string) =>
    apiClient.get<any>(`/staff/assignments/${tid}`),
  create: (data: any) =>
    apiClient.post<any>('/staff/assignments', data),
};

// ==================== EXAMS ====================
export const examApi = {
  getAll: (oid: string) =>
    apiClient.get<any>(`/staff/exams/${oid}`),
  create: (data: any) =>
    apiClient.post<any>('/staff/exams', data),
};

// ==================== MESSAGES ====================
export const messageApi = {
  getConversations: (uid: string) =>
    apiClient.get<any>(`/staff/conversations/${uid}`),
  getMessages: (uid: string, otherId: string) =>
    apiClient.get<any>(`/staff/messages/${uid}/${otherId}`),
  send: (data: any) =>
    apiClient.post<any>('/staff/messages', data),
};

// ==================== PART-TIME JOBS ====================
export const partTimeJobApi = {
  getAll: (oid: string, role?: string) =>
    apiClient.get<any>(`/staff/part-time-jobs/${oid}${role ? `?role=${encodeURIComponent(role)}` : ''}`),
  apply: (data: any) =>
    apiClient.post<any>('/staff/part-time-jobs/apply', data),
  getMyApplications: (uid: string) =>
    apiClient.get<any>(`/staff/part-time-jobs/applications/${uid}`),
};

// ==================== QR ATTENDANCE ====================
export const qrApi = {
  generate: (data: any) =>
    apiClient.post<any>('/staff/qr-attendance/generate', data),
  getScanCount: (token: string) =>
    apiClient.post<any>('/staff/qr-attendance/scan-count', { token }),
};

// ==================== STAFF OPERATING SYSTEM SYNC ====================
export const staffApi = {
  getAssignments: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/assignments`),
  getTasks: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/tasks`),
  updateTask: (taskId: string, data: any) =>
    apiClient.put<any>(`/wos/staff/tasks/${taskId}`, data),
  getSchedules: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/schedules`),
  getLeaves: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/leaves`),
  addLeave: (staffId: string, data: any) =>
    apiClient.post<any>(`/wos/staff/${staffId}/leaves`, { ...data, organisation_id: orgId() }),
  getPerformance: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/performance`),
  getResources: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/resources`),
  getDocuments: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/documents`),
  addDocument: (staffId: string, data: any) =>
    apiClient.post<any>(`/wos/staff/${staffId}/documents`, { ...data, organisation_id: orgId() }),
  getActivities: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/activities`),
  getMessages: (staffId: string) =>
    apiClient.get<any>(`/wos/staff/${staffId}/messages`),
};

// ==================== TEACHER OPERATING SYSTEM (V4) ====================
export const teacherApi = {
  getDashboardStats: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/dashboard-stats/${tid}`),
  getClasses: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/classes/${tid}`),
  getSubjects: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/subjects/${tid}`),
  getStudents: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/students/${tid}`),
  getHomework: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/homework/${tid}`),
  createHomework: (data: any) =>
    apiClient.post<any>('/wos/teacher/homework', { ...data, organisation_id: orgId() }),
  updateHomework: (id: string, data: any) =>
    apiClient.put<any>(`/wos/teacher/homework/${id}`, data),
  deleteHomework: (id: string) =>
    apiClient.delete<any>(`/wos/teacher/homework/${id}`),
  getSubmissions: (hwId: string) =>
    apiClient.get<any>(`/wos/teacher/homework-submissions/${hwId}`),
  gradeSubmission: (data: { submission_id: string; grade: string; feedback?: string }) =>
    apiClient.post<any>('/wos/teacher/homework-submissions/grade', data),
  getAttendance: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/attendance/${tid}`),
  markAttendance: (data: any) =>
    apiClient.post<any>('/wos/teacher/attendance', { ...data, organisation_id: orgId(), teacher_id: teacherId() }),
  getExams: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/exams/${tid}`),
  createExam: (data: any) =>
    apiClient.post<any>('/wos/teacher/exams', { ...data, organisation_id: orgId() }),
  getMarks: (examId: string) =>
    apiClient.get<any>(`/wos/teacher/marks/${examId}`),
  saveMarks: (data: any) =>
    apiClient.post<any>('/wos/teacher/marks', { ...data, organisation_id: orgId() }),
  getPtm: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/ptm/${tid}`),
  createPtm: (data: any) =>
    apiClient.post<any>('/wos/teacher/ptm', { ...data, organisation_id: orgId() }),
  getResources: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/resources/${tid}`),
  createResource: (data: any) =>
    apiClient.post<any>('/wos/teacher/resources', { ...data, organisation_id: orgId() }),
  getTasks: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/tasks/${tid}`),
  updateTaskStatus: (id: string, status: string) =>
    apiClient.put<any>(`/wos/teacher/tasks/${id}`, { status }),
  getPerformance: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/performance/${tid}`),
  getCommunications: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/communications/${tid}`),
  sendCommunication: (data: any) =>
    apiClient.post<any>('/wos/teacher/communications', { ...data, organisation_id: orgId() }),
  getNotifications: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/notifications/${tid}`),
  markNotificationRead: (id: string) =>
    apiClient.put<any>(`/wos/teacher/notifications/${id}/read`, {}),
  getActivityLogs: (tid: string) =>
    apiClient.get<any>(`/wos/teacher/activity-logs/${tid}`),
  logActivity: (data: any) =>
    apiClient.post<any>('/wos/teacher/activity-logs', { ...data, organisation_id: orgId() }),
  generateLesson: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/generate/lesson/${orgId()}`, data),
  generateQuiz: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/generate/quiz/${orgId()}`, data),
  generateContent: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/generate/content/${orgId()}`, data),
};

