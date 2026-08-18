import apiClient from './apiClient';
import { auth } from './auth';

const orgId = () => {
  return auth.getOrganisationId() || '';
};

// ==================== INSTITUTION INTELLIGENCE ====================
export const institutionIntelligenceApi = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/institution-intelligence/dashboard/${orgId()}`).then(handleResponse),
  getOverview: () =>
    apiClient.get<any>(`/v2/institution-intelligence/overview/${orgId()}`).then(handleResponse),
  getAcademic: () =>
    apiClient.get<any>(`/v2/institution-intelligence/academic/${orgId()}`).then(handleResponse),
  getOperational: () =>
    apiClient.get<any>(`/v2/institution-intelligence/operational/${orgId()}`).then(handleResponse),
  getBenchmarks: () =>
    apiClient.get<any>(`/v2/institution-intelligence/benchmarks/${orgId()}`).then(handleResponse),
  getTrends: () =>
    apiClient.get<any>(`/v2/institution-intelligence/trends/${orgId()}`).then(handleResponse),
  getPeers: () =>
    apiClient.get<any>(`/v2/institution-intelligence/peers/${orgId()}`).then(handleResponse),
};

// ==================== TEACHER PERFORMANCE AI ====================
export const teacherPerformanceApi = {
  getTeachers: () =>
    apiClient.get<any[]>(`/v2/teacher-performance/teachers/${orgId()}`).then(handleResponse),
  analyzeAll: () =>
    apiClient.get<any>(`/v2/teacher-performance/analyze/${orgId()}`).then(handleResponse),
  analyzeTeacher: (teacherId: string) =>
    apiClient.get<any>(`/v2/teacher-performance/analyze/${orgId()}/${teacherId}`).then(handleResponse),
  getObservations: (teacherId?: string) =>
    apiClient.get<any[]>(`/v2/teacher-performance/observations/${orgId()}${teacherId ? '/' + teacherId : ''}`).then(handleResponse),
  createObservation: (data: any) =>
    apiClient.post<any>(`/v2/teacher-performance/observations/${orgId()}`, data).then(handleResponse),
  getFeedback: (teacherId?: string) =>
    apiClient.get<any>(`/v2/teacher-performance/feedback/${orgId()}${teacherId ? '/' + teacherId : ''}`).then(handleResponse),
  submitFeedback: (data: any) =>
    apiClient.post<any>(`/v2/teacher-performance/feedback/${orgId()}`, data).then(handleResponse),
  getRetention: (teacherId?: string) =>
    apiClient.get<any>(`/v2/teacher-performance/retention/${orgId()}${teacherId ? '/' + teacherId : ''}`).then(handleResponse),
  getReviews: (teacherId?: string) =>
    apiClient.get<any[]>(`/v2/teacher-performance/reviews/${orgId()}${teacherId ? '/' + teacherId : ''}`).then(handleResponse),
  createReview: (data: any) =>
    apiClient.post<any>(`/v2/teacher-performance/reviews/${orgId()}`, data).then(handleResponse),
  getInsights: () =>
    apiClient.get<any>(`/v2/teacher-performance/insights/${orgId()}`).then(handleResponse),
};

// ==================== RISK DETECTION ====================
export const riskDetectionApi = {
  analyzeAll: () =>
    apiClient.get<any>(`/v2/risk-detection/analyze/${orgId()}`).then(handleResponse),
  analyzeStudent: (studentId: string) =>
    apiClient.get<any>(`/v2/risk-detection/analyze/${orgId()}/${studentId}`).then(handleResponse),
  getAlerts: (params?: { severity?: string; resolved?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.set('severity', params.severity);
    if (params?.resolved !== undefined) query.set('resolved', String(params.resolved));
    const qs = query.toString();
    return apiClient.get<any[]>(`/v2/risk-detection/alerts/${orgId()}${qs ? '?' + qs : ''}`).then(handleResponse);
  },
  generateAlerts: () =>
    apiClient.post<any>(`/v2/risk-detection/alerts/${orgId()}/generate`).then(handleResponse),
  resolveAlert: (alertId: string) =>
    apiClient.put<any>(`/v2/risk-detection/alerts/${alertId}/resolve`).then(handleResponse),
  getThresholds: () =>
    apiClient.get<any>(`/v2/risk-detection/thresholds/${orgId()}`).then(handleResponse),
  updateThresholds: (thresholdType: string, data: any) =>
    apiClient.put<any>(`/v2/risk-detection/thresholds/${orgId()}/${thresholdType}`, data).then(handleResponse),
  getStudentHistory: (studentId: string) =>
    apiClient.get<any>(`/v2/risk-detection/history/${orgId()}/${studentId}`).then(handleResponse),
  getPredictiveInsights: () =>
    apiClient.get<any>(`/v2/risk-detection/predictive-insights/${orgId()}`).then(handleResponse),
};

// ==================== MODULE CONFIGURATION ====================
export const moduleConfigApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/module-config/${orgId()}`).then(handleResponse),
  update: (moduleKey: string, enabled: boolean) =>
    apiClient.put<any>(`/management/module-config/${orgId()}/${moduleKey}`, { enabled }).then(handleResponse),
};

const handleResponse = <T>(res: { success: boolean; data?: T; error?: string; code?: string; details?: any }) =>
  res as { success: boolean; data?: T; error?: string; code?: string; details?: any };

const unwrapData = <T>(res: { success: boolean; data?: T; error?: string }): T => {
  if (!res.success) throw new Error(res.error || 'Request failed');
  return res.data as T;
};

// ==================== DASHBOARD ====================
export const dashboardApi = {
  getStats: () =>
    apiClient.get<any>(`/management/dashboard/${orgId()}`).then(handleResponse),
};

// ==================== STUDENTS ====================
export const studentApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/students/${orgId()}`).then(handleResponse),
  getById: (id: string) =>
    apiClient.get<any>(`/management/students/${orgId()}/${id}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/students', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.patch<any>(`/management/students/${id}`, data).then(handleResponse),
  delete: (id: string) =>
    apiClient.delete<any>(`/management/students/${id}`).then(handleResponse),
};

// ==================== STAFF ====================
export const staffApi = {
  getAll: (filters?: { search?: string; role?: string; department?: string; status?: string; employment_type?: string }) => {
    const q = new URLSearchParams();
    if (filters) {
      if (filters.search) q.set('search', filters.search);
      if (filters.role) q.set('role', filters.role);
      if (filters.department) q.set('department', filters.department);
      if (filters.status) q.set('status', filters.status);
      if (filters.employment_type) q.set('employment_type', filters.employment_type);
    }
    const qs = q.toString();
    return apiClient.get<any[]>(`/management/staff/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  create: (data: any) =>
    apiClient.post<any>('/management/staff', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.put<any>(`/management/staff/${id}`, data).then(handleResponse),
  updateStatus: (id: string, status: string) =>
    apiClient.put<any>(`/management/staff/${id}/status`, { status }).then(handleResponse),
  getById: (id: string) =>
    apiClient.get<any>(`/management/staff/${id}`).then(handleResponse),
  delete: (id: string) =>
    apiClient.delete<any>(`/management/staff/${id}`).then(handleResponse),
  assignClass: (teacherId: string, data: { class_ids: string[]; subject_ids: string[]; section_ids?: string[] }) =>
    apiClient.post<any>(`/management/staff/${teacherId}/assign-class`, { ...data, organisation_id: orgId() }).then(handleResponse),
  getAssignments: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/assignments`).then(handleResponse),
  addAssignment: (staffId: string, type: string, payload: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/assignments`, { type, payload, organisation_id: orgId() }).then(handleResponse),
  removeAssignment: (type: string, id: string) =>
    apiClient.delete<any>(`/management/staff/assignments/${type}/${id}`).then(handleResponse),
  getTasks: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/tasks`).then(handleResponse),
  getAllTasks: () =>
    apiClient.get<any[]>('/management/staff-tasks').then(handleResponse),
  addTask: (staffId: string, data: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/tasks`, { ...data, organisation_id: orgId() }).then(handleResponse),
  updateTask: (taskId: string, data: any) =>
    apiClient.put<any>(`/management/staff/tasks/${taskId}`, data).then(handleResponse),
  deleteTask: (taskId: string) =>
    apiClient.delete<any>(`/management/staff/tasks/${taskId}`).then(handleResponse),
  getSchedules: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/schedules`).then(handleResponse),
  addSchedule: (staffId: string, data: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/schedules`, { ...data, organisation_id: orgId() }).then(handleResponse),
  deleteSchedule: (id: string) =>
    apiClient.delete<any>(`/management/staff/schedules/${id}`).then(handleResponse),
  getResources: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/resources`).then(handleResponse),
  addResource: (staffId: string, data: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/resources`, { ...data, organisation_id: orgId() }).then(handleResponse),
  updateResource: (id: string, data: any) =>
    apiClient.put<any>(`/management/staff/resources/${id}`, data).then(handleResponse),
  getPerformance: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/performance`).then(handleResponse),
  addPerformance: (staffId: string, data: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/performance`, { ...data, organisation_id: orgId() }).then(handleResponse),
  getAllPerformance: () =>
    apiClient.get<any[]>(`/management/staff-performance`).then(handleResponse),
  getLeaves: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/leaves`).then(handleResponse),
  getAllLeaves: () =>
    apiClient.get<any[]>(`/management/staff-leaves`).then(handleResponse),
  addLeave: (staffId: string, data: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/leaves`, { ...data, organisation_id: orgId() }).then(handleResponse),
  updateLeaveStatus: (id: string, status: string) =>
    apiClient.put<any>(`/management/staff/leaves/${id}`, { status }).then(handleResponse),
  getDocuments: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/documents`).then(handleResponse),
  getAllDocuments: () =>
    apiClient.get<any[]>(`/management/documents`).then(handleResponse),
  addDocument: (staffId: string, data: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/documents`, { ...data, organisation_id: orgId() }).then(handleResponse),
  updateDocumentStatus: (id: string, status: string) =>
    apiClient.put<any>(`/management/staff/documents/${id}/status`, { status }).then(handleResponse),
  getSalary: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/salary`).then(handleResponse),
  updateSalary: (staffId: string, data: any) =>
    apiClient.put<any>(`/management/staff/${staffId}/salary`, { ...data, organisation_id: orgId() }).then(handleResponse),
  createPayslip: (staffId: string, data: any) =>
    apiClient.post<any>(`/management/staff/${staffId}/salary/payslip`, { ...data, organisation_id: orgId() }).then(handleResponse),
  updatePayslipStatus: (id: string, status: string) =>
    apiClient.put<any>(`/management/staff/payslips/${id}/status`, { status }).then(handleResponse),
  getOrgPayslips: () =>
    apiClient.get<any>(`/management/staff/payslips/org/${orgId()}`).then(handleResponse),
  getOrgSalaries: () =>
    apiClient.get<any>(`/management/staff/salaries/org/${orgId()}`).then(handleResponse),
  getMessages: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/messages`).then(handleResponse),
  getActivities: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/activities`).then(handleResponse),
  getWorkload: (staffId: string) =>
    apiClient.get<any>(`/management/staff/${staffId}/workload`).then(handleResponse),
};

// ==================== CLASSES ====================
export const classApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/classes/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/classes', { ...data, organisation_id: orgId() }).then(handleResponse),
  assignStudent: (classId: string, studentIds: string[]) =>
    apiClient.post<any>(`/management/classes/${classId}/students`, { student_ids: studentIds }).then(handleResponse),
};

