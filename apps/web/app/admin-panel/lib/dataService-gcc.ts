import apiClient from './apiClient';

export interface GCCApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const gccApi = {
  overview: () => apiClient.get<any>('/v2/admin/gcc/overview'),

  listOrganisations: (params?: { q?: string; status?: string; plan?: string; region?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.plan) query.set('plan', params.plan);
    if (params?.region) query.set('region', params.region);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<any>(`/v2/admin/gcc/organisations${qs ? `?${qs}` : ''}`);
  },

  getOrganisation: (id: string) => apiClient.get<any>(`/v2/admin/gcc/organisations/${id}`),

  getStudents: (orgId: string) => apiClient.get<any>(`/v2/admin/gcc/organisations/${orgId}/students`),
  getStaff: (orgId: string) => apiClient.get<any>(`/v2/admin/gcc/organisations/${orgId}/staff`),
  getParents: (orgId: string) => apiClient.get<any>(`/v2/admin/gcc/organisations/${orgId}/parents`),
  getOrgAdmins: (orgId: string) => apiClient.get<any>(`/v2/admin/gcc/organisations/${orgId}/admins`),
  getOrgSecurityLogs: (orgId: string) => apiClient.get<any>(`/v2/admin/gcc/organisations/${orgId}/security-logs`),
  getOrgAuditLogs: (orgId: string) => apiClient.get<any>(`/v2/admin/gcc/organisations/${orgId}/audit-logs`),

  globalSearch: (q: string, type?: string, limit?: number) => {
    const query = new URLSearchParams({ q });
    if (type) query.set('type', type);
    if (limit) query.set('limit', String(limit));
    return apiClient.get<any>(`/v2/admin/gcc/search?${query.toString()}`);
  },

  startImpersonation: (data: { userId: string; role: string; organisationId: string; orgName: string; userName: string }) =>
    apiClient.post<any>('/v2/admin/gcc/impersonate/start', data),

  stopImpersonation: (sessionId: string) =>
    apiClient.post<any>(`/v2/admin/gcc/impersonate/${sessionId}/stop`),

  getImpersonationSessions: () => apiClient.get<any>('/v2/admin/gcc/impersonate/sessions'),

  getMonitoring: () => apiClient.get<any>('/v2/admin/gcc/monitoring'),

  getAuditLogs: (params?: { page?: number; limit?: number; orgId?: string; portal?: string; action?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.orgId) query.set('orgId', params.orgId);
    if (params?.portal) query.set('portal', params.portal);
    if (params?.action) query.set('action', params.action);
    const qs = query.toString();
    return apiClient.get<any>(`/v2/admin/gcc/audit-logs${qs ? `?${qs}` : ''}`);
  },

  getRBAC: () => apiClient.get<any>('/v2/admin/gcc/rbac'),

  getCompliance: () => apiClient.get<any>('/v2/admin/gcc/compliance'),

  getPortalStats: () => apiClient.get<any>('/v2/admin/gcc/portal-stats'),

  getPortalUsers: (portal: string) => apiClient.get<any>(`/v2/admin/gcc/portal-users?portal=${portal}`),
};
