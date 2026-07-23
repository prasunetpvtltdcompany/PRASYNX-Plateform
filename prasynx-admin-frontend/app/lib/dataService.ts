import apiClient from './apiClient';

const orgId = () => {
  if (typeof window === 'undefined') return '';
  try {
    const s = JSON.parse(localStorage.getItem('adminSession') || '{}');
    return s?.organisations?.[0]?.id || s?.user?.organisation_id || '';
  } catch { return ''; }
};

// ==================== ORGANISATIONS ====================
export const organisationApi = {
  list: () => apiClient.get<any>('/v2/admin/organisations'),
  get: (id: string) => apiClient.get<any>(`/v2/admin/organisations/${id}`),
  create: (data: any) => apiClient.post<any>('/v2/admin/create-organisation', data),
  verify: (orgId: string, status: string) => apiClient.post<any>('/v2/admin/verify-org', { org_id: orgId, status }),
  update: (id: string, data: any) => apiClient.post<any>(`/v2/admin/organisations/${id}`, data),
};

// ==================== CREDENTIALS ====================
export const credentialApi = {
  list: () => apiClient.get<any>('/v2/admin/credential-history'),
  createManagementAccess: (data: any) => apiClient.post<any>('/v2/admin/create-management-access', data),
  revoke: (id: string) => apiClient.post<any>(`/v2/admin/credentials/${id}/revoke`),
};

// ==================== ADMIN ====================
export const adminApi = {
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiClient.post<any>('/v2/admin/change-password', data),
  verifyToken: () => apiClient.post<any>('/v2/admin/verify-token'),
};

// ==================== ANALYTICS ====================
export const analyticsApi = {
  dashboard: () => apiClient.get<any>('/v2/admin/analytics/dashboard'),
  orgGrowth: () => apiClient.get<any>('/v2/admin/analytics/org-growth'),
  credentialTrend: () => apiClient.get<any>('/v2/admin/analytics/credential-trend'),
  userActivity: () => apiClient.get<any>('/v2/admin/analytics/user-activity'),
  topOrgs: () => apiClient.get<any>('/v2/admin/analytics/top-organisations'),
  revenue: () => apiClient.get<any>('/v2/admin/analytics/revenue'),
};

// ==================== BULK ====================
export const bulkApi = {
  createOrganisations: (orgs: any[]) => apiClient.post<any>('/v2/admin/bulk-create-organisations', { organisations: orgs }),
};

// ==================== AUDIT LOGS ====================
export const auditApi = {
  list: () => apiClient.get<any>('/v2/admin/audit-logs'),
};