export const classApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/classes/dashboard/${orgId()}`).then(handleResponse),
  getClasses: () =>
    apiClient.get<any[]>(`/v2/classes/classes/${orgId()}`).then(handleResponse),
  getClassById: (id: string) =>
    apiClient.get<any>(`/v2/classes/classes/${orgId()}/${id}`).then(handleResponse),
  createClass: (data: any) =>
    apiClient.post<any>(`/v2/classes/classes/${orgId()}`, data).then(handleResponse),
  updateClass: (id: string, data: any) =>
    apiClient.put<any>(`/v2/classes/classes/${id}`, data).then(handleResponse),
  deleteClass: (id: string) =>
    apiClient.delete<any>(`/v2/classes/classes/${id}`).then(handleResponse),
  archiveClass: (id: string) =>
    apiClient.post<any>(`/v2/classes/classes/${id}/archive`).then(handleResponse),
  getStudents: (classId: string) =>
    apiClient.get<any[]>(`/v2/classes/classes/${classId}/students`).then(handleResponse),
  assignStudent: (classId: string, studentId: string, confirm = false) =>
    apiClient.post<any>(`/v2/classes/classes/${classId}/students`, { student_id: studentId, confirm }).then(handleResponse),
  assignStudentsBulk: (classId: string, studentIds: string[], confirm = false) =>
    apiClient.post<any>(`/v2/classes/classes/${classId}/students/bulk`, { student_ids: studentIds, confirm }).then(handleResponse),
  removeStudent: (classId: string, studentId: string) =>
    apiClient.delete<any>(`/v2/classes/classes/${classId}/students/${studentId}`).then(handleResponse),
  transferStudent: (studentId: string, fromClassId: string, toClassId: string) =>
    apiClient.post<any>(`/v2/classes/students/transfer`, { student_id: studentId, from_class_id: fromClassId, to_class_id: toClassId }).then(handleResponse),
  promoteStudents: (fromClassId: string, toClassId: string, studentIds: string[]) =>
    apiClient.post<any>(`/v2/classes/students/promote`, { from_class_id: fromClassId, to_class_id: toClassId, student_ids: studentIds }).then(handleResponse),
  assignClassTeacher: (classId: string, teacherId: string) =>
    apiClient.post<any>(`/v2/classes/classes/${classId}/class-teacher/${teacherId}`).then(handleResponse),
  assignAssistantTeacher: (classId: string, teacherId: string) =>
    apiClient.post<any>(`/v2/classes/classes/${classId}/assistant-teacher/${teacherId}`).then(handleResponse),
  getRooms: (classId: string) =>
    apiClient.get<any[]>(`/v2/classes/classes/${classId}/rooms`).then(handleResponse),
  allocateRoom: (data: any) =>
    apiClient.post<any>(`/v2/classes/rooms/${orgId()}`, data).then(handleResponse),
  updateRoom: (roomId: string, data: any) =>
    apiClient.put<any>(`/v2/classes/rooms/${roomId}`, data).then(handleResponse),
  deleteRoom: (roomId: string) =>
    apiClient.delete<any>(`/v2/classes/rooms/${roomId}`).then(handleResponse),
  getAttendanceTrend: (classId: string) =>
    apiClient.get<any[]>(`/v2/classes/classes/${classId}/attendance-trend`).then(handleResponse),
  getPerformance: (classId: string) =>
    apiClient.get<any[]>(`/v2/classes/classes/${classId}/performance`).then(handleResponse),
  getAcademicAnalytics: (classId: string) =>
    apiClient.get<any>(`/v2/classes/classes/${classId}/academic-analytics`).then(handleResponse),
  getAiInsights: (classId: string) =>
    apiClient.get<any>(`/v2/classes/classes/${classId}/ai-insights`).then(handleResponse),
  getUnassignedStudents: () =>
    apiClient.get<any[]>(`/v2/classes/unassigned-students/${orgId()}`).then(handleResponse),
  getAllAssignedStudents: () =>
    apiClient.get<any[]>(`/v2/classes/assigned-students/${orgId()}`).then(handleResponse),
  getAvailableTeachers: () =>
    apiClient.get<any[]>(`/v2/classes/available-teachers/${orgId()}`).then(handleResponse),
  getSections: (classId: string) =>
    apiClient.get<any[]>(`/v2/classes/classes/${classId}/sections`).then(handleResponse),
  createSection: (classId: string, data: any) =>
    apiClient.post<any>(`/v2/classes/classes/${classId}/sections`, data).then(handleResponse),
  updateSection: (sectionId: string, data: any) =>
    apiClient.put<any>(`/v2/classes/sections/${sectionId}`, data).then(handleResponse),
  deleteSection: (sectionId: string) =>
    apiClient.delete<any>(`/v2/classes/sections/${sectionId}`).then(handleResponse),
  getClassStudentsWithName: (classId: string) =>
    apiClient.get<any>(`/v2/classes/classes/${classId}/students`).then(handleResponse),
};

// ==================== SUBJECTS ====================
export const subjectApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/subjects/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/subjects', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== TIMETABLE ====================
export const timetableApi = {
  getAll: (params?: { class_id?: string; section_id?: string; teacher_id?: string; organisation_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.class_id) query.set('class_id', params.class_id);
    if (params?.section_id) query.set('section_id', params.section_id);
    if (params?.teacher_id) query.set('teacher_id', params.teacher_id);
    if (params?.organisation_id) query.set('organisation_id', params.organisation_id);
    const qs = query.toString();
    return apiClient.get<any[]>(`/management/timetable${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getByClass: (classId: string) =>
    apiClient.get<any[]>(`/management/timetable/class/${classId}`).then(handleResponse),
  getByTeacher: (teacherId: string) =>
    apiClient.get<any[]>(`/management/timetable/teacher/${teacherId}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/timetable', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.put<any>(`/management/timetable/${id}`, data).then(handleResponse),
  remove: (id: string) =>
    apiClient.delete<any>(`/management/timetable/${id}`).then(handleResponse),
  bulkCreate: (entries: any[]) =>
    apiClient.post<any[]>('/management/timetable/bulk', { entries }).then(handleResponse),
  getTeachers: () =>
    apiClient.get<any[]>(`/management/timetable/teachers-list/${orgId()}`).then(handleResponse),
  getClasses: () =>
    apiClient.get<any[]>(`/management/timetable/classes-list/${orgId()}`).then(handleResponse),
  getSections: (classId?: string) => {
    const qs = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
    return apiClient.get<any[]>(`/management/timetable/sections-list/${orgId()}${qs}`).then(handleResponse);
  },
  getSubjects: () =>
    apiClient.get<any[]>(`/management/timetable/subjects-list/${orgId()}`).then(handleResponse),
  checkConflicts: (params: { teacher_id: string; day_of_week: number; start_time: string; end_time: string; exclude_id?: string }) => {
    const query = new URLSearchParams(params as any);
    return apiClient.get<any[]>(`/management/timetable/check-conflicts?${query}`).then(handleResponse);
  },
  getStaffOverview: () =>
    apiClient.get<{ teachers: any[]; entries: any[] }>(`/management/timetable/staff-overview/${orgId()}`).then(handleResponse),
};

// ==================== ATTENDANCE ====================
export const attendanceApi = {
  getReport: () =>
    apiClient.get<any>(`/management/attendance-report/${orgId()}`).then(handleResponse),
  getDaily: (date: string) =>
    apiClient.get<any>(`/management/attendance/daily/${orgId()}/${date}`).then(handleResponse),
  getClassAttendance: (classId: string, date: string) =>
    apiClient.get<{ students: any[]; attendance: any[] }>(`/management/attendance/class/${classId}/${date}`).then(handleResponse),
  getByStudent: (studentId: string) =>
    apiClient.get<any>(`/management/attendance/student/${studentId}`).then(handleResponse),
  toggle: (data: { student_id: string; date: string; status: string; teacher_id?: string }) =>
    apiClient.post<any>('/management/attendance/toggle', { ...data, organisation_id: orgId() }).then(handleResponse),
  bulkMark: (data: { teacher_id?: string; class_id?: string; date: string; records: { student_id: string; status: string; notes?: string }[] }) =>
    apiClient.post<any[]>('/management/attendance/bulk', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== EXAMS ====================
export const examApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/exams/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/exams', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== FEE STRUCTURES ====================
export const feeApi = {
  getStructures: () =>
    apiClient.get<any[]>(`/management/fee-structures/${orgId()}`).then(handleResponse),
  createStructure: (data: any) =>
    apiClient.post<any>('/management/fee-structures', { ...data, organisation_id: orgId() }).then(handleResponse),
  getItems: (structureId: string) =>
    apiClient.get<any[]>(`/management/fee-items/${structureId}`).then(handleResponse),
  createItem: (data: any) =>
    apiClient.post<any>('/management/fee-items', data).then(handleResponse),
  getStudentFees: () =>
    apiClient.get<any[]>(`/management/student-fees/${orgId()}`).then(handleResponse),
  assignStudentFees: (data: any) =>
    apiClient.post<any>('/management/student-fees', data).then(handleResponse),
  getReport: () =>
    apiClient.get<any>(`/management/fee-report/${orgId()}`).then(handleResponse),
};

// ==================== PAYROLL ====================
export const payrollApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/payroll/dashboard/${orgId()}`).then(handleResponse),
  getPayrollRecords: (params?: { status?: string; month?: string; department?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.month) q.set('month', params.month);
    if (params?.department) q.set('department', params.department);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/payroll/records/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createPayrollRecord: (data: any) =>
    apiClient.post<any>(`/v2/payroll/records/${orgId()}`, data).then(handleResponse),
  updatePayrollRecord: (id: string, data: any) =>
    apiClient.put<any>(`/v2/payroll/records/${id}`, data).then(handleResponse),
  processPayroll: (id: string) =>
    apiClient.post<any>(`/v2/payroll/records/${id}/process`).then(handleResponse),
  markPaid: (id: string) =>
    apiClient.post<any>(`/v2/payroll/records/${id}/mark-paid`).then(handleResponse),
  getSalaryStructures: () =>
    apiClient.get<any>(`/v2/payroll/salary-structures/${orgId()}`).then(handleResponse),
  createSalaryStructure: (data: any) =>
    apiClient.post<any>(`/v2/payroll/salary-structures/${orgId()}`, data).then(handleResponse),
  updateSalaryStructure: (id: string, data: any) =>
    apiClient.put<any>(`/v2/payroll/salary-structures/${id}`, data).then(handleResponse),
  getEmployeeSalaries: () =>
    apiClient.get<any>(`/v2/payroll/employee-salaries/${orgId()}`).then(handleResponse),
  getDeductions: () =>
    apiClient.get<any>(`/v2/payroll/deductions/${orgId()}`).then(handleResponse),
  createDeduction: (data: any) =>
    apiClient.post<any>(`/v2/payroll/deductions/${orgId()}`, data).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/payroll/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/payroll/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/payroll/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/payroll/sidebar/${orgId()}`).then(handleResponse),
};

// ==================== STAFF EXPENSES ====================
export const staffExpensesApi = {
  getExpenses: (params?: { category?: string; status?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    const qs = q.toString();
    return apiClient.get<any[]>(`/v2/staff-expenses/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getSummary: () =>
    apiClient.get<any>(`/v2/staff-expenses/summary/${orgId()}`).then(handleResponse),
  createExpense: (data: any) =>
    apiClient.post<any>(`/v2/staff-expenses/${orgId()}`, data).then(handleResponse),
  updateExpense: (id: string, data: any) =>
    apiClient.put<any>(`/v2/staff-expenses/${id}`, data).then(handleResponse),
  deleteExpense: (id: string) =>
    apiClient.delete<any>(`/v2/staff-expenses/${id}`).then(handleResponse),
};

export const payrollApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/payroll/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/payroll', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== LEDGER / ACCOUNTS ====================
export const ledgerApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/ledger/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/ledger', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== LIBRARY ====================
export const libraryApi = {
  getBooks: () =>
    apiClient.get<any[]>(`/management/library-books/${orgId()}`).then(handleResponse),
  createBook: (data: any) =>
    apiClient.post<any>('/management/library-books', { ...data, organisation_id: orgId() }).then(handleResponse),
  getIssues: () =>
    apiClient.get<any[]>(`/management/library-issues/${orgId()}`).then(handleResponse),
  createIssue: (data: any) =>
    apiClient.post<any>('/management/library-issues', data).then(handleResponse),
};

// ==================== TRANSPORT V2 ====================
export const transportApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/transport/dashboard/${orgId()}`).then(handleResponse),
  getVehicles: (params?: { status?: string; vehicle_type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.vehicle_type) q.set('vehicle_type', params.vehicle_type);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/transport/vehicles/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createVehicle: (data: any) =>
    apiClient.post<any>(`/v2/transport/vehicles/${orgId()}`, data).then(handleResponse),
  updateVehicle: (id: string, data: any) =>
    apiClient.put<any>(`/v2/transport/vehicles/${id}`, data).then(handleResponse),
  deleteVehicle: (id: string) =>
    apiClient.delete<any>(`/v2/transport/vehicles/${id}`).then(handleResponse),
  getServiceHistory: (id: string) =>
    apiClient.get<any>(`/v2/transport/vehicles/${id}/service-history`).then(handleResponse),
  getRoutes: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/transport/routes/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createRoute: (data: any) =>
    apiClient.post<any>(`/v2/transport/routes/${orgId()}`, data).then(handleResponse),
  updateRoute: (id: string, data: any) =>
    apiClient.put<any>(`/v2/transport/routes/${id}`, data).then(handleResponse),
  deleteRoute: (id: string) =>
    apiClient.delete<any>(`/v2/transport/routes/${id}`).then(handleResponse),
  optimizeRoute: (id: string) =>
    apiClient.post<any>(`/v2/transport/routes/${id}/optimize`).then(handleResponse),
  getAssignments: () =>
    apiClient.get<any>(`/v2/transport/assignments/${orgId()}`).then(handleResponse),
  createAssignment: (data: any) =>
    apiClient.post<any>(`/v2/transport/assignments/${orgId()}`, data).then(handleResponse),
  updateAssignment: (id: string, data: any) =>
    apiClient.put<any>(`/v2/transport/assignments/${id}`, data).then(handleResponse),
  deleteAssignment: (id: string) =>
    apiClient.delete<any>(`/v2/transport/assignments/${id}`).then(handleResponse),
  getDrivers: () =>
    apiClient.get<any>(`/v2/transport/drivers/${orgId()}`).then(handleResponse),
  getExpenses: (params?: { expense_type?: string; vehicle_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.expense_type) q.set('expense_type', params.expense_type);
    if (params?.vehicle_id) q.set('vehicle_id', params.vehicle_id);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/transport/expenses/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createExpense: (data: any) =>
    apiClient.post<any>(`/v2/transport/expenses/${orgId()}`, data).then(handleResponse),
  updateExpense: (id: string, data: any) =>
    apiClient.put<any>(`/v2/transport/expenses/${id}`, data).then(handleResponse),
  getGpsTracking: () =>
    apiClient.get<any>(`/v2/transport/gps-tracking/${orgId()}`).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/transport/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/transport/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/transport/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/transport/sidebar/${orgId()}`).then(handleResponse),
};

// ==================== TRANSPORT (Legacy) ====================
export const transportApi = {
  getRoutes: () =>
    apiClient.get<any[]>(`/management/transport-routes/${orgId()}`).then(handleResponse),
  createRoute: (data: any) =>
    apiClient.post<any>('/management/transport-routes', { ...data, organisation_id: orgId() }).then(handleResponse),
  getVehicles: () =>
    apiClient.get<any[]>(`/management/transport-vehicles/${orgId()}`).then(handleResponse),
  createVehicle: (data: any) =>
    apiClient.post<any>('/management/transport-vehicles', { ...data, organisation_id: orgId() }).then(handleResponse),
  getAssignments: (studentId?: string) =>
    apiClient.get<any[]>(`/management/transport-assignments${studentId ? `/${studentId}` : `/${orgId()}`}`).then(handleResponse),
  createAssignment: (data: any) =>
    apiClient.post<any>('/management/transport-assignments', data).then(handleResponse),
};

export const transportMgmtApi = {
  getRoutes: () =>
    apiClient.get<any[]>(`/transport-management/routes/${orgId()}`).then(handleResponse),
  createRoute: (data: any) =>
    apiClient.post<any>('/transport-management/routes', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateRoute: (id: string, data: any) =>
    apiClient.put<any>(`/transport-management/routes/${id}`, data).then(handleResponse),
  deleteRoute: (id: string) =>
    apiClient.delete<any>(`/transport-management/routes/${id}`).then(handleResponse),
  getVehicles: () =>
    apiClient.get<any[]>(`/transport-management/vehicles/${orgId()}`).then(handleResponse),
  createVehicle: (data: any) =>
    apiClient.post<any>('/transport-management/vehicles', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateVehicle: (id: string, data: any) =>
    apiClient.put<any>(`/transport-management/vehicles/${id}`, data).then(handleResponse),
  deleteVehicle: (id: string) =>
    apiClient.delete<any>(`/transport-management/vehicles/${id}`).then(handleResponse),
  getAllocations: () =>
    apiClient.get<any[]>(`/transport-management/allocations/${orgId()}`).then(handleResponse),
  createAllocation: (data: any) =>
    apiClient.post<any>('/transport-management/allocations', { ...data, organisation_id: orgId() }).then(handleResponse),
  deleteAllocation: (id: string) =>
    apiClient.delete<any>(`/transport-management/allocations/${id}`).then(handleResponse),
  getExpenses: () =>
    apiClient.get<any[]>(`/transport-management/expenses/${orgId()}`).then(handleResponse),
  createExpense: (data: any) =>
    apiClient.post<any>('/transport-management/expenses', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== HOSTEL V2 ====================
export const hostelApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/hostel/dashboard/${orgId()}`).then(handleResponse),
  getHostels: () =>
    apiClient.get<any>(`/v2/hostel/hostels/${orgId()}`).then(handleResponse),
  createHostel: (data: any) =>
    apiClient.post<any>(`/v2/hostel/hostels/${orgId()}`, data).then(handleResponse),
  updateHostel: (id: string, data: any) =>
    apiClient.put<any>(`/v2/hostel/hostels/${id}`, data).then(handleResponse),
  deleteHostel: (id: string) =>
    apiClient.delete<any>(`/v2/hostel/hostels/${id}`).then(handleResponse),
  getRooms: (params?: { status?: string; room_type?: string; building?: string; floor?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.room_type) q.set('room_type', params.room_type);
    if (params?.building) q.set('building', params.building);
    if (params?.floor) q.set('floor', params.floor);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/hostel/rooms/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createRoom: (data: any) =>
    apiClient.post<any>(`/v2/hostel/rooms/${orgId()}`, data).then(handleResponse),
  updateRoom: (id: string, data: any) =>
    apiClient.put<any>(`/v2/hostel/rooms/${id}`, data).then(handleResponse),
  deleteRoom: (id: string) =>
    apiClient.delete<any>(`/v2/hostel/rooms/${id}`).then(handleResponse),
  getAllocations: () =>
    apiClient.get<any>(`/v2/hostel/allocations/${orgId()}`).then(handleResponse),
  createAllocation: (data: any) =>
    apiClient.post<any>(`/v2/hostel/allocations/${orgId()}`, data).then(handleResponse),
  updateAllocation: (id: string, data: any) =>
    apiClient.put<any>(`/v2/hostel/allocations/${id}`, data).then(handleResponse),
  deleteAllocation: (id: string) =>
    apiClient.delete<any>(`/v2/hostel/allocations/${id}`).then(handleResponse),
  getWardens: () =>
    apiClient.get<any>(`/v2/hostel/wardens/${orgId()}`).then(handleResponse),
  getAttendance: () =>
    apiClient.get<any>(`/v2/hostel/attendance/${orgId()}`).then(handleResponse),
  markAttendance: (data: any) =>
    apiClient.post<any>(`/v2/hostel/attendance/${orgId()}`, data).then(handleResponse),
  getFees: () =>
    apiClient.get<any>(`/v2/hostel/fees/${orgId()}`).then(handleResponse),
  collectFee: (id: string, data: any) =>
    apiClient.post<any>(`/v2/hostel/fees/${id}/collect`, data).then(handleResponse),
  getVisitors: () =>
    apiClient.get<any>(`/v2/hostel/visitors/${orgId()}`).then(handleResponse),
  approveVisitor: (id: string) =>
    apiClient.post<any>(`/v2/hostel/visitors/${id}/approve`).then(handleResponse),
  rejectVisitor: (id: string) =>
    apiClient.post<any>(`/v2/hostel/visitors/${id}/reject`).then(handleResponse),
  getMaintenance: () =>
    apiClient.get<any>(`/v2/hostel/maintenance/${orgId()}`).then(handleResponse),
  createMaintenanceTicket: (data: any) =>
    apiClient.post<any>(`/v2/hostel/maintenance/${orgId()}`, data).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/hostel/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/hostel/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/hostel/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/hostel/sidebar/${orgId()}`).then(handleResponse),
};

// ==================== HOSTEL (Legacy) ====================
export const hostelApi = {
  getRooms: () =>
    apiClient.get<any[]>(`/hostel-management/rooms/${orgId()}`).then(handleResponse),
  createRoom: (data: any) =>
    apiClient.post<any>('/hostel-management/rooms', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateRoom: (id: string, data: any) =>
    apiClient.put<any>(`/hostel-management/rooms/${id}`, data).then(handleResponse),
  deleteRoom: (id: string) =>
    apiClient.delete<any>(`/hostel-management/rooms/${id}`).then(handleResponse),
  getAllocations: () =>
    apiClient.get<any[]>(`/hostel-management/allocations/${orgId()}`).then(handleResponse),
  createAllocation: (data: any) =>
    apiClient.post<any>('/hostel-management/allocations', data).then(handleResponse),
  updateAllocation: (id: string, data: any) =>
    apiClient.put<any>(`/hostel-management/allocations/${id}`, data).then(handleResponse),
  deleteAllocation: (id: string) =>
    apiClient.delete<any>(`/hostel-management/allocations/${id}`).then(handleResponse),
};

// ==================== SCHOLARSHIPS ====================
export const scholarshipApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/scholarships/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/scholarships', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.patch<any>(`/management/scholarships/${id}`, data).then(handleResponse),
  delete: (id: string) =>
    apiClient.delete<any>(`/management/scholarships/${id}`).then(handleResponse),
};

// ==================== ANNOUNCEMENTS ====================
export const announcementApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/announcements/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/announcements', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.put<any>(`/management/announcements/${id}`, data).then(handleResponse),
  remove: (id: string) =>
    apiClient.delete<any>(`/management/announcements/${id}`).then(handleResponse),
  draft: (data: any) =>
    apiClient.post<any>('/management/announcements/draft', data).then(handleResponse),
};

// ==================== EVENTS ====================
export const eventApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/events/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/events', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== NOTIFICATIONS ====================
export const notificationApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/notifications/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/notifications', { ...data, organisation_id: orgId() }).then(handleResponse),
  getV2: () =>
    apiClient.get<any>(`/v2/notifications`).then(handleResponse),
  getUnreadCount: () =>
    apiClient.get<any>(`/v2/notifications/unread-count`).then(handleResponse),
  markAsRead: (id: string) =>
    apiClient.put<any>(`/v2/notifications/${id}/read`).then(handleResponse),
  markAllAsRead: () =>
    apiClient.put<any>(`/v2/notifications/read-all`).then(handleResponse),
  archive: (id: string) =>
    apiClient.put<any>(`/v2/notifications/${id}/archive`).then(handleResponse),
};

