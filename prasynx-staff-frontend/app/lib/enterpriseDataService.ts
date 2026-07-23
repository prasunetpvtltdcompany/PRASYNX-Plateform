import apiClient from './apiClient';

export const workforceApi = {
  // Staff Directory
  getStaffDirectory: (orgId: string) =>
    apiClient.get<any>(`/workforce/staff-directory/${orgId}`),
  getStaffStats: (orgId: string) =>
    apiClient.get<any>(`/workforce/staff-stats/${orgId}`),

  // Staff Attendance
  getStaffAttendance: (orgId: string, filters?: any) =>
    apiClient.post<any>(`/workforce/staff-attendance/${orgId}`, filters || {}),
  markStaffAttendance: (data: any) =>
    apiClient.post<any>('/workforce/staff-attendance/mark', data),
  bulkStaffAttendance: (data: any) =>
    apiClient.post<any>('/workforce/staff-attendance/bulk', data),
  approveAttendance: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/staff-attendance/approve/${id}`, data),
  attendanceCorrections: (orgId: string) =>
    apiClient.get<any>(`/workforce/staff-attendance/corrections/${orgId}`),
  attendanceHeatmap: (orgId: string, year: number, month: number) =>
    apiClient.get<any>(`/workforce/staff-attendance/heatmap/${orgId}/${year}/${month}`),
  attendanceAnalytics: (orgId: string) =>
    apiClient.get<any>(`/workforce/staff-attendance/analytics/${orgId}`),

  // Departments
  getDepartments: (orgId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId}`),
  getDepartment: (orgId: string, deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId}/${deptId}`),
  createDepartment: (data: any) =>
    apiClient.post<any>('/workforce/departments', data),
  updateDepartment: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/departments/${id}`, data),
  getDepartmentMembers: (orgId: string, deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId}/${deptId}/members`),
  getDepartmentAttendance: (orgId: string, deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId}/${deptId}/attendance`),
  getDepartmentTasks: (orgId: string, deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId}/${deptId}/tasks`),
  getDepartmentPerformance: (orgId: string, deptId: string) =>
    apiClient.get<any>(`/workforce/departments/${orgId}/${deptId}/performance`),

  // Designations
  getDesignations: (orgId: string) =>
    apiClient.get<any>(`/workforce/designations/${orgId}`),
  createDesignation: (data: any) =>
    apiClient.post<any>('/workforce/designations', data),

  // Work Assignments
  getWorkAssignments: (orgId: string) =>
    apiClient.get<any>(`/workforce/work-assignments/${orgId}`),
  createWorkAssignment: (data: any) =>
    apiClient.post<any>('/workforce/work-assignments', data),
  updateWorkAssignment: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/work-assignments/${id}`, data),
  deleteWorkAssignment: (id: string) =>
    apiClient.delete<any>(`/workforce/work-assignments/${id}`),
  getWorkloadDistribution: (orgId: string) =>
    apiClient.get<any>(`/workforce/workload-distribution/${orgId}`),

  // Academic Assignments
  getAcademicAssignments: (orgId: string) =>
    apiClient.get<any>(`/workforce/academic-assignments/${orgId}`),
  createAcademicAssignment: (data: any) =>
    apiClient.post<any>('/workforce/academic-assignments', data),

  // Performance Management
  getPerformanceManagement: (orgId: string) =>
    apiClient.get<any>(`/workforce/performance/${orgId}`),
  getStaffPerformance: (orgId: string, staffId: string) =>
    apiClient.get<any>(`/workforce/performance/${orgId}/${staffId}`),
  updatePerformance: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/performance/${id}`, data),

  // Leave Management
  getLeaveManagement: (orgId: string) =>
    apiClient.get<any>(`/workforce/leaves/${orgId}`),
  getStaffLeaves: (orgId: string, staffId: string) =>
    apiClient.get<any>(`/workforce/leaves/${orgId}/${staffId}`),
  applyLeave: (data: any) =>
    apiClient.post<any>('/workforce/leaves', data),
  approveLeave: (id: string) =>
    apiClient.put<any>(`/workforce/leaves/approve/${id}`, {}),
  rejectLeave: (id: string, reason?: string) =>
    apiClient.put<any>(`/workforce/leaves/reject/${id}`, { reason }),
  getLeaveBalance: (orgId: string, staffId: string) =>
    apiClient.get<any>(`/workforce/leaves/balance/${orgId}/${staffId}`),
  getLeaveAnalytics: (orgId: string) =>
    apiClient.get<any>(`/workforce/leaves/analytics/${orgId}`),

  // Task Management
  getTaskManagement: (orgId: string) =>
    apiClient.get<any>(`/workforce/tasks/${orgId}`),
  createTask: (data: any) =>
    apiClient.post<any>('/workforce/tasks', data),
  updateTask: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/tasks/${id}`, data),
  deleteTask: (id: string) =>
    apiClient.delete<any>(`/workforce/tasks/${id}`),

  // Training & Certifications
  getTrainingPrograms: (orgId: string) =>
    apiClient.get<any>(`/workforce/training/${orgId}`),
  createTrainingProgram: (data: any) =>
    apiClient.post<any>('/workforce/training', data),
  getCertifications: (orgId: string) =>
    apiClient.get<any>(`/workforce/certifications/${orgId}`),
  updateCertification: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/certifications/${id}`, data),

  // Staff Documents
  getStaffDocuments: (orgId: string) =>
    apiClient.get<any>(`/workforce/documents/${orgId}`),
  uploadDocument: (data: any) =>
    apiClient.post<any>('/workforce/documents', data),
  verifyDocument: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/documents/verify/${id}`, data),

  // Payroll Overview
  getPayrollOverview: (orgId: string) =>
    apiClient.get<any>(`/workforce/payroll/${orgId}`),
  getStaffPayroll: (orgId: string, staffId: string) =>
    apiClient.get<any>(`/workforce/payroll/${orgId}/${staffId}`),
  getPayslips: (orgId: string) =>
    apiClient.get<any>(`/workforce/payroll/payslips/${orgId}`),

  // Communication Center
  getMessages: (orgId: string) =>
    apiClient.get<any>(`/workforce/messages/${orgId}`),
  sendMessage: (data: any) =>
    apiClient.post<any>('/workforce/messages', data),
  getAnnouncements: (orgId: string) =>
    apiClient.get<any>(`/workforce/announcements/${orgId}`),
  createAnnouncement: (data: any) =>
    apiClient.post<any>('/workforce/announcements', data),
  getCirculars: (orgId: string) =>
    apiClient.get<any>(`/workforce/circulars/${orgId}`),
  createCircular: (data: any) =>
    apiClient.post<any>('/workforce/circulars', data),

  // Staff Analytics
  getStaffAnalytics: (orgId: string) =>
    apiClient.get<any>(`/workforce/analytics/${orgId}`),
  getDepartmentAnalytics: (orgId: string) =>
    apiClient.get<any>(`/workforce/analytics/departments/${orgId}`),
  getRoleAnalytics: (orgId: string) =>
    apiClient.get<any>(`/workforce/analytics/roles/${orgId}`),
  getAttritionAnalytics: (orgId: string) =>
    apiClient.get<any>(`/workforce/analytics/attrition/${orgId}`),

  // Roles & Permissions
  getRoles: (orgId: string) =>
    apiClient.get<any>(`/workforce/roles/${orgId}`),
  createRole: (data: any) =>
    apiClient.post<any>('/workforce/roles', data),
  updateRole: (id: string, data: any) =>
    apiClient.put<any>(`/workforce/roles/${id}`, data),
  getPermissions: (orgId: string) =>
    apiClient.get<any>(`/workforce/permissions/${orgId}`),

  // Staff Requests
  getStaffRequests: (orgId: string) =>
    apiClient.get<any>(`/workforce/requests/${orgId}`),
  createStaffRequest: (data: any) =>
    apiClient.post<any>('/workforce/requests', data),
  approveRequest: (id: string, data?: any) =>
    apiClient.put<any>(`/workforce/requests/approve/${id}`, data || {}),
  rejectRequest: (id: string, reason?: string) =>
    apiClient.put<any>(`/workforce/requests/reject/${id}`, { reason }),

  // Staff Lifecycle
  getStaffLifecycle: (orgId: string) =>
    apiClient.get<any>(`/workforce/lifecycle/${orgId}`),
  getRecruitment: (orgId: string) =>
    apiClient.get<any>(`/workforce/lifecycle/recruitment/${orgId}`),
  getOnboarding: (orgId: string) =>
    apiClient.get<any>(`/workforce/lifecycle/onboarding/${orgId}`),
  getExitManagement: (orgId: string) =>
    apiClient.get<any>(`/workforce/lifecycle/exits/${orgId}`),
  getAlumniRecords: (orgId: string) =>
    apiClient.get<any>(`/workforce/lifecycle/alumni/${orgId}`),

  // Staff Settings
  getStaffSettings: (orgId: string) =>
    apiClient.get<any>(`/workforce/settings/${orgId}`),
  updateStaffSettings: (orgId: string, data: any) =>
    apiClient.put<any>(`/workforce/settings/${orgId}`, data),

  // Timetable Assignments
  getTimetableAssignments: (orgId: string) =>
    apiClient.get<any>(`/workforce/timetable-assignments/${orgId}`),
  createTimetableAssignment: (data: any) =>
    apiClient.post<any>('/workforce/timetable-assignments', data),

  // Quick Actions
  addStaff: (data: any) =>
    apiClient.post<any>('/workforce/staff', data),
  importStaff: (orgId: string, data: any) =>
    apiClient.post<any>('/workforce/staff/import', { ...data, organisation_id: orgId }),
  assignRole: (data: any) =>
    apiClient.put<any>('/workforce/staff/assign-role', data),
  assignDepartment: (data: any) =>
    apiClient.put<any>('/workforce/staff/assign-department', data),
  assignClasses: (data: any) =>
    apiClient.post<any>('/workforce/staff/assign-classes', data),
  assignSubjects: (data: any) =>
    apiClient.post<any>('/workforce/staff/assign-subjects', data),
};