// ==================== AUDIT LOGS ====================
export const auditApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/audit-logs/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/audit-logs', data).then(handleResponse),
};

export const auditLogsApi = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/audit-logs/dashboard/${orgId()}`).then(handleResponse),
  getLogs: (params?: { action?: string; entity_type?: string; severity?: string; user_id?: string; from?: string; to?: string; search?: string; page?: number; limit?: number }) => {
    const qp = new URLSearchParams();
    if (params?.action) qp.set('action', params.action);
    if (params?.entity_type) qp.set('entity_type', params.entity_type);
    if (params?.severity) qp.set('severity', params.severity);
    if (params?.user_id) qp.set('user_id', params.user_id);
    if (params?.from) qp.set('from', params.from);
    if (params?.to) qp.set('to', params.to);
    if (params?.search) qp.set('search', params.search);
    if (params?.page) qp.set('page', String(params.page));
    if (params?.limit) qp.set('limit', String(params.limit));
    const qs = qp.toString();
    return apiClient.get<any>(`/v2/audit-logs/logs/${orgId()}${qs ? '?' + qs : ''}`).then(handleResponse);
  },
  getLogById: (id: string) =>
    apiClient.get<any>(`/v2/audit-logs/logs/${orgId()}/${id}`).then(handleResponse),
  createLog: (data: any) =>
    apiClient.post<any>(`/v2/audit-logs/logs/${orgId()}`, data).then(handleResponse),
  getActions: () =>
    apiClient.get<string[]>(`/v2/audit-logs/actions/${orgId()}`).then(handleResponse),
  getEntityTypes: () =>
    apiClient.get<string[]>(`/v2/audit-logs/entity-types/${orgId()}`).then(handleResponse),
  getRetention: () =>
    apiClient.get<any>(`/v2/audit-logs/retention/${orgId()}`).then(handleResponse),
  updateRetention: (data: any) =>
    apiClient.put<any>(`/v2/audit-logs/retention/${orgId()}`, data).then(handleResponse),
  purgeLogs: (olderThanDays: number) =>
    apiClient.post<any>(`/v2/audit-logs/purge/${orgId()}`, { older_than_days: olderThanDays }).then(handleResponse),
};

// ==================== DOCUMENTS ====================
export const documentApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/documents/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/documents', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== HELPDESK ====================
export const helpdeskApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/helpdesk-tickets/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/helpdesk-tickets', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== ACADEMIC REPORT ====================
export const reportApi = {
  getAcademic: () =>
    apiClient.get<any>(`/management/academic-report/${orgId()}`).then(handleResponse),
  getAttendance: () =>
    apiClient.get<any>(`/management/attendance-report/${orgId()}`).then(handleResponse),
  getFee: () =>
    apiClient.get<any>(`/management/fee-report/${orgId()}`).then(handleResponse),
};

// ==================== CREDENTIALS ====================
export const credentialApi = {
  getHistory: () =>
    apiClient.get<any[]>(`/management/credentials/history/${orgId()}`).then(handleResponse),
  createStudent: (data: any) =>
    apiClient.post<any>('/management/credentials/create-student', { ...data, organisation_id: orgId() }).then(handleResponse),
  createStaff: (data: any) =>
    apiClient.post<any>('/management/credentials/create-staff', { ...data, organisation_id: orgId() }).then(handleResponse),
  createParent: (data: any) =>
    apiClient.post<any>('/management/credentials/create-parent', { ...data, organisation_id: orgId() }).then(handleResponse),
  getUsers: () =>
    apiClient.get<any[]>(`/management/credentials/users/${orgId()}`).then(handleResponse),
  updateUserStatus: (userId: string, status: string) =>
    apiClient.put<any>(`/management/credentials/user/${userId}/status`, { status }).then(handleResponse),
};

// ==================== DIGITAL CREDENTIALS ====================
export const digitalCredentialApi = {
  getCertificates: () =>
    apiClient.get<any[]>(`/management/digital-credentials/certificates/${orgId()}`).then(handleResponse),
  createCertificate: (data: any) =>
    apiClient.post<any>('/management/digital-credentials/certificates', { ...data, organisation_id: orgId() }).then(handleResponse),
  getCredentials: () =>
    apiClient.get<any[]>(`/management/digital-credentials/credentials/${orgId()}`).then(handleResponse),
  createCredential: (data: any) =>
    apiClient.post<any>('/management/digital-credentials/credentials', { ...data, organisation_id: orgId() }).then(handleResponse),
  getBadges: () =>
    apiClient.get<any[]>(`/management/digital-credentials/badges/${orgId()}`).then(handleResponse),
  createBadge: (data: any) =>
    apiClient.post<any>('/management/digital-credentials/badges', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== AI INSIGHTS ====================
export const aiInsightApi = {
  getPredictions: () =>
    apiClient.get<any[]>(`/management/ai-insights/predictions/${orgId()}`).then(handleResponse),
  getRemedialPlans: () =>
    apiClient.get<any[]>(`/management/ai-insights/remedial-plans/${orgId()}`).then(handleResponse),
  getTeacherEffectiveness: () =>
    apiClient.get<any>(`/management/ai-insights/teacher-effectiveness/${orgId()}`).then(handleResponse),
};

// ==================== STAFF MANAGEMENT (extended) ====================
export const staffMgmtApi = {
  getPayroll: () =>
    apiClient.get<any[]>(`/management/staff-management/payroll/${orgId()}`).then(handleResponse),
  createPayroll: (data: any) =>
    apiClient.post<any>('/management/staff-management/payroll', { ...data, organisation_id: orgId() }).then(handleResponse),
  getJobPostings: () =>
    apiClient.get<any[]>(`/management/staff-management/job-postings/${orgId()}`).then(handleResponse),
  createJobPosting: (data: any) =>
    apiClient.post<any>('/management/staff-management/job-postings', { ...data, organisation_id: orgId() }).then(handleResponse),
  getPerformanceReviews: () =>
    apiClient.get<any[]>(`/management/staff-management/performance-reviews/${orgId()}`).then(handleResponse),
  createPerformanceReview: (data: any) =>
    apiClient.post<any>('/management/staff-management/performance-reviews', { ...data, organisation_id: orgId() }).then(handleResponse),
  getTraining: () =>
    apiClient.get<any[]>(`/management/staff-management/training/${orgId()}`).then(handleResponse),
  createTraining: (data: any) =>
    apiClient.post<any>('/management/staff-management/training', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== INVENTORY ====================
export const inventoryApi = {
  getAssets: () =>
    apiClient.get<any[]>(`/management/inventory/assets/${orgId()}`).then(handleResponse),
  createAsset: (data: any) =>
    apiClient.post<any>('/management/inventory/assets', { ...data, organisation_id: orgId() }).then(handleResponse),
  getStock: () =>
    apiClient.get<any[]>(`/management/inventory/stock/${orgId()}`).then(handleResponse),
  createStock: (data: any) =>
    apiClient.post<any>('/management/inventory/stock', { ...data, organisation_id: orgId() }).then(handleResponse),
  getPurchaseOrders: () =>
    apiClient.get<any[]>(`/management/inventory/purchase-orders/${orgId()}`).then(handleResponse),
  createPurchaseOrder: (data: any) =>
    apiClient.post<any>('/management/inventory/purchase-orders', { ...data, organisation_id: orgId() }).then(handleResponse),
  getMaintenance: () =>
    apiClient.get<any[]>(`/management/inventory/maintenance/${orgId()}`).then(handleResponse),
  createMaintenance: (data: any) =>
    apiClient.post<any>('/management/inventory/maintenance', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== ADMISSION ====================
export const admissionApi = {
  getApplications: () =>
    apiClient.get<any[]>(`/management/admission/applications/${orgId()}`).then(handleResponse),
  createApplication: (data: any) =>
    apiClient.post<any>('/management/admission/applications', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateApplicationStatus: (id: string, status: string) =>
    apiClient.put<any>(`/management/admission/applications/${id}/status`, { status }).then(handleResponse),
  getEnquiries: () =>
    apiClient.get<any[]>(`/management/admission/enquiries/${orgId()}`).then(handleResponse),
  createEnquiry: (data: any) =>
    apiClient.post<any>('/management/admission/enquiries', { ...data, organisation_id: orgId() }).then(handleResponse),
  getReports: () =>
    apiClient.get<any>(`/management/admission/reports/${orgId()}`).then(handleResponse),
};

// ==================== HEALTH ====================
export const healthApi = {
  getDashboard: () =>
    apiClient.get<any>(`/management/health/dashboard/${orgId()}`).then(handleResponse),
  getRecords: (params?: any) =>
    apiClient.get<any[]>(`/management/health/records/${orgId()}`).then(handleResponse),
  getMedicalVisits: () =>
    apiClient.get<any[]>(`/management/health/visits/${orgId()}`).then(handleResponse),
  getVaccinations: () =>
    apiClient.get<any[]>(`/management/health/vaccinations/${orgId()}`).then(handleResponse),
  getMedications: () =>
    apiClient.get<any[]>(`/management/health/medications/${orgId()}`).then(handleResponse),
  getEmergencyInfo: () =>
    apiClient.get<any[]>(`/management/health/emergency/${orgId()}`).then(handleResponse),
  getWellnessData: () =>
    apiClient.get<any[]>(`/management/health/wellness/${orgId()}`).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/management/health/analytics/${orgId()}`).then(handleResponse),
  getReports: () =>
    apiClient.get<any[]>(`/management/health/reports/${orgId()}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/management/health/sidebar/${orgId()}`).then(handleResponse),
  createRecord: (data: any) =>
    apiClient.post<any>('/management/health/records', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateRecord: (id: string, data: any) =>
    apiClient.put<any>(`/management/health/records/${id}`, data).then(handleResponse),
  createVisit: (data: any) =>
    apiClient.post<any>('/management/health/visits', { ...data, organisation_id: orgId() }).then(handleResponse),
  createVaccination: (data: any) =>
    apiClient.post<any>('/management/health/vaccinations', { ...data, organisation_id: orgId() }).then(handleResponse),
  createMedication: (data: any) =>
    apiClient.post<any>('/management/health/medications', { ...data, organisation_id: orgId() }).then(handleResponse),
  createEmergencyAlert: (data: any) =>
    apiClient.post<any>('/management/health/emergency', { ...data, organisation_id: orgId() }).then(handleResponse),
  createWellnessRecord: (data: any) =>
    apiClient.post<any>('/management/health/wellness', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== HEALTH (V4) ====================
export const healthApiV4 = {
  getDashboard: () =>
    apiClient.get<any>(`/v4/health/dashboard/${orgId()}`).then(handleResponse),
  getStudents: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<any[]>(`/v4/health/students/${orgId()}${query}`).then(handleResponse);
  },
  getRecords: (params?: any) => {
    const clean: Record<string, string> = {};
    Object.entries(params || {}).forEach(([k, v]: [string, any]) => {
      if (v !== undefined && v !== null && v !== '') clean[k] = String(v);
    });
    const query = new URLSearchParams(clean).toString();
    return apiClient.get<any[]>(`/v4/health/records/${orgId()}${query ? `?${query}` : ''}`).then(handleResponse);
  },
  createRecord: (data: any) =>
    apiClient.post<any>(`/v4/health/records/${orgId()}`, data).then(handleResponse),
  getVaccinations: (student_id?: string) => {
    const query = student_id ? `?student_id=${student_id}` : '';
    return apiClient.get<any[]>(`/v4/health/vaccinations/${orgId()}${query}`).then(handleResponse);
  },
  createVaccination: (data: any) =>
    apiClient.post<any>(`/v4/health/vaccinations/${orgId()}`, data).then(handleResponse),
  getMedicalRecords: (student_id?: string) => {
    const query = student_id ? `?student_id=${student_id}` : '';
    return apiClient.get<any[]>(`/v4/health/medical-records/${orgId()}${query}`).then(handleResponse);
  },
  createMedicalRecord: (data: any) =>
    apiClient.post<any>(`/v4/health/medical-records/${orgId()}`, data).then(handleResponse),
  getEmergencyContacts: () =>
    apiClient.get<any[]>(`/v4/health/emergency/${orgId()}`).then(handleResponse),
  getStudentProfile: (student_id: string) =>
    apiClient.get<any>(`/v4/health/student/${orgId()}/${student_id}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v4/health/ai-insights/${orgId()}`).then(handleResponse),
};

// ==================== EXTRACURRICULAR ====================
export const extracurricularApi = {
  getClubs: () =>
    apiClient.get<any[]>(`/management/extracurricular/clubs/${orgId()}`).then(handleResponse),
  createClub: (data: any) =>
    apiClient.post<any>('/management/extracurricular/clubs', { ...data, organisation_id: orgId() }).then(handleResponse),
  getSportsTeams: () =>
    apiClient.get<any[]>(`/management/extracurricular/sports-teams/${orgId()}`).then(handleResponse),
  createSportsTeam: (data: any) =>
    apiClient.post<any>('/management/extracurricular/sports-teams', { ...data, organisation_id: orgId() }).then(handleResponse),
  getEvents: () =>
    apiClient.get<any[]>(`/management/extracurricular/events/${orgId()}`).then(handleResponse),
  createEvent: (data: any) =>
    apiClient.post<any>('/management/extracurricular/events', { ...data, organisation_id: orgId() }).then(handleResponse),
};

// ==================== EVENTS MANAGEMENT (refactored CRUD) ====================
export const eventMgmtApi = {
  getEvents: () =>
    apiClient.get<any[]>(`/events-management/events/${orgId()}`).then(handleResponse),
  createEvent: (data: any) =>
    apiClient.post<any>('/events-management/events', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateEvent: (id: string, data: any) =>
    apiClient.put<any>(`/events-management/events/${id}`, data).then(handleResponse),
  deleteEvent: (id: string) =>
    apiClient.delete<any>(`/events-management/events/${id}`).then(handleResponse),

  getClubs: () =>
    apiClient.get<any[]>(`/events-management/clubs/${orgId()}`).then(handleResponse),
  createClub: (data: any) =>
    apiClient.post<any>('/events-management/clubs', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateClub: (id: string, data: any) =>
    apiClient.put<any>(`/events-management/clubs/${id}`, data).then(handleResponse),
  deleteClub: (id: string) =>
    apiClient.delete<any>(`/events-management/clubs/${id}`).then(handleResponse),

  getSportsTeams: () =>
    apiClient.get<any[]>(`/events-management/sports-teams/${orgId()}`).then(handleResponse),
  createSportsTeam: (data: any) =>
    apiClient.post<any>('/events-management/sports-teams', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateSportsTeam: (id: string, data: any) =>
    apiClient.put<any>(`/events-management/sports-teams/${id}`, data).then(handleResponse),
  deleteSportsTeam: (id: string) =>
    apiClient.delete<any>(`/events-management/sports-teams/${id}`).then(handleResponse),
};

// ==================== ALUMNI ====================
export const alumniApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/alumni/alumni/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/alumni/alumni', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.put<any>(`/management/alumni/alumni/${id}`, data).then(handleResponse),
  getEvents: () =>
    apiClient.get<any[]>(`/management/alumni/events/${orgId()}`).then(handleResponse),
  createEvent: (data: any) =>
    apiClient.post<any>('/management/alumni/events', { ...data, organisation_id: orgId() }).then(handleResponse),
  getDonations: () =>
    apiClient.get<any[]>(`/management/alumni/donations/${orgId()}`).then(handleResponse),
  createDonation: (data: any) =>
    apiClient.post<any>('/management/alumni/donations', { ...data, organisation_id: orgId() }).then(handleResponse),
  getMentors: () =>
    apiClient.get<any[]>(`/management/alumni/mentors/${orgId()}`).then(handleResponse),
  createMentor: (data: any) =>
    apiClient.post<any>('/management/alumni/mentors', { ...data, organisation_id: orgId() }).then(handleResponse),
};

export const alumniMgmtApi = {
  getAll: () =>
    apiClient.get<any[]>(`/alumni-management/alumni/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/alumni-management/alumni', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.put<any>(`/alumni-management/alumni/${id}`, data).then(handleResponse),
  delete: (id: string) =>
    apiClient.delete<any>(`/alumni-management/alumni/${id}`).then(handleResponse),

  getEvents: () =>
    apiClient.get<any[]>(`/alumni-management/events/${orgId()}`).then(handleResponse),
  createEvent: (data: any) =>
    apiClient.post<any>('/alumni-management/events', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateEvent: (id: string, data: any) =>
    apiClient.put<any>(`/alumni-management/events/${id}`, data).then(handleResponse),
  deleteEvent: (id: string) =>
    apiClient.delete<any>(`/alumni-management/events/${id}`).then(handleResponse),

  getDonations: () =>
    apiClient.get<any[]>(`/alumni-management/donations/${orgId()}`).then(handleResponse),
  createDonation: (data: any) =>
    apiClient.post<any>('/alumni-management/donations', { ...data, organisation_id: orgId() }).then(handleResponse),
  deleteDonation: (id: string) =>
    apiClient.delete<any>(`/alumni-management/donations/${id}`).then(handleResponse),

  getMentors: () =>
    apiClient.get<any[]>(`/alumni-management/mentors/${orgId()}`).then(handleResponse),
  createMentor: (data: any) =>
    apiClient.post<any>('/alumni-management/mentors', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateMentor: (id: string, data: any) =>
    apiClient.put<any>(`/alumni-management/mentors/${id}`, data).then(handleResponse),
  deleteMentor: (id: string) =>
    apiClient.delete<any>(`/alumni-management/mentors/${id}`).then(handleResponse),
};

// ==================== CAREER MANAGEMENT ====================
export const careerApi = {
  getPsychometricTests: () =>
    apiClient.get<any[]>(`/management/career/psychometric-tests/${orgId()}`).then(handleResponse),
  getInternships: () =>
    apiClient.get<any[]>(`/management/career/internships/${orgId()}`).then(handleResponse),
  getCollegeApplications: () =>
    apiClient.get<any[]>(`/management/career/college-applications/${orgId()}`).then(handleResponse),
  getSkillAssessments: () =>
    apiClient.get<any[]>(`/management/career/skill-assessments/${orgId()}`).then(handleResponse),
};

export const careerMgmtApi = {
  getInternships: () =>
    apiClient.get<any[]>(`/career-management/internships/${orgId()}`).then(handleResponse),
  createInternship: (data: any) =>
    apiClient.post<any>('/career-management/internships', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateInternship: (id: string, data: any) =>
    apiClient.put<any>(`/career-management/internships/${id}`, data).then(handleResponse),
  deleteInternship: (id: string) =>
    apiClient.delete<any>(`/career-management/internships/${id}`).then(handleResponse),

  getPsychometricTests: () =>
    apiClient.get<any[]>(`/career-management/psychometric-tests/${orgId()}`).then(handleResponse),
  createPsychometricTest: (data: any) =>
    apiClient.post<any>('/career-management/psychometric-tests', { ...data, organisation_id: orgId() }).then(handleResponse),
  updatePsychometricTest: (id: string, data: any) =>
    apiClient.put<any>(`/career-management/psychometric-tests/${id}`, data).then(handleResponse),
  deletePsychometricTest: (id: string) =>
    apiClient.delete<any>(`/career-management/psychometric-tests/${id}`).then(handleResponse),

  getCollegeApplications: () =>
    apiClient.get<any[]>(`/career-management/college-applications/${orgId()}`).then(handleResponse),
  createCollegeApplication: (data: any) =>
    apiClient.post<any>('/career-management/college-applications', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateCollegeApplication: (id: string, data: any) =>
    apiClient.put<any>(`/career-management/college-applications/${id}`, data).then(handleResponse),
  deleteCollegeApplication: (id: string) =>
    apiClient.delete<any>(`/career-management/college-applications/${id}`).then(handleResponse),

  getSkillAssessments: () =>
    apiClient.get<any[]>(`/career-management/skill-assessments/${orgId()}`).then(handleResponse),
  createSkillAssessment: (data: any) =>
    apiClient.post<any>('/career-management/skill-assessments', { ...data, organisation_id: orgId() }).then(handleResponse),
  deleteSkillAssessment: (id: string) =>
    apiClient.delete<any>(`/career-management/skill-assessments/${id}`).then(handleResponse),

  getSessions: () =>
    apiClient.get<any[]>(`/career-management/sessions/${orgId()}`).then(handleResponse),
  createSession: (data: any) =>
    apiClient.post<any>('/career-management/sessions', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateSession: (id: string, data: any) =>
    apiClient.put<any>(`/career-management/sessions/${id}`, data).then(handleResponse),
  deleteSession: (id: string) =>
    apiClient.delete<any>(`/career-management/sessions/${id}`).then(handleResponse),
};

// ==================== GAMIFICATION (Learning Games + XP + Leaderboard) ====================
export const learningGameApi = {
  getGames: () =>
    apiClient.get<any[]>(`/gamification/learning-games/${orgId()}`).then(handleResponse),
  createGame: (data: any) =>
    apiClient.post<any>('/gamification/learning-games', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateGame: (id: string, data: any) =>
    apiClient.put<any>(`/gamification/learning-games/${id}`, data).then(handleResponse),
  deleteGame: (id: string) =>
    apiClient.delete<any>(`/gamification/learning-games/${id}`).then(handleResponse),
  getAssignments: () =>
    apiClient.get<any[]>(`/gamification/assignments/${orgId()}`).then(handleResponse),
  createAssignment: (data: any) =>
    apiClient.post<any>('/gamification/assignments', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateAssignment: (id: string, data: any) =>
    apiClient.put<any>(`/gamification/assignments/${id}`, data).then(handleResponse),
  deleteAssignment: (id: string) =>
    apiClient.delete<any>(`/gamification/assignments/${id}`).then(handleResponse),
  getSessions: () =>
    apiClient.get<any[]>(`/gamification/sessions/${orgId()}`).then(handleResponse),
  getStudentSessions: (studentId: string) =>
    apiClient.get<any[]>(`/gamification/sessions/student/${studentId}`).then(handleResponse),
  createSession: (data: any) =>
    apiClient.post<any>('/gamification/sessions', { ...data, organisation_id: orgId() }).then(handleResponse),
  getXp: () =>
    apiClient.get<any[]>(`/gamification/xp/${orgId()}`).then(handleResponse),
  getStudentXp: (studentId: string) =>
    apiClient.get<any>(`/gamification/xp/student/${studentId}`).then(handleResponse),
  awardXp: (data: any) =>
    apiClient.post<any>('/gamification/xp/award', { ...data, organisation_id: orgId() }).then(handleResponse),
  getAchievementDefs: () =>
    apiClient.get<any[]>(`/gamification/achievements/${orgId()}`).then(handleResponse),
  createAchievementDef: (data: any) =>
    apiClient.post<any>('/gamification/achievements', { ...data, organisation_id: orgId() }).then(handleResponse),
  deleteAchievementDef: (id: string) =>
    apiClient.delete<any>(`/gamification/achievements/${id}`).then(handleResponse),
  getStudentAchievements: (studentId: string) =>
    apiClient.get<any[]>(`/gamification/student-achievements/${studentId}`).then(handleResponse),
  awardStudentAchievement: (data: any) =>
    apiClient.post<any>('/gamification/student-achievements', { ...data, organisation_id: orgId() }).then(handleResponse),
  getLeaderboard: () =>
    apiClient.get<any[]>(`/gamification/leaderboard/${orgId()}`).then(handleResponse),
  refreshLeaderboard: () =>
    apiClient.post<any>(`/gamification/leaderboard/refresh/${orgId()}`).then(handleResponse),
};

// ==================== ESPORTS ====================
export const esportsApi = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/esports/dashboard/${orgId()}`).then(handleResponse),
  getLeagues: () =>
    apiClient.get<any[]>(`/v2/esports/leagues/${orgId()}`).then(handleResponse),
  createLeague: (data: any) =>
    apiClient.post<any>(`/v2/esports/leagues/${orgId()}`, data).then(handleResponse),
  updateLeague: (id: string, data: any) =>
    apiClient.put<any>(`/v2/esports/leagues/${id}`, data).then(handleResponse),
  deleteLeague: (id: string) =>
    apiClient.delete<any>(`/v2/esports/leagues/${id}`).then(handleResponse),
  getTeams: (leagueId?: string) =>
    apiClient.get<any[]>(`/v2/esports/teams/${orgId()}${leagueId ? '/' + leagueId : ''}`).then(handleResponse),
  createTeam: (data: any) =>
    apiClient.post<any>(`/v2/esports/teams/${orgId()}`, data).then(handleResponse),
  updateTeam: (id: string, data: any) =>
    apiClient.put<any>(`/v2/esports/teams/${id}`, data).then(handleResponse),
  deleteTeam: (id: string) =>
    apiClient.delete<any>(`/v2/esports/teams/${id}`).then(handleResponse),
  getPlayers: (teamId?: string) =>
    apiClient.get<any[]>(`/v2/esports/players/${orgId()}${teamId ? '/' + teamId : ''}`).then(handleResponse),
  addPlayer: (data: any) =>
    apiClient.post<any>(`/v2/esports/players/${orgId()}`, data).then(handleResponse),
  removePlayer: (id: string) =>
    apiClient.delete<any>(`/v2/esports/players/${id}`).then(handleResponse),
  getTournaments: (leagueId?: string) =>
    apiClient.get<any[]>(`/v2/esports/tournaments/${orgId()}${leagueId ? '/' + leagueId : ''}`).then(handleResponse),
  createTournament: (data: any) =>
    apiClient.post<any>(`/v2/esports/tournaments/${orgId()}`, data).then(handleResponse),
  getMatches: (params?: { leagueId?: string; teamId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.leagueId) q.set('league_id', params.leagueId);
    if (params?.teamId) q.set('team_id', params.teamId);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return apiClient.get<any[]>(`/v2/esports/matches/${orgId()}${qs ? '?' + qs : ''}`).then(handleResponse);
  },
  createMatch: (data: any) =>
    apiClient.post<any>(`/v2/esports/matches/${orgId()}`, data).then(handleResponse),
  updateMatchScore: (matchId: string, data: any) =>
    apiClient.put<any>(`/v2/esports/matches/${matchId}/score`, data).then(handleResponse),
  getStandings: (leagueId: string) =>
    apiClient.get<any[]>(`/v2/esports/standings/${orgId()}/${leagueId}`).then(handleResponse),
  getCurriculum: () =>
    apiClient.get<any[]>(`/v2/esports/curriculum/${orgId()}`).then(handleResponse),
  createCurriculum: (data: any) =>
    apiClient.post<any>(`/v2/esports/curriculum/${orgId()}`, data).then(handleResponse),
  deleteCurriculum: (id: string) =>
    apiClient.delete<any>(`/v2/esports/curriculum/${id}`).then(handleResponse),
  getStreams: () =>
    apiClient.get<any[]>(`/v2/esports/streams/${orgId()}`).then(handleResponse),
  createStream: (data: any) =>
    apiClient.post<any>(`/v2/esports/streams/${orgId()}`, data).then(handleResponse),
  deleteStream: (id: string) =>
    apiClient.delete<any>(`/v2/esports/streams/${id}`).then(handleResponse),
};

// ==================== COLLABORATION ====================
export const collaborationApi = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/collaboration/dashboard/${orgId()}`).then(handleResponse),
  getClassrooms: () =>
    apiClient.get<any[]>(`/v2/collaboration/classrooms/${orgId()}`).then(handleResponse),
  createClassroom: (data: any) =>
    apiClient.post<any>(`/v2/collaboration/classrooms/${orgId()}`, data).then(handleResponse),
  updateClassroom: (id: string, data: any) =>
    apiClient.put<any>(`/v2/collaboration/classrooms/${id}`, data).then(handleResponse),
  deleteClassroom: (id: string) =>
    apiClient.delete<any>(`/v2/collaboration/classrooms/${id}`).then(handleResponse),
  getProjects: () =>
    apiClient.get<any[]>(`/v2/collaboration/projects/${orgId()}`).then(handleResponse),
  createProject: (data: any) =>
    apiClient.post<any>(`/v2/collaboration/projects/${orgId()}`, data).then(handleResponse),
  updateProject: (id: string, data: any) =>
    apiClient.put<any>(`/v2/collaboration/projects/${id}`, data).then(handleResponse),
  deleteProject: (id: string) =>
    apiClient.delete<any>(`/v2/collaboration/projects/${id}`).then(handleResponse),
  getProjectTasks: (projectId: string) =>
    apiClient.get<any[]>(`/v2/collaboration/projects/${projectId}/tasks`).then(handleResponse),
  createTask: (data: any) =>
    apiClient.post<any>(`/v2/collaboration/tasks/${orgId()}`, data).then(handleResponse),
  updateTask: (id: string, data: any) =>
    apiClient.put<any>(`/v2/collaboration/tasks/${id}`, data).then(handleResponse),
  deleteTask: (id: string) =>
    apiClient.delete<any>(`/v2/collaboration/tasks/${id}`).then(handleResponse),
  getWhiteboards: () =>
    apiClient.get<any[]>(`/v2/collaboration/whiteboards/${orgId()}`).then(handleResponse),
  createWhiteboard: (data: any) =>
    apiClient.post<any>(`/v2/collaboration/whiteboards/${orgId()}`, data).then(handleResponse),
  deleteWhiteboard: (id: string) =>
    apiClient.delete<any>(`/v2/collaboration/whiteboards/${id}`).then(handleResponse),
  getDocuments: () =>
    apiClient.get<any[]>(`/v2/collaboration/documents/${orgId()}`).then(handleResponse),
  createDocument: (data: any) =>
    apiClient.post<any>(`/v2/collaboration/documents/${orgId()}`, data).then(handleResponse),
  updateDocument: (id: string, data: any) =>
    apiClient.put<any>(`/v2/collaboration/documents/${id}`, data).then(handleResponse),
  deleteDocument: (id: string) =>
    apiClient.delete<any>(`/v2/collaboration/documents/${id}`).then(handleResponse),
  getForums: () =>
    apiClient.get<any[]>(`/v2/collaboration/forums/${orgId()}`).then(handleResponse),
  createForum: (data: any) =>
    apiClient.post<any>(`/v2/collaboration/forums/${orgId()}`, data).then(handleResponse),
  deleteForum: (id: string) =>
    apiClient.delete<any>(`/v2/collaboration/forums/${id}`).then(handleResponse),
  getForumPosts: (forumId: string) =>
    apiClient.get<any[]>(`/v2/collaboration/forums/${forumId}/posts`).then(handleResponse),
  createPost: (data: any) =>
    apiClient.post<any>(`/v2/collaboration/posts/${orgId()}`, data).then(handleResponse),
};

// ==================== BIOMETRICS ====================
export const biometricsApi = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/biometrics/dashboard/${orgId()}`).then(handleResponse),
  getDevices: () =>
    apiClient.get<any[]>(`/v2/biometrics/devices/${orgId()}`).then(handleResponse),
  createDevice: (data: any) =>
    apiClient.post<any>(`/v2/biometrics/devices/${orgId()}`, data).then(handleResponse),
  updateDevice: (id: string, data: any) =>
    apiClient.put<any>(`/v2/biometrics/devices/${id}`, data).then(handleResponse),
  deleteDevice: (id: string) =>
    apiClient.delete<any>(`/v2/biometrics/devices/${id}`).then(handleResponse),
  getTemplates: (userId?: string) =>
    apiClient.get<any[]>(`/v2/biometrics/templates/${orgId()}${userId ? `/user/${userId}` : ''}`).then(handleResponse),
  enrollTemplate: (data: any) =>
    apiClient.post<any>(`/v2/biometrics/templates/${orgId()}`, data).then(handleResponse),
  updateTemplate: (id: string, data: any) =>
    apiClient.put<any>(`/v2/biometrics/templates/${id}`, data).then(handleResponse),
  deleteTemplate: (id: string) =>
    apiClient.delete<any>(`/v2/biometrics/templates/${id}`).then(handleResponse),
  getAttendanceLogs: (params?: { userId?: string; deviceId?: string; status?: string; from?: string; to?: string }) => {
    const qp = new URLSearchParams();
    if (params?.userId) qp.set('user_id', params.userId);
    if (params?.deviceId) qp.set('device_id', params.deviceId);
    if (params?.status) qp.set('status', params.status);
    if (params?.from) qp.set('from', params.from);
    if (params?.to) qp.set('to', params.to);
    const qs = qp.toString();
    return apiClient.get<any[]>(`/v2/biometrics/attendance/${orgId()}${qs ? '?' + qs : ''}`).then(handleResponse);
  },
  recordAttendance: (data: any) =>
    apiClient.post<any>(`/v2/biometrics/attendance/${orgId()}`, data).then(handleResponse),
  getAssignments: (deviceId?: string) =>
    apiClient.get<any[]>(`/v2/biometrics/assignments/${orgId()}${deviceId ? `/device/${deviceId}` : ''}`).then(handleResponse),
  createAssignment: (data: any) =>
    apiClient.post<any>(`/v2/biometrics/assignments/${orgId()}`, data).then(handleResponse),
  deleteAssignment: (id: string) =>
    apiClient.delete<any>(`/v2/biometrics/assignments/${id}`).then(handleResponse),
};

// ==================== ANALYTICS ====================
export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/analytics/dashboard/${orgId()}`).then(handleResponse),
  getDashboards: () =>
    apiClient.get<any[]>(`/v2/analytics/dashboards/${orgId()}`).then(handleResponse),
  createDashboard: (data: any) =>
    apiClient.post<any>(`/v2/analytics/dashboards/${orgId()}`, data).then(handleResponse),
  updateDashboard: (id: string, data: any) =>
    apiClient.put<any>(`/v2/analytics/dashboards/${id}`, data).then(handleResponse),
  deleteDashboard: (id: string) =>
    apiClient.delete<any>(`/v2/analytics/dashboards/${id}`).then(handleResponse),
  getWidgets: (dashboardId: string) =>
    apiClient.get<any[]>(`/v2/analytics/dashboards/${dashboardId}/widgets`).then(handleResponse),
  createWidget: (dashboardId: string, data: any) =>
    apiClient.post<any>(`/v2/analytics/widgets/${orgId()}`, { ...data, dashboard_id: dashboardId }).then(handleResponse),
  updateWidget: (id: string, data: any) =>
    apiClient.put<any>(`/v2/analytics/widgets/${id}`, data).then(handleResponse),
  deleteWidget: (id: string) =>
    apiClient.delete<any>(`/v2/analytics/widgets/${id}`).then(handleResponse),
  getReports: (reportType?: string) => {
    const qs = reportType ? `?report_type=${reportType}` : '';
    return apiClient.get<any[]>(`/v2/analytics/reports/${orgId()}${qs}`).then(handleResponse);
  },
  createReport: (data: any) =>
    apiClient.post<any>(`/v2/analytics/reports/${orgId()}`, data).then(handleResponse),
  updateReport: (id: string, data: any) =>
    apiClient.put<any>(`/v2/analytics/reports/${id}`, data).then(handleResponse),
  deleteReport: (id: string) =>
    apiClient.delete<any>(`/v2/analytics/reports/${id}`).then(handleResponse),
  executeReport: (id: string) =>
    apiClient.post<any>(`/v2/analytics/reports/${id}/execute`).then(handleResponse),
  getDataSources: () =>
    apiClient.get<any[]>(`/v2/analytics/data-sources/${orgId()}`).then(handleResponse),
  createDataSource: (data: any) =>
    apiClient.post<any>(`/v2/analytics/data-sources/${orgId()}`, data).then(handleResponse),
  updateDataSource: (id: string, data: any) =>
    apiClient.put<any>(`/v2/analytics/data-sources/${id}`, data).then(handleResponse),
  deleteDataSource: (id: string) =>
    apiClient.delete<any>(`/v2/analytics/data-sources/${id}`).then(handleResponse),
  testDataSource: (id: string) =>
    apiClient.post<any>(`/v2/analytics/data-sources/${id}/test`).then(handleResponse),
};

// ==================== SCHOOL STORE V2 ====================
export const storeApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/store/dashboard/${orgId()}`).then(handleResponse),
  getProducts: (params?: { category?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/store/products/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createProduct: (data: any) =>
    apiClient.post<any>(`/v2/store/products/${orgId()}`, data).then(handleResponse),
  updateProduct: (id: string, data: any) =>
    apiClient.put<any>(`/v2/store/products/${id}`, data).then(handleResponse),
  deleteProduct: (id: string) =>
    apiClient.delete<any>(`/v2/store/products/${id}`).then(handleResponse),
  duplicateProduct: (id: string) =>
    apiClient.post<any>(`/v2/store/products/${id}/duplicate`).then(handleResponse),
  updateStock: (id: string, data: any) =>
    apiClient.post<any>(`/v2/store/products/${id}/stock`, data).then(handleResponse),
  getOrders: (params?: { payment_status?: string; delivery_status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.payment_status) q.set('payment_status', params.payment_status);
    if (params?.delivery_status) q.set('delivery_status', params.delivery_status);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/store/orders/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createOrder: (data: any) =>
    apiClient.post<any>(`/v2/store/orders/${orgId()}`, data).then(handleResponse),
  updateOrderStatus: (id: string, data: any) =>
    apiClient.put<any>(`/v2/store/orders/${id}/status`, data).then(handleResponse),
  refundOrder: (id: string) =>
    apiClient.post<any>(`/v2/store/orders/${id}/refund`).then(handleResponse),
  getInventory: () =>
    apiClient.get<any>(`/v2/store/inventory/${orgId()}`).then(handleResponse),
  addStock: (id: string, data: any) =>
    apiClient.post<any>(`/v2/store/inventory/${id}/add`, data).then(handleResponse),
  removeStock: (id: string, data: any) =>
    apiClient.post<any>(`/v2/store/inventory/${id}/remove`, data).then(handleResponse),
  transferInventory: (id: string, data: any) =>
    apiClient.post<any>(`/v2/store/inventory/${id}/transfer`, data).then(handleResponse),
  getCategories: () =>
    apiClient.get<any>(`/v2/store/categories/${orgId()}`).then(handleResponse),
  createCategory: (data: any) =>
    apiClient.post<any>(`/v2/store/categories/${orgId()}`, data).then(handleResponse),
  updateCategory: (id: string, data: any) =>
    apiClient.put<any>(`/v2/store/categories/${id}`, data).then(handleResponse),
  archiveCategory: (id: string) =>
    apiClient.post<any>(`/v2/store/categories/${id}/archive`).then(handleResponse),
  getSuppliers: () =>
    apiClient.get<any>(`/v2/store/suppliers/${orgId()}`).then(handleResponse),
  createSupplier: (data: any) =>
    apiClient.post<any>(`/v2/store/suppliers/${orgId()}`, data).then(handleResponse),
  updateSupplier: (id: string, data: any) =>
    apiClient.put<any>(`/v2/store/suppliers/${id}`, data).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/store/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/store/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/store/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/store/sidebar/${orgId()}`).then(handleResponse),
};

// ==================== SCHOOL STORE (Legacy) ====================
export const storeApi = {
  getProducts: () =>
    apiClient.get<any[]>(`/management/store/products/${orgId()}`).then(handleResponse),
  getOrders: () =>
    apiClient.get<any[]>(`/management/store/orders/${orgId()}`).then(handleResponse),
  getMenu: () =>
    apiClient.get<any[]>(`/management/store/menu/${orgId()}`).then(handleResponse),
  getFundraising: () =>
    apiClient.get<any[]>(`/management/store/fundraising/${orgId()}`).then(handleResponse),
};

// ==================== TRANSPORT SMART ====================
export const transportSmartApi = {
  getRfidCards: () =>
    apiClient.get<any[]>(`/management/transport-smart/rfid-cards/${orgId()}`).then(handleResponse),
  getBusTracking: () =>
    apiClient.get<any[]>(`/management/transport-smart/bus-tracking/${orgId()}`).then(handleResponse),
  getGeofenceAlerts: () =>
    apiClient.get<any[]>(`/management/transport-smart/geofence-alerts/${orgId()}`).then(handleResponse),
  getBusRoutes: () =>
    apiClient.get<any[]>(`/management/transport-smart/bus-routes/${orgId()}`).then(handleResponse),
};

// ==================== HOSTEL MANAGEMENT (extended) ====================
export const hostelMgmtApi = {
  getMess: () =>
    apiClient.get<any[]>(`/management/hostel/mess/${orgId()}`).then(handleResponse),
  getVisitors: () =>
    apiClient.get<any[]>(`/management/hostel/visitors/${orgId()}`).then(handleResponse),
  getInventory: () =>
    apiClient.get<any[]>(`/management/hostel/inventory/${orgId()}`).then(handleResponse),
};

// ==================== BULK ====================
export const bulkApi = {
  createStudents: (students: any[]) =>
    apiClient.post<any>('/management/students/bulk', { organisation_id: orgId(), students }).then(handleResponse),
  createStaff: (staff: any[], send_welcome_email = false) =>
    apiClient.post<any>('/management/staff/bulk', { organisation_id: orgId(), staff, send_welcome_email }).then(handleResponse),
  validateStaff: (staff: any[]) =>
    apiClient.post<any>('/management/staff/validate-bulk', { organisation_id: orgId(), staff }).then(handleResponse),
  createParents: (parents: any[]) =>
    apiClient.post<any>('/management/parents/bulk', { organisation_id: orgId(), parents }).then(handleResponse),
  deleteStudents: (student_ids: string[]) =>
    apiClient.post<any>('/management/students/bulk-delete', { organisation_id: orgId(), student_ids }).then(handleResponse),
};

// ==================== PARENT-STUDENT LINKS ====================
export const parentApi = {
  getLinks: () =>
    apiClient.get<any[]>(`/management/parent-student-links/${orgId()}`).then(handleResponse),
  createLink: (data: any) =>
    apiClient.post<any>('/management/link-parent-student', { ...data, organisation_id: orgId() }).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/parents', { ...data, organisation_id: orgId() }).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.put<any>(`/management/parents/${id}`, { ...data, organisation_id: orgId() }).then(handleResponse),
  remove: (id: string) =>
    apiClient.delete<any>(`/management/parents/${id}?organisation_id=${orgId()}`).then(handleResponse),
};

// ==================== PART-TIME JOBS ====================
export const partTimeJobApi = {
  getAll: () =>
    apiClient.get<any[]>(`/management/part-time-jobs/${orgId()}`).then(handleResponse),
  create: (data: any) =>
    apiClient.post<any>('/management/part-time-jobs', data).then(handleResponse),
  update: (id: string, data: any) =>
    apiClient.patch<any>(`/management/part-time-jobs/${id}`, data).then(handleResponse),
  remove: (id: string) =>
    apiClient.delete<any>(`/management/part-time-jobs/${id}`).then(handleResponse),
  getApplications: (jobId: string) =>
    apiClient.get<any[]>(`/management/part-time-jobs/${jobId}/applications`).then(handleResponse),
  updateApplicationStatus: (appId: string, status: string) =>
    apiClient.patch<any>(`/management/part-time-job-applications/${appId}/status`, { status }).then(handleResponse),
};

// ==================== TIMETABLE V2 ====================
export const timetableApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/timetable/dashboard/${orgId()}`).then(handleResponse),

  getEntries: (params?: { class_id?: string; teacher_id?: string; day_of_week?: number; room?: string; entry_type?: string; term?: string }) => {
    const q = new URLSearchParams();
    if (params?.class_id) q.set('class_id', params.class_id);
    if (params?.teacher_id) q.set('teacher_id', params.teacher_id);
    if (params?.day_of_week != null) q.set('day_of_week', String(params.day_of_week));
    if (params?.room) q.set('room', params.room);
    if (params?.entry_type) q.set('entry_type', params.entry_type);
    if (params?.term) q.set('term', params.term);
    const qs = q.toString();
    return apiClient.get<any[]>(`/v2/timetable/entries/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getEntryById: (entryId: string) =>
    apiClient.get<any>(`/v2/timetable/entries/${orgId()}/${entryId}`).then(handleResponse),
  createEntry: (data: any) =>
    apiClient.post<any>(`/v2/timetable/entries/${orgId()}`, data).then(handleResponse),
  updateEntry: (entryId: string, data: any) =>
    apiClient.put<any>(`/v2/timetable/entries/${entryId}`, data).then(handleResponse),
  deleteEntry: (entryId: string) =>
    apiClient.delete<any>(`/v2/timetable/entries/${entryId}`).then(handleResponse),
  bulkCreate: (entries: any[]) =>
    apiClient.post<any[]>(`/v2/timetable/entries/${orgId()}/bulk`, { entries }).then(handleResponse),

  getTeachers: () =>
    apiClient.get<any[]>(`/v2/timetable/teachers/${orgId()}`).then(handleResponse),
  getClasses: () =>
    apiClient.get<any[]>(`/v2/timetable/classes/${orgId()}`).then(handleResponse),
  getSubjects: () =>
    apiClient.get<any[]>(`/v2/timetable/subjects/${orgId()}`).then(handleResponse),

  swapPeriods: (entryIdA: string, entryIdB: string) =>
    apiClient.post<any>(`/v2/timetable/swap/${orgId()}`, { entry_id_a: entryIdA, entry_id_b: entryIdB }).then(handleResponse),
  moveEntry: (entryId: string, dayOfWeek: number, startTime: string, endTime: string) =>
    apiClient.put<any>(`/v2/timetable/move/${entryId}`, { day_of_week: dayOfWeek, start_time: startTime, end_time: endTime }).then(handleResponse),
  assignSubstitute: (entryId: string, substituteTeacherId: string) =>
    apiClient.put<any>(`/v2/timetable/substitute/${entryId}`, { substitute_teacher_id: substituteTeacherId }).then(handleResponse),
  copySchedule: (fromClassId: string, toClassId: string) =>
    apiClient.post<any>(`/v2/timetable/copy/${orgId()}`, { from_class_id: fromClassId, to_class_id: toClassId }).then(handleResponse),
  duplicateWeek: (classId: string, sourceWeekStart: string, targetWeekStart: string) =>
    apiClient.post<any>(`/v2/timetable/duplicate-week/${orgId()}`, { class_id: classId, source_week_start: sourceWeekStart, target_week_start: targetWeekStart }).then(handleResponse),

  detectConflicts: (params: { teacher_id?: string; day_of_week: number; start_time: string; end_time: string; room?: string; exclude_id?: string }) => {
    const q = new URLSearchParams();
    if (params.teacher_id) q.set('teacher_id', params.teacher_id);
    q.set('day_of_week', String(params.day_of_week));
    q.set('start_time', params.start_time);
    q.set('end_time', params.end_time);
    if (params.room) q.set('room', params.room);
    if (params.exclude_id) q.set('exclude_id', params.exclude_id);
    return apiClient.get<any[]>(`/v2/timetable/conflicts/detect/${orgId()}?${q.toString()}`).then(handleResponse);
  },
  getConflicts: () =>
    apiClient.get<any[]>(`/v2/timetable/conflicts/${orgId()}`).then(handleResponse),
  resolveConflict: (conflictId: string) =>
    apiClient.put<any>(`/v2/timetable/conflicts/${conflictId}/resolve`).then(handleResponse),

  getTeacherAvailability: (teacherId?: string) =>
    apiClient.get<any[]>(`/v2/timetable/availability/${orgId()}${teacherId ? `?teacher_id=${teacherId}` : ''}`).then(handleResponse),
  setTeacherAvailability: (data: any) =>
    apiClient.post<any>(`/v2/timetable/availability/${orgId()}`, data).then(handleResponse),

  getRoomSchedule: (room?: string) =>
    apiClient.get<any[]>(`/v2/timetable/rooms/${orgId()}${room ? `?room=${encodeURIComponent(room)}` : ''}`).then(handleResponse),
  bookRoom: (data: any) =>
    apiClient.post<any>(`/v2/timetable/rooms/${orgId()}`, data).then(handleResponse),

  getTemplates: () =>
    apiClient.get<any[]>(`/v2/timetable/templates/${orgId()}`).then(handleResponse),
  saveTemplate: (data: any) =>
    apiClient.post<any>(`/v2/timetable/templates/${orgId()}`, data).then(handleResponse),
  applyTemplate: (templateId: string, classId: string) =>
    apiClient.post<any>(`/v2/timetable/templates/${orgId()}/apply`, { template_id: templateId, class_id: classId }).then(handleResponse),

  getAcademicCalendar: (year?: number) =>
    apiClient.get<any[]>(`/v2/timetable/calendar/${orgId()}${year ? `?year=${year}` : ''}`).then(handleResponse),
  createCalendarEvent: (data: any) =>
    apiClient.post<any>(`/v2/timetable/calendar/${orgId()}`, data).then(handleResponse),

  generateTimetable: (classId: string, term: string, academicYear: string) =>
    apiClient.post<any>(`/v2/timetable/generate/${orgId()}`, { class_id: classId, term, academic_year: academicYear }).then(handleResponse),

  getAnalytics: () =>
    apiClient.get<any>(`/v2/timetable/analytics/${orgId()}`).then(handleResponse),
  getAiSuggestions: () =>
    apiClient.get<any[]>(`/v2/timetable/suggestions/${orgId()}`).then(handleResponse),
};

// ==================== ATTENDANCE V2 ====================
// ==================== EXAMS V2 ====================
// ==================== LIBRARY V2 ====================
// ==================== ASSIGNMENTS V2 ====================
export const assignmentApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/assignments/dashboard/${orgId()}`).then(handleResponse),

  getAssignments: (params?: { class_id?: string; section?: string; subject_id?: string; teacher_id?: string; status?: string; assignment_type?: string; academic_year?: string; from?: string; to?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.class_id) q.set('class_id', params.class_id);
    if (params?.section) q.set('section', params.section);
    if (params?.subject_id) q.set('subject_id', params.subject_id);
    if (params?.teacher_id) q.set('teacher_id', params.teacher_id);
    if (params?.status) q.set('status', params.status);
    if (params?.assignment_type) q.set('assignment_type', params.assignment_type);
    if (params?.academic_year) q.set('academic_year', params.academic_year);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/assignments/list/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getAssignmentById: (assignmentId: string) =>
    apiClient.get<any>(`/v2/assignments/list/${orgId()}/${assignmentId}`).then(handleResponse),
  createAssignment: (data: any) =>
    apiClient.post<any>(`/v2/assignments/list/${orgId()}`, data).then(handleResponse),
  updateAssignment: (assignmentId: string, data: any) =>
    apiClient.put<any>(`/v2/assignments/list/${assignmentId}`, data).then(handleResponse),
  deleteAssignment: (assignmentId: string) =>
    apiClient.delete<any>(`/v2/assignments/list/${assignmentId}`).then(handleResponse),
  publishAssignment: (assignmentId: string) =>
    apiClient.post<any>(`/v2/assignments/list/${assignmentId}/publish`).then(handleResponse),
  closeAssignment: (assignmentId: string) =>
    apiClient.post<any>(`/v2/assignments/list/${assignmentId}/close`).then(handleResponse),
  duplicateAssignment: (assignmentId: string) =>
    apiClient.post<any>(`/v2/assignments/list/${assignmentId}/duplicate`).then(handleResponse),

  getSubmissions: (params?: { assignment_id?: string; student_id?: string; status?: string; is_late?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.assignment_id) q.set('assignment_id', params.assignment_id);
    if (params?.student_id) q.set('student_id', params.student_id);
    if (params?.status) q.set('status', params.status);
    if (params?.is_late) q.set('is_late', params.is_late);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/assignments/submissions/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  gradeSubmission: (submissionId: string, data: any) =>
    apiClient.post<any>(`/v2/assignments/submissions/${submissionId}/grade`, data).then(handleResponse),
  bulkGrade: (data: any) =>
    apiClient.post<any>(`/v2/assignments/submissions/bulk-grade/${orgId()}`, data).then(handleResponse),
  publishGrades: (assignmentId: string) =>
    apiClient.post<any>(`/v2/assignments/submissions/${assignmentId}/publish-grades`).then(handleResponse),

  getStudentPerformance: (studentId: string) =>
    apiClient.get<any>(`/v2/assignments/performance/${orgId()}/${studentId}`).then(handleResponse),

  getAnalytics: () =>
    apiClient.get<any>(`/v2/assignments/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/assignments/ai-insights/${orgId()}`).then(handleResponse),

  getRubrics: (assignmentId: string) =>
    apiClient.get<any[]>(`/v2/assignments/rubrics/${assignmentId}`).then(handleResponse),
  saveRubrics: (assignmentId: string, rubrics: any[]) =>
    apiClient.post<any>(`/v2/assignments/rubrics/${orgId()}/${assignmentId}`, { rubrics }).then(handleResponse),

  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/assignments/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  exportReport: (type?: string, format?: string) =>
    apiClient.get<any>(`/v2/assignments/reports/${orgId()}/export${type ? `?type=${type}&format=${format || 'csv'}` : ''}`).then(handleResponse),
};

export const academicAnalyticsApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/academic-analytics/dashboard/${orgId()}`).then(handleResponse),
  getStudentAnalytics: (params?: { search?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/academic-analytics/students/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getClassAnalytics: () =>
    apiClient.get<any>(`/v2/academic-analytics/classes/${orgId()}`).then(handleResponse),
  getSubjectAnalytics: () =>
    apiClient.get<any>(`/v2/academic-analytics/subjects/${orgId()}`).then(handleResponse),
  getExamAnalytics: () =>
    apiClient.get<any>(`/v2/academic-analytics/exams/${orgId()}`).then(handleResponse),
  getAttendanceAnalytics: () =>
    apiClient.get<any>(`/v2/academic-analytics/attendance/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/academic-analytics/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/academic-analytics/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  exportReport: (type?: string, format?: string) =>
    apiClient.get<any>(`/v2/academic-analytics/reports/${orgId()}/export${type ? `?type=${type}&format=${format || 'json'}` : ''}`).then(handleResponse),
};

export const aiTeachingApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/ai-teaching/dashboard/${orgId()}`).then(handleResponse),
  getAssistants: (params?: { status?: string; type?: string; subject_id?: string; teacher_id?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    if (params?.subject_id) q.set('subject_id', params.subject_id);
    if (params?.teacher_id) q.set('teacher_id', params.teacher_id);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any[]>(`/v2/ai-teaching/assistants/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createAssistant: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/assistants/${orgId()}`, data).then(handleResponse),
  updateAssistant: (id: string, data: any) =>
    apiClient.put<any>(`/v2/ai-teaching/assistants/${id}`, data).then(handleResponse),
  deleteAssistant: (id: string) =>
    apiClient.delete<any>(`/v2/ai-teaching/assistants/${id}`).then(handleResponse),

  getConversations: (params?: { user_id?: string; assistant_id?: string; from?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.user_id) q.set('user_id', params.user_id);
    if (params?.assistant_id) q.set('assistant_id', params.assistant_id);
    if (params?.from) q.set('from', params.from);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any[]>(`/v2/ai-teaching/conversations/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  sendMessage: (data: { query: string; user_id?: string; assistant_id?: string; context?: any }) =>
    apiClient.post<any>(`/v2/ai-teaching/conversations/${orgId()}`, data).then(handleResponse),

  getStudentSupport: (studentId?: string) =>
    apiClient.get<any>(`/v2/ai-teaching/student-support/${orgId()}${studentId ? `?student_id=${studentId}` : ''}`).then(handleResponse),
  getTeacherTools: (teacherId?: string) =>
    apiClient.get<any>(`/v2/ai-teaching/teacher-tools/${orgId()}${teacherId ? `?teacher_id=${teacherId}` : ''}`).then(handleResponse),

  generateLesson: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/generate/lesson/${orgId()}`, data).then(handleResponse),
  generateQuiz: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/generate/quiz/${orgId()}`, data).then(handleResponse),
  generateContent: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/generate/content/${orgId()}`, data).then(handleResponse),

  getKnowledgeBase: (params?: { search?: string; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.type) q.set('type', params.type);
    const qs = q.toString();
    return apiClient.get<any[]>(`/v2/ai-teaching/knowledge-base/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  uploadKnowledgeDoc: (data: any) =>
    apiClient.post<any>(`/v2/ai-teaching/knowledge-base/${orgId()}`, data).then(handleResponse),
  deleteKnowledgeDoc: (id: string) =>
    apiClient.delete<any>(`/v2/ai-teaching/knowledge-base/${id}`).then(handleResponse),

  getAnalytics: () =>
    apiClient.get<any>(`/v2/ai-teaching/analytics/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/ai-teaching/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
};

export const libraryApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/library/dashboard/${orgId()}`).then(handleResponse),

  getBooks: (params?: { category?: string; author?: string; publisher?: string; status?: string; search?: string; rack_number?: string; language?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.author) q.set('author', params.author);
    if (params?.publisher) q.set('publisher', params.publisher);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.rack_number) q.set('rack_number', params.rack_number);
    if (params?.language) q.set('language', params.language);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/library/books/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getBookById: (bookId: string) =>
    apiClient.get<any>(`/v2/library/books/${orgId()}/${bookId}`).then(handleResponse),
  createBook: (data: any) =>
    apiClient.post<any>(`/v2/library/books/${orgId()}`, data).then(handleResponse),
  updateBook: (bookId: string, data: any) =>
    apiClient.put<any>(`/v2/library/books/${bookId}`, data).then(handleResponse),
  deleteBook: (bookId: string) =>
    apiClient.delete<any>(`/v2/library/books/${bookId}`).then(handleResponse),

  getIssues: (params?: { status?: string; book_id?: string; member_id?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.book_id) q.set('book_id', params.book_id);
    if (params?.member_id) q.set('member_id', params.member_id);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/library/issues/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  issueBook: (data: any) =>
    apiClient.post<any>(`/v2/library/issues/${orgId()}`, data).then(handleResponse),
  returnBook: (issueId: string, data?: any) =>
    apiClient.put<any>(`/v2/library/issues/${issueId}/return`, data || {}).then(handleResponse),
  renewBook: (issueId: string, extraDays?: number) =>
    apiClient.put<any>(`/v2/library/issues/${issueId}/renew`, { extra_days: extraDays || 14 }).then(handleResponse),
  sendReminder: (issueId: string) =>
    apiClient.post<any>(`/v2/library/issues/${issueId}/reminder`).then(handleResponse),

  getMembers: (params?: { member_type?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.member_type) q.set('member_type', params.member_type);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/library/members/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getMemberById: (memberId: string) =>
    apiClient.get<any>(`/v2/library/members/${orgId()}/${memberId}`).then(handleResponse),
  createMember: (data: any) =>
    apiClient.post<any>(`/v2/library/members/${orgId()}`, data).then(handleResponse),
  updateMember: (memberId: string, data: any) =>
    apiClient.put<any>(`/v2/library/members/${memberId}`, data).then(handleResponse),
  suspendMember: (memberId: string) =>
    apiClient.post<any>(`/v2/library/members/${memberId}/suspend`).then(handleResponse),

  getFines: (params?: { status?: string; member_id?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.member_id) q.set('member_id', params.member_id);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/library/fines/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  collectFine: (fineId: string, paymentMethod?: string) =>
    apiClient.post<any>(`/v2/library/fines/${fineId}/collect`, { payment_method: paymentMethod || 'cash' }).then(handleResponse),
  waiveFine: (fineId: string) =>
    apiClient.post<any>(`/v2/library/fines/${fineId}/waive`).then(handleResponse),

  getReservations: (bookId?: string) =>
    apiClient.get<any[]>(`/v2/library/reservations/${orgId()}${bookId ? `?book_id=${bookId}` : ''}`).then(handleResponse),
  createReservation: (data: any) =>
    apiClient.post<any>(`/v2/library/reservations/${orgId()}`, data).then(handleResponse),
  fulfillReservation: (reservationId: string) =>
    apiClient.post<any>(`/v2/library/reservations/${reservationId}/fulfill`).then(handleResponse),
  cancelReservation: (reservationId: string) =>
    apiClient.post<any>(`/v2/library/reservations/${reservationId}/cancel`).then(handleResponse),

  getAnalytics: () =>
    apiClient.get<any>(`/v2/library/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/library/ai-insights/${orgId()}`).then(handleResponse),

  getInventory: (bookId?: string) =>
    apiClient.get<any[]>(`/v2/library/inventory/${orgId()}${bookId ? `?book_id=${bookId}` : ''}`).then(handleResponse),
  createInventoryRecord: (data: any) =>
    apiClient.post<any>(`/v2/library/inventory/${orgId()}`, data).then(handleResponse),
  verifyInventory: (recordId: string) =>
    apiClient.post<any>(`/v2/library/inventory/${recordId}/verify`).then(handleResponse),

  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/library/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  exportReport: (type?: string, format?: string) =>
    apiClient.get<any>(`/v2/library/reports/${orgId()}/export${type ? `?type=${type}&format=${format || 'csv'}` : ''}`).then(handleResponse),
};

export const examApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/exams/dashboard/${orgId()}`).then(handleResponse),
  getExams: (params?: { class_id?: string; section?: string; exam_type?: string; status?: string; term?: string; academic_year?: string; from?: string; to?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.class_id) q.set('class_id', params.class_id);
    if (params?.section) q.set('section', params.section);
    if (params?.exam_type) q.set('exam_type', params.exam_type);
    if (params?.status) q.set('status', params.status);
    if (params?.term) q.set('term', params.term);
    if (params?.academic_year) q.set('academic_year', params.academic_year);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/exams/list/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getExamById: (examId: string) =>
    apiClient.get<any>(`/v2/exams/list/${orgId()}/${examId}`).then(handleResponse),
  createExam: (data: any) =>
    apiClient.post<any>(`/v2/exams/list/${orgId()}`, data).then(handleResponse),
  updateExam: (examId: string, data: any) =>
    apiClient.put<any>(`/v2/exams/list/${examId}`, data).then(handleResponse),
  deleteExam: (examId: string) =>
    apiClient.delete<any>(`/v2/exams/list/${examId}`).then(handleResponse),
  updateExamStatus: (examId: string, status: string) =>
    apiClient.patch<any>(`/v2/exams/list/${examId}/status`, { status }).then(handleResponse),

  getSchedules: (examId: string) =>
    apiClient.get<any[]>(`/v2/exams/schedules/${examId}`).then(handleResponse),
  createSchedule: (data: any) =>
    apiClient.post<any>(`/v2/exams/schedules/${orgId()}`, data).then(handleResponse),
  updateSchedule: (scheduleId: string, data: any) =>
    apiClient.put<any>(`/v2/exams/schedules/${scheduleId}`, data).then(handleResponse),
  deleteSchedule: (scheduleId: string) =>
    apiClient.delete<any>(`/v2/exams/schedules/${scheduleId}`).then(handleResponse),

  getResults: (params?: { exam_id?: string; student_id?: string; subject_id?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.exam_id) q.set('exam_id', params.exam_id);
    if (params?.student_id) q.set('student_id', params.student_id);
    if (params?.subject_id) q.set('subject_id', params.subject_id);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/v2/exams/results/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  enterMarks: (data: any) =>
    apiClient.post<any>(`/v2/exams/results/${orgId()}`, data).then(handleResponse),
  bulkEnterMarks: (data: any) =>
    apiClient.post<any>(`/v2/exams/results/bulk/${orgId()}`, data).then(handleResponse),
  publishResults: (examId: string) =>
    apiClient.post<any>(`/v2/exams/results/${examId}/publish`).then(handleResponse),
  lockResults: (examId: string) =>
    apiClient.post<any>(`/v2/exams/results/${examId}/lock`).then(handleResponse),
  unlockResults: (examId: string) =>
    apiClient.post<any>(`/v2/exams/results/${examId}/unlock`).then(handleResponse),

  getStudentPerformance: (studentId: string) =>
    apiClient.get<any>(`/v2/exams/performance/${orgId()}/${studentId}`).then(handleResponse),

  getAnalytics: () =>
    apiClient.get<any>(`/v2/exams/analytics/${orgId()}`).then(handleResponse),

  getAiInsights: () =>
    apiClient.get<any>(`/v2/exams/ai-insights/${orgId()}`).then(handleResponse),
  getReadinessScores: () =>
    apiClient.get<any>(`/v2/exams/readiness/${orgId()}`).then(handleResponse),

  getInvigilators: () =>
    apiClient.get<any[]>(`/v2/exams/invigilators/${orgId()}`).then(handleResponse),
  getGradeDefinitions: () =>
    apiClient.get<any[]>(`/v2/exams/grade-definitions/${orgId()}`).then(handleResponse),
  saveGradeDefinitions: (data: any) =>
    apiClient.post<any>(`/v2/exams/grade-definitions/${orgId()}`, data).then(handleResponse),
};

export const attendanceApiV2 = {
  getDashboard: (date?: string) =>
    apiClient.get<any>(`/v2/attendance/dashboard/${orgId()}${date ? `?date=${date}` : ''}`).then(handleResponse),
  getStudents: (params?: { class_id?: string; section?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.class_id) q.set('class_id', params.class_id);
    if (params?.section) q.set('section', params.section);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any[]>(`/v2/attendance/students/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getRecords: (params?: {
    class_id?: string; section?: string; subject_id?: string; teacher_id?: string;
    date?: string; from?: string; to?: string; status?: string; session?: string;
    student_id?: string; search?: string; page?: number; limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.class_id) q.set('class_id', params.class_id);
    if (params?.section) q.set('section', params.section);
    if (params?.subject_id) q.set('subject_id', params.subject_id);
    if (params?.teacher_id) q.set('teacher_id', params.teacher_id);
    if (params?.date) q.set('date', params.date);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.status) q.set('status', params.status);
    if (params?.session) q.set('session', params.session);
    if (params?.student_id) q.set('student_id', params.student_id);
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return apiClient.get<any>(`/v2/attendance/records/${orgId()}?${q.toString()}`).then(handleResponse);
  },
  markAttendance: (data: any) =>
    apiClient.post<any>(`/v2/attendance/mark/${orgId()}`, data).then(handleResponse),
  bulkMark: (data: any) =>
    apiClient.post<any[]>(`/v2/attendance/bulk/${orgId()}`, data).then(handleResponse),
  getDailySummary: (date?: string) =>
    apiClient.get<any>(`/v2/attendance/daily/${orgId()}${date ? `?date=${date}` : ''}`).then(handleResponse),
  getStudentHistory: (studentId: string, limit?: number) =>
    apiClient.get<any>(`/v2/attendance/history/${studentId}${limit ? `?limit=${limit}` : ''}`).then(handleResponse),
  getAnalytics: (params?: { from?: string; to?: string; class_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.class_id) q.set('class_id', params.class_id);
    return apiClient.get<any>(`/v2/attendance/analytics/${orgId()}?${q.toString()}`).then(handleResponse);
  },
  getRiskFlags: (riskLevel?: string) =>
    apiClient.get<any[]>(`/v2/attendance/risk-flags/${orgId()}${riskLevel ? `?risk_level=${riskLevel}` : ''}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/attendance/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (params?: { type?: string; from?: string; to?: string; class_id?: string; student_id?: string; teacher_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.class_id) q.set('class_id', params.class_id);
    if (params?.student_id) q.set('student_id', params.student_id);
    if (params?.teacher_id) q.set('teacher_id', params.teacher_id);
    return apiClient.get<any>(`/v2/attendance/reports/${orgId()}?${q.toString()}`).then(handleResponse);
  },
  getWeeklyReport: (date?: string) =>
    apiClient.get<any>(`/v2/attendance/reports/weekly/${orgId()}${date ? `?date=${date}` : ''}`).then(handleResponse),
  getMonthlyReport: (date?: string) =>
    apiClient.get<any>(`/v2/attendance/reports/monthly/${orgId()}${date ? `?date=${date}` : ''}`).then(handleResponse),
  getSettings: () =>
    apiClient.get<any>(`/v2/attendance/settings/${orgId()}`).then(handleResponse),
  saveSettings: (data: any) =>
    apiClient.post<any>(`/v2/attendance/settings/${orgId()}`, data).then(handleResponse),
  getAutomationLogs: (params?: { type?: string; student_id?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.student_id) q.set('student_id', params.student_id);
    if (params?.status) q.set('status', params.status);
    return apiClient.get<any[]>(`/v2/attendance/automation/${orgId()}?${q.toString()}`).then(handleResponse);
  },
  createAutomationLog: (data: any) =>
    apiClient.post<any>(`/v2/attendance/automation/${orgId()}`, data).then(handleResponse),
  getNotifications: () =>
    apiClient.get<any[]>(`/v2/attendance/notifications/${orgId()}`).then(handleResponse),
  sendNotification: (data: any) =>
    apiClient.post<any>(`/v2/attendance/notifications/${orgId()}`, data).then(handleResponse),
  importAttendance: (data: any) =>
    apiClient.post<any>(`/v2/attendance/import/${orgId()}`, data).then(handleResponse),
};

export const accountsApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/accounts/dashboard/${orgId()}`).then(handleResponse),
  getChartOfAccounts: () =>
    apiClient.get<any>(`/v2/accounts/chart-of-accounts/${orgId()}`).then(handleResponse),
  createAccount: (data: any) =>
    apiClient.post<any>(`/v2/accounts/chart-of-accounts/${orgId()}`, data).then(handleResponse),
  updateAccount: (id: string, data: any) =>
    apiClient.put<any>(`/v2/accounts/chart-of-accounts/${id}`, data).then(handleResponse),
  deleteAccount: (id: string) =>
    apiClient.delete<any>(`/v2/accounts/chart-of-accounts/${id}`).then(handleResponse),
  getLedgers: () =>
    apiClient.get<any>(`/v2/accounts/ledgers/${orgId()}`).then(handleResponse),
  getJournalEntries: (params?: { status?: string; from_date?: string; to_date?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.from_date) q.set('from_date', params.from_date);
    if (params?.to_date) q.set('to_date', params.to_date);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/accounts/journal-entries/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createJournalEntry: (data: any) =>
    apiClient.post<any>(`/v2/accounts/journal-entries/${orgId()}`, data).then(handleResponse),
  updateJournalEntry: (id: string, data: any) =>
    apiClient.put<any>(`/v2/accounts/journal-entries/${id}`, data).then(handleResponse),
  approveJournalEntry: (id: string) =>
    apiClient.post<any>(`/v2/accounts/journal-entries/${id}/approve`).then(handleResponse),
  reverseJournalEntry: (id: string) =>
    apiClient.post<any>(`/v2/accounts/journal-entries/${id}/reverse`).then(handleResponse),
  getTransactions: (params?: { type?: string; category?: string; status?: string; from_date?: string; to_date?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    if (params?.from_date) q.set('from_date', params.from_date);
    if (params?.to_date) q.set('to_date', params.to_date);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/accounts/transactions/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createTransaction: (data: any) =>
    apiClient.post<any>(`/v2/accounts/transactions/${orgId()}`, data).then(handleResponse),
  getAssets: () =>
    apiClient.get<any>(`/v2/accounts/assets/${orgId()}`).then(handleResponse),
  createAsset: (data: any) =>
    apiClient.post<any>(`/v2/accounts/assets/${orgId()}`, data).then(handleResponse),
  updateAssetValue: (id: string, data: any) =>
    apiClient.put<any>(`/v2/accounts/assets/${id}`, data).then(handleResponse),
  createLiability: (data: any) =>
    apiClient.post<any>(`/v2/accounts/liabilities/${orgId()}`, data).then(handleResponse),
  getBudgets: () =>
    apiClient.get<any>(`/v2/accounts/budgets/${orgId()}`).then(handleResponse),
  createBudget: (data: any) =>
    apiClient.post<any>(`/v2/accounts/budgets/${orgId()}`, data).then(handleResponse),
  updateBudget: (id: string, data: any) =>
    apiClient.put<any>(`/v2/accounts/budgets/${id}`, data).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/accounts/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/accounts/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/accounts/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/accounts/sidebar/${orgId()}`).then(handleResponse),
};

export const feeManagementApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/fee-management/dashboard/${orgId()}`).then(handleResponse),
  getFeeStructures: () =>
    apiClient.get<any>(`/v2/fee-management/structures/${orgId()}`).then(handleResponse),
  createFeeStructure: (data: any) =>
    apiClient.post<any>(`/v2/fee-management/structures/${orgId()}`, data).then(handleResponse),
  updateFeeStructure: (id: string, data: any) =>
    apiClient.put<any>(`/v2/fee-management/structures/${id}`, data).then(handleResponse),
  deleteFeeStructure: (id: string) =>
    apiClient.delete<any>(`/v2/fee-management/structures/${id}`).then(handleResponse),
  getStudentFees: (params?: { search?: string; status?: string; class?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.class) q.set('class', params.class);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/fee-management/student-fees/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  collectPayment: (data: any) =>
    apiClient.post<any>(`/v2/fee-management/payments/${orgId()}`, data).then(handleResponse),
  getTransactions: (limit?: number) =>
    apiClient.get<any>(`/v2/fee-management/transactions/${orgId()}${limit ? `?limit=${limit}` : ''}`).then(handleResponse),
  getInvoices: (status?: string) =>
    apiClient.get<any>(`/v2/fee-management/invoices/${orgId()}${status ? `?status=${status}` : ''}`).then(handleResponse),
  createInvoice: (data: any) =>
    apiClient.post<any>(`/v2/fee-management/invoices/${orgId()}`, data).then(handleResponse),
  getScholarships: () =>
    apiClient.get<any>(`/v2/fee-management/scholarships/${orgId()}`).then(handleResponse),
  approveScholarship: (id: string) =>
    apiClient.post<any>(`/v2/fee-management/scholarships/${id}/approve`).then(handleResponse),
  getFinancialAnalytics: () =>
    apiClient.get<any>(`/v2/fee-management/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/fee-management/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/fee-management/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/fee-management/sidebar/${orgId()}`).then(handleResponse),
};

export const scholarshipApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/scholarship/dashboard/${orgId()}`).then(handleResponse),
  getPrograms: () =>
    apiClient.get<any>(`/v2/scholarship/programs/${orgId()}`).then(handleResponse),
  createProgram: (data: any) =>
    apiClient.post<any>(`/v2/scholarship/programs/${orgId()}`, data).then(handleResponse),
  updateProgram: (id: string, data: any) =>
    apiClient.put<any>(`/v2/scholarship/programs/${id}`, data).then(handleResponse),
  deleteProgram: (id: string) =>
    apiClient.delete<any>(`/v2/scholarship/programs/${id}`).then(handleResponse),
  getApplications: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/scholarship/applications/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  createApplication: (data: any) =>
    apiClient.post<any>(`/v2/scholarship/applications/${orgId()}`, data).then(handleResponse),
  updateApplicationStatus: (id: string, status: string) =>
    apiClient.put<any>(`/v2/scholarship/applications/${id}/status`, { status }).then(handleResponse),
  getBeneficiaries: () =>
    apiClient.get<any>(`/v2/scholarship/beneficiaries/${orgId()}`).then(handleResponse),
  getAiEligibility: () =>
    apiClient.get<any>(`/v2/scholarship/ai-eligibility/${orgId()}`).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/scholarship/analytics/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/scholarship/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/scholarship/sidebar/${orgId()}`).then(handleResponse),
};

export const rolesApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/roles/dashboard/${orgId()}`).then(handleResponse),
  getRoles: () =>
    apiClient.get<any>(`/v2/roles/roles/${orgId()}`).then(handleResponse),
  createRole: (data: any) =>
    apiClient.post<any>(`/v2/roles/roles/${orgId()}`, data).then(handleResponse),
  updateRole: (id: string, data: any) =>
    apiClient.put<any>(`/v2/roles/roles/${id}`, data).then(handleResponse),
  deleteRole: (id: string) =>
    apiClient.delete<any>(`/v2/roles/roles/${id}`).then(handleResponse),
  assignPermissions: (id: string, data: any) =>
    apiClient.post<any>(`/v2/roles/roles/${id}/permissions`, data).then(handleResponse),
  getPermissions: () =>
    apiClient.get<any>(`/v2/roles/permissions/${orgId()}`).then(handleResponse),
  getUsers: (params?: { search?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.role) q.set('role', params.role);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/roles/users/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  updateUserRole: (userId: string, data: any) =>
    apiClient.put<any>(`/v2/roles/users/${userId}/role`, data).then(handleResponse),
  getAuditLogs: () =>
    apiClient.get<any>(`/v2/roles/audit-logs/${orgId()}`).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/roles/analytics/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/roles/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/roles/sidebar/${orgId()}`).then(handleResponse),
};

export const credentialsApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/credentials/dashboard/${orgId()}`).then(handleResponse),
  getCertificates: () =>
    apiClient.get<any>(`/v2/credentials/certificates/${orgId()}`).then(handleResponse),
  createCertificate: (data: any) =>
    apiClient.post<any>(`/v2/credentials/certificates/${orgId()}`, data).then(handleResponse),
  updateCertificate: (id: string, data: any) =>
    apiClient.put<any>(`/v2/credentials/certificates/${id}`, data).then(handleResponse),
  deleteCertificate: (id: string) =>
    apiClient.delete<any>(`/v2/credentials/certificates/${id}`).then(handleResponse),
  getCredentials: () =>
    apiClient.get<any>(`/v2/credentials/credentials/${orgId()}`).then(handleResponse),
  createCredential: (data: any) =>
    apiClient.post<any>(`/v2/credentials/credentials/${orgId()}`, data).then(handleResponse),
  getTranscripts: () =>
    apiClient.get<any>(`/v2/credentials/transcripts/${orgId()}`).then(handleResponse),
  createTranscript: (data: any) =>
    apiClient.post<any>(`/v2/credentials/transcripts/${orgId()}`, data).then(handleResponse),
  getBadges: () =>
    apiClient.get<any>(`/v2/credentials/badges/${orgId()}`).then(handleResponse),
  createBadge: (data: any) =>
    apiClient.post<any>(`/v2/credentials/badges/${orgId()}`, data).then(handleResponse),
  verifyCertificate: (hash: string) =>
    apiClient.get<any>(`/v2/credentials/verify/${hash}`).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/credentials/analytics/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/credentials/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/credentials/sidebar/${orgId()}`).then(handleResponse),
};

export const predictiveAiApiV2 = {
  getDashboard: () =>
    apiClient.get<any>(`/v2/predictive-ai/dashboard/${orgId()}`).then(handleResponse),
  getRiskAnalysis: () =>
    apiClient.get<any>(`/v2/predictive-ai/risk-analysis/${orgId()}`).then(handleResponse),
  getStudentPredictions: (params?: { search?: string; class?: string; risk?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.class) q.set('class', params.class);
    if (params?.risk) q.set('risk', params.risk);
    const qs = q.toString();
    return apiClient.get<any>(`/v2/predictive-ai/student-predictions/${orgId()}${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getAttendanceForecast: () =>
    apiClient.get<any>(`/v2/predictive-ai/attendance-forecast/${orgId()}`).then(handleResponse),
  getAcademicForecast: () =>
    apiClient.get<any>(`/v2/predictive-ai/academic-forecast/${orgId()}`).then(handleResponse),
  getDropoutPrediction: () =>
    apiClient.get<any>(`/v2/predictive-ai/dropout-prediction/${orgId()}`).then(handleResponse),
  getInterventions: () =>
    apiClient.get<any>(`/v2/predictive-ai/interventions/${orgId()}`).then(handleResponse),
  createIntervention: (data: any) =>
    apiClient.post<any>(`/v2/predictive-ai/interventions/${orgId()}`, data).then(handleResponse),
  getAnalytics: () =>
    apiClient.get<any>(`/v2/predictive-ai/analytics/${orgId()}`).then(handleResponse),
  getAiInsights: () =>
    apiClient.get<any>(`/v2/predictive-ai/ai-insights/${orgId()}`).then(handleResponse),
  getReports: (type?: string) =>
    apiClient.get<any>(`/v2/predictive-ai/reports/${orgId()}${type ? `?type=${type}` : ''}`).then(handleResponse),
  getSidebar: () =>
    apiClient.get<any>(`/v2/predictive-ai/sidebar/${orgId()}`).then(handleResponse),
};

// ==================== ACADEMIC MANAGEMENT (V4) ====================
export const academicMgmtApi = {
  // Academic Years
  getAcademicYears: () =>
    apiClient.get<any[]>(`/v4/academic/academic-years/${orgId()}`).then(handleResponse),
  getAcademicYear: (id: string) =>
    apiClient.get<any>(`/v4/academic/academic-years/${orgId()}/${id}`).then(handleResponse),
  createAcademicYear: (data: any) =>
    apiClient.post<any>(`/v4/academic/academic-years/${orgId()}`, data).then(handleResponse),
  updateAcademicYear: (id: string, data: any) =>
    apiClient.put<any>(`/v4/academic/academic-years/${orgId()}/${id}`, data).then(handleResponse),
  deleteAcademicYear: (id: string) =>
    apiClient.delete(`/v4/academic/academic-years/${orgId()}/${id}`).then(handleResponse),
  setActiveAcademicYear: (id: string) =>
    apiClient.patch<any>(`/v4/academic/academic-years/${orgId()}/${id}/set-active`).then(handleResponse),

  // Sections
  getSections: () =>
    apiClient.get<any[]>(`/v4/academic/sections/${orgId()}`).then(handleResponse),
  getSection: (id: string) =>
    apiClient.get<any>(`/v4/academic/sections/${orgId()}/${id}`).then(handleResponse),
  createSection: (data: any) =>
    apiClient.post<any>(`/v4/academic/sections/${orgId()}`, data).then(handleResponse),
  updateSection: (id: string, data: any) =>
    apiClient.put<any>(`/v4/academic/sections/${orgId()}/${id}`, data).then(handleResponse),
  deleteSection: (id: string) =>
    apiClient.delete(`/v4/academic/sections/${orgId()}/${id}`).then(handleResponse),

  // Class-Subject Assignments
  getClassSubjects: () =>
    apiClient.get<any[]>(`/v4/academic/class-subjects/${orgId()}`).then(handleResponse),
  getClassSubject: (id: string) =>
    apiClient.get<any>(`/v4/academic/class-subjects/${orgId()}/${id}`).then(handleResponse),
  createClassSubject: (data: any) =>
    apiClient.post<any>(`/v4/academic/class-subjects/${orgId()}`, data).then(handleResponse),
  updateClassSubject: (id: string, data: any) =>
    apiClient.put<any>(`/v4/academic/class-subjects/${orgId()}/${id}`, data).then(handleResponse),
  deleteClassSubject: (id: string) =>
    apiClient.delete(`/v4/academic/class-subjects/${orgId()}/${id}`).then(handleResponse),

  // Teacher Assignments
  getTeacherAssignments: () =>
    apiClient.get<any[]>(`/v4/academic/teacher-assignments/${orgId()}`).then(handleResponse),
  getTeacherAssignment: (id: string) =>
    apiClient.get<any>(`/v4/academic/teacher-assignments/${orgId()}/${id}`).then(handleResponse),
  createTeacherAssignment: (data: any) =>
    apiClient.post<any>(`/v4/academic/teacher-assignments/${orgId()}`, data).then(handleResponse),
  updateTeacherAssignment: (id: string, data: any) =>
    apiClient.put<any>(`/v4/academic/teacher-assignments/${orgId()}/${id}`, data).then(handleResponse),
  deleteTeacherAssignment: (id: string) =>
    apiClient.delete(`/v4/academic/teacher-assignments/${orgId()}/${id}`).then(handleResponse),

  // Class Teacher
  getClassTeachers: () =>
    apiClient.get<any[]>(`/v4/academic/class-teachers/${orgId()}`).then(handleResponse),
  assignClassTeacher: (data: any) =>
    apiClient.post<any>(`/v4/academic/class-teachers/${orgId()}`, data).then(handleResponse),
  removeClassTeacher: (classId: string) =>
    apiClient.delete(`/v4/academic/class-teachers/${orgId()}/${classId}`).then(handleResponse),

  // Enrollments
  getEnrollments: () =>
    apiClient.get<any[]>(`/v4/academic/enrollments/${orgId()}`).then(handleResponse),
  getClassEnrollments: (classId: string) =>
    apiClient.get<any[]>(`/v4/academic/enrollments/${orgId()}/class/${classId}`).then(handleResponse),
  enrollStudent: (data: any) =>
    apiClient.post<any>(`/v4/academic/enrollments/${orgId()}`, data).then(handleResponse),
  enrollStudentsBulk: (data: any) =>
    apiClient.post<any>(`/v4/academic/enrollments/${orgId()}/bulk`, data).then(handleResponse),
  removeEnrollment: (classId: string, studentId: string) =>
    apiClient.delete(`/v4/academic/enrollments/${orgId()}/${classId}/${studentId}`).then(handleResponse),
};

// ==================== TEACHER WORKFORCE MANAGEMENT (V4) ====================
export const teacherWorkforceApi = {
  getAssignments: (tid: string) =>
    apiClient.get<any[]>(`/management/teacher-assignments/${tid}`).then(handleResponse),
  createAssignment: (data: any) =>
    apiClient.post<any>('/management/teacher-assignments', { ...data, organisation_id: orgId() }).then(handleResponse),
  deleteAssignment: (id: string) =>
    apiClient.delete<any>(`/management/teacher-assignments/${id}`).then(handleResponse),
};

// ==================== HOMEWORK (V4) ====================
export const homeworkApiV4 = {
  list: () => apiClient.get<any[]>(`/v4/homework/${orgId()}`).then(handleResponse),
  get: (id: string) => apiClient.get<any>(`/v4/homework/${orgId()}/${id}`).then(handleResponse),
  create: (data: any) => apiClient.post<any>(`/v4/homework/${orgId()}`, data).then(handleResponse),
  update: (id: string, data: any) => apiClient.put<any>(`/v4/homework/${orgId()}/${id}`, data).then(handleResponse),
  delete: (id: string) => apiClient.delete(`/v4/homework/${orgId()}/${id}`).then(handleResponse),
  getSubmissions: (homeworkId: string) => apiClient.get<any[]>(`/v4/homework/${orgId()}/${homeworkId}/submissions`).then(handleResponse),
  submit: (data: any) => apiClient.post<any>(`/v4/homework/${orgId()}/submit`, data).then(handleResponse),
  grade: (submissionId: string, data: any) => apiClient.put<any>(`/v4/homework/${orgId()}/grade/${submissionId}`, data).then(handleResponse),
  getPerformance: () => apiClient.get<any>(`/v4/homework/${orgId()}/performance`).then(handleResponse),
};

// ==================== PROMOTION (V4) ====================
export const promotionApiV4 = {
  getHistory: () => apiClient.get<any[]>(`/v4/promotion/history/${orgId()}`).then(handleResponse),
  promoteStudents: (data: any) => apiClient.post<any>(`/v4/promotion/promote/${orgId()}`, data).then(handleResponse),
  getReport: () => apiClient.get<any>(`/v4/promotion/report/${orgId()}`).then(handleResponse),
};

// ==================== DISCIPLINE (V4) ====================
export const disciplineApiV4 = {
  getIncidents: (params?: any) => {
    const clean: Record<string, string> = {};
    Object.entries(params || {}).forEach(([k, v]: [string, any]) => {
      if (v !== undefined && v !== null && v !== '') clean[k] = String(v);
    });
    const query = new URLSearchParams(clean).toString();
    return apiClient.get<any[]>(`/v4/discipline/list/${orgId()}${query ? `?${query}` : ''}`).then(handleResponse);
  },
  getIncident: (id: string) =>
    apiClient.get<any>(`/v4/discipline/${orgId()}/${id}`).then(handleResponse),
  createIncident: (data: any) =>
    apiClient.post<any>(`/v4/discipline/create/${orgId()}`, data).then(handleResponse),
  uploadEvidence: (file: string) =>
    apiClient.post<any>(`/v4/discipline/upload-evidence/${orgId()}`, { file }).then(handleResponse),
  updateIncident: (id: string, data: any) =>
    apiClient.put<any>(`/v4/discipline/update/${orgId()}/${id}`, data).then(handleResponse),
  deleteIncident: (id: string) =>
    apiClient.delete<any>(`/v4/discipline/delete/${orgId()}/${id}`).then(handleResponse),
  getDashboard: () =>
    apiClient.get<any>(`/v4/discipline/dashboard/${orgId()}`).then(handleResponse),
};

// ==================== MARKS / RESULTS (V4) ====================
export const marksApiV4 = {
  getExamResults: (examId: string) => apiClient.get<any[]>(`/v4/marks/exam/${examId}`).then(handleResponse),
  enterMarks: (data: any) => apiClient.post<any>(`/v4/marks/enter/${orgId()}`, data).then(handleResponse),
  publishResults: (examId: string) => apiClient.patch<any>(`/v4/marks/publish/${examId}`).then(handleResponse),
  getStudentPerformance: (studentId: string) => apiClient.get<any>(`/v4/marks/student/${orgId()}/${studentId}`).then(handleResponse),
  getClassPerformance: (classId: string) => apiClient.get<any>(`/v4/marks/class/${orgId()}/${classId}`).then(handleResponse),
  getGradeSummary: () => apiClient.get<any>(`/v4/marks/summary/${orgId()}`).then(handleResponse),
};

// ==================== COMMUNICATION (V4) ====================
export const communicationApiV4 = {
  sendNotification: (data: any) => apiClient.post<any>(`/v4/communication/notify/${orgId()}`, data).then(handleResponse),
  notifyRole: (data: any) => apiClient.post<any>(`/v4/communication/notify-role/${orgId()}`, data).then(handleResponse),
  sendAnnouncement: (data: any) => apiClient.post<any>(`/v4/communication/announce/${orgId()}`, data).then(handleResponse),
  getLogs: () => apiClient.get<any[]>(`/v4/communication/logs/${orgId()}`).then(handleResponse),
  getStats: () => apiClient.get<any>(`/v4/communication/stats/${orgId()}`).then(handleResponse),
  getPending: () => apiClient.get<any[]>(`/v4/communication/pending/${orgId()}`).then(handleResponse),
};

// ==================== EXPORT (V4 — CSV Downloads) ====================
async function downloadCSV(endpoint: string, filename: string) {
  const token = auth.getToken() || '';
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api';
  const res = await fetch(`${base}${endpoint}/${orgId()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export const exportApiV4 = {
  academicYears: () => downloadCSV('/v4/export/academic-years', 'academic-years'),
  sections: () => downloadCSV('/v4/export/sections', 'sections'),
  students: () => downloadCSV('/v4/export/students', 'students'),
  staff: () => downloadCSV('/v4/export/staff', 'staff'),
  homework: () => downloadCSV('/v4/export/homework', 'homework'),
  enrollments: () => downloadCSV('/v4/export/enrollments', 'enrollments'),
  promotions: () => downloadCSV('/v4/export/promotions', 'promotions'),
  communicationLogs: () => downloadCSV('/v4/export/communication-logs', 'communication-logs'),
  teacherAssignments: () => downloadCSV('/v4/export/teacher-assignments', 'teacher-assignments'),
};

// ==================== VALIDATION AUDIT (V4) ====================
export const auditApiV4 = {
  runAll: () => apiClient.get<any>(`/v4/audit/${orgId()}`).then(handleResponse),
};

// ==================== CREDENTIAL MANAGEMENT (Password Mgmt) ====================
export const credentialMgmtApi = {
  list: () =>
    apiClient.get<any[]>(`/management/credentials/list/${orgId()}`).then(handleResponse),
  regeneratePassword: (userId: string) =>
    apiClient.post<any>('/management/credentials/regenerate-password', { organisation_id: orgId(), user_id: userId }).then(handleResponse),
  bulkEmail: (userIds: string[]) =>
    apiClient.post<any>('/management/credentials/bulk-email', { organisation_id: orgId(), user_ids: userIds }).then(handleResponse),
  bulkRegenerate: (userIds: string[]) =>
    apiClient.post<any>('/management/credentials/bulk-regenerate', { organisation_id: orgId(), user_ids: userIds }).then(handleResponse),
};

// ==================== STAFF ATTENDANCE MANAGEMENT ====================
export const staffAttendanceApi = {
  getAll: (date: string) =>
    apiClient.get<any[]>(`/wos/staff-attendance?date=${date}`).then(handleResponse),
  getForStaff: (staffId: string, month: string) =>
    apiClient.get<any[]>(`/wos/staff-attendance/${staffId}?month=${month}`).then(handleResponse),
  save: (date: string, records: any[]) =>
    apiClient.post<any>('/wos/staff-attendance', { date, records }).then(handleResponse),
  updateRecord: (id: string, data: any) =>
    apiClient.put<any>(`/wos/staff-attendance/${id}`, data).then(handleResponse),
  deleteRecord: (id: string) =>
    apiClient.delete<any>(`/wos/staff-attendance/${id}`).then(handleResponse),
  getMonthly: (month: string) =>
    apiClient.get<any>(`/wos/staff-attendance/monthly?month=${month}`).then(handleResponse),
  getDashboardAnalytics: (days: number = 14) =>
    apiClient.get<any>(`/wos/staff-dashboard-analytics?days=${days}`).then(handleResponse),
};

// ==================== ENTERPRISE STAFF MANAGEMENT (Workforce) ====================
export const enterpriseStaffApi = {
  getStaffDirectory: () =>
    apiClient.get<any>(`/workforce/staff-directory/${orgId()}`).then(handleResponse),
  getStaffStats: () =>
    apiClient.get<any>(`/workforce/staff-stats/${orgId()}`).then(handleResponse),
  addStaff: (data: any) =>
    apiClient.post<any>('/workforce/staff', { ...data, organisation_id: orgId() }).then(handleResponse),
  importStaff: (data: any) =>
    apiClient.post<any>('/workforce/staff/import', { ...data, organisation_id: orgId() }).then(handleResponse),
  assignRole: (data: any) =>
    apiClient.put<any>('/workforce/staff/assign-role', data).then(handleResponse),
  assignDepartment: (data: any) =>
    apiClient.put<any>('/workforce/staff/assign-department', data).then(handleResponse),
  assignClasses: (data: any) =>
    apiClient.post<any>('/workforce/staff/assign-classes', data).then(handleResponse),
  assignSubjects: (data: any) =>
    apiClient.post<any>('/workforce/staff/assign-subjects', data).then(handleResponse),

  // Departments
  getDepartments: () =>
    apiClient.get<any>(`/workforce/departments/${orgId()}`).then(handleResponse),
  getDepartment: (deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId()}/${deptId}`).then(handleResponse),
  createDepartment: (data: any) =>
    apiClient.post<any>('/workforce/departments', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateDepartment: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/departments/${id}`, data).then(handleResponse),
  getDepartmentMembers: (deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId()}/${deptId}/members`).then(handleResponse),
  getDepartmentAttendance: (deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId()}/${deptId}/attendance`).then(handleResponse),
  getDepartmentTasks: (deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId()}/${deptId}/tasks`).then(handleResponse),
  getDepartmentPerformance: (deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId()}/${deptId}/performance`).then(handleResponse),

  // Designations
  getDesignations: () =>
    apiClient.get<any>(`/workforce/designations/${orgId()}`).then(handleResponse),
  createDesignation: (data: any) =>
    apiClient.post<any>('/workforce/designations', { ...data, organisation_id: orgId() }).then(handleResponse),

  // Staff Attendance (Enterprise)
  getStaffAttendance: (filters?: any) =>
    apiClient.post<any>(`/workforce/staff-attendance/${orgId()}`, filters || {}).then(handleResponse),
  markStaffAttendance: (data: any) =>
    apiClient.post<any>('/workforce/staff-attendance/mark', { ...data, organisation_id: orgId() }).then(handleResponse),
  bulkStaffAttendance: (data: any) =>
    apiClient.post<any>('/workforce/staff-attendance/bulk', { ...data, organisation_id: orgId() }).then(handleResponse),
  approveAttendance: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/staff-attendance/approve/${id}`, data).then(handleResponse),
  attendanceCorrections: () =>
    apiClient.get<any>(`/workforce/staff-attendance/corrections/${orgId()}`).then(handleResponse),
  attendanceHeatmap: (year: number, month: number) =>
    apiClient.get<any>(`/workforce/staff-attendance/heatmap/${orgId()}/${year}/${month}`).then(handleResponse),
  attendanceAnalytics: () =>
    apiClient.get<any>(`/workforce/staff-attendance/analytics/${orgId()}`).then(handleResponse),

  // Work Assignments
  getWorkAssignments: () =>
    apiClient.get<any>(`/workforce/work-assignments/${orgId()}`).then(handleResponse),
  createWorkAssignment: (data: any) =>
    apiClient.post<any>('/workforce/work-assignments', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateWorkAssignment: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/work-assignments/${id}`, data).then(handleResponse),
  deleteWorkAssignment: (id: string) =>
    apiClient.delete<any>(`/workforce/work-assignments/${id}`).then(handleResponse),
  getWorkloadDistribution: () =>
    apiClient.get<any>(`/workforce/workload-distribution/${orgId()}`).then(handleResponse),

  // Academic Assignments
  getAcademicAssignments: () =>
    apiClient.get<any>(`/workforce/academic-assignments/${orgId()}`).then(handleResponse),
  createAcademicAssignment: (data: any) =>
    apiClient.post<any>('/workforce/academic-assignments', { ...data, organisation_id: orgId() }).then(handleResponse),

  // Performance Management
  getPerformanceManagement: () =>
    apiClient.get<any>(`/workforce/performance/${orgId()}`).then(handleResponse),
  getStaffPerformance: (staffId: string) =>
    apiClient.get<any>(`/workforce/performance/${orgId()}/${staffId}`).then(handleResponse),
  updatePerformance: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/performance/${id}`, data).then(handleResponse),

  // Leave Management
  getLeaveManagement: () =>
    apiClient.get<any>(`/workforce/leaves/${orgId()}`).then(handleResponse),
  getStaffLeaves: (staffId: string) =>
    apiClient.get<any>(`/workforce/leaves/${orgId()}/${staffId}`).then(handleResponse),
  applyLeave: (data: any) =>
    apiClient.post<any>('/workforce/leaves', { ...data, organisation_id: orgId() }).then(handleResponse),
  approveLeave: (id: string) =>
    apiClient.put<any>(`/workforce/leaves/approve/${id}`, {}).then(handleResponse),
  rejectLeave: (id: string, reason?: string) =>
    apiClient.put<any>(`/workforce/leaves/reject/${id}`, { reason }).then(handleResponse),
  getLeaveBalance: (staffId: string) =>
    apiClient.get<any>(`/workforce/leaves/balance/${orgId()}/${staffId}`).then(handleResponse),
  getLeaveAnalytics: () =>
    apiClient.get<any>(`/workforce/leaves/analytics/${orgId()}`).then(handleResponse),

  // Training & Certifications
  getTrainingPrograms: () =>
    apiClient.get<any>(`/workforce/training/${orgId()}`).then(handleResponse),
  createTrainingProgram: (data: any) =>
    apiClient.post<any>('/workforce/training', { ...data, organisation_id: orgId() }).then(handleResponse),
  getCertifications: () =>
    apiClient.get<any>(`/workforce/certifications/${orgId()}`).then(handleResponse),
  updateCertification: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/certifications/${id}`, data).then(handleResponse),

  // Documents
  getStaffDocuments: () =>
    apiClient.get<any>(`/workforce/documents/${orgId()}`).then(handleResponse),
  uploadDocument: (data: any) =>
    apiClient.post<any>('/workforce/documents', { ...data, organisation_id: orgId() }).then(handleResponse),
  verifyDocument: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/documents/verify/${id}`, data).then(handleResponse),

  // Payroll
  getPayrollOverview: () =>
    apiClient.get<any>(`/workforce/payroll/${orgId()}`).then(handleResponse),
  getStaffPayroll: (staffId: string) =>
    apiClient.get<any>(`/workforce/payroll/${orgId()}/${staffId}`).then(handleResponse),
  getPayslips: () =>
    apiClient.get<any>(`/workforce/payroll/payslips/${orgId()}`).then(handleResponse),

  // Communication
  getMessages: () =>
    apiClient.get<any>(`/workforce/messages/${orgId()}`).then(handleResponse),
  sendMessage: (data: any) =>
    apiClient.post<any>('/workforce/messages', { ...data, organisation_id: orgId() }).then(handleResponse),
  getAnnouncements: () =>
    apiClient.get<any>(`/workforce/announcements/${orgId()}`).then(handleResponse),
  createAnnouncement: (data: any) =>
    apiClient.post<any>('/workforce/announcements', { ...data, organisation_id: orgId() }).then(handleResponse),

  // Analytics
  getStaffAnalytics: () =>
    apiClient.get<any>(`/workforce/analytics/${orgId()}`).then(handleResponse),
  getDepartmentAnalytics: () =>
    apiClient.get<any>(`/workforce/analytics/departments/${orgId()}`).then(handleResponse),
  getRoleAnalytics: () =>
    apiClient.get<any>(`/workforce/analytics/roles/${orgId()}`).then(handleResponse),
  getAttritionAnalytics: () =>
    apiClient.get<any>(`/workforce/analytics/attrition/${orgId()}`).then(handleResponse),

  // Roles & Permissions
  getRoles: () =>
    apiClient.get<any>(`/workforce/roles/${orgId()}`).then(handleResponse),
  createRole: (data: any) =>
    apiClient.post<any>('/workforce/roles', { ...data, organisation_id: orgId() }).then(handleResponse),
  updateRole: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/roles/${id}`, data).then(handleResponse),
  getPermissions: () =>
    apiClient.get<any>(`/workforce/permissions/${orgId()}`).then(handleResponse),

  // Staff Requests
  getStaffRequests: () =>
    apiClient.get<any>(`/workforce/requests/${orgId()}`).then(handleResponse),
  createStaffRequest: (data: any) =>
    apiClient.post<any>('/workforce/requests', { ...data, organisation_id: orgId() }).then(handleResponse),
  approveRequest: (id: string, data?: any) =>
    apiClient.put<any>(`/workforce/requests/approve/${id}`, data || {}).then(handleResponse),
  rejectRequest: (id: string, reason?: string) =>
    apiClient.put<any>(`/workforce/requests/reject/${id}`, { reason }).then(handleResponse),

  // Staff Lifecycle
  getStaffLifecycle: () =>
    apiClient.get<any>(`/workforce/lifecycle/${orgId()}`).then(handleResponse),
  getRecruitment: () =>
    apiClient.get<any>(`/workforce/lifecycle/recruitment/${orgId()}`).then(handleResponse),
  getOnboarding: () =>
    apiClient.get<any>(`/workforce/lifecycle/onboarding/${orgId()}`).then(handleResponse),
  getExitManagement: () =>
    apiClient.get<any>(`/workforce/lifecycle/exits/${orgId()}`).then(handleResponse),
  getAlumniRecords: () =>
    apiClient.get<any>(`/workforce/lifecycle/alumni/${orgId()}`).then(handleResponse),

  // Settings
  getStaffSettings: () =>
    apiClient.get<any>(`/workforce/settings/${orgId()}`).then(handleResponse),
  updateStaffSettings: (data: any) =>
    apiClient.put<any>(`/workforce/settings/${orgId()}`, data).then(handleResponse),

  // Timetable Assignments
  getTimetableAssignments: () =>
    apiClient.get<any>(`/workforce/timetable-assignments/${orgId()}`).then(handleResponse),
  createTimetableAssignment: (data: any) =>
    apiClient.post<any>('/workforce/timetable-assignments', { ...data, organisation_id: orgId() }).then(handleResponse),
};

