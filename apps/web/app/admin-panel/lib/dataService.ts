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
  remove: (id: string, passcode: string) => apiClient.delete<any>(`/v2/admin/organisations/${id}`, { passcode }),
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

// ==================== BILLING & SUBSCRIPTIONS ====================
export const billingApi = {
  overview: () => apiClient.get<any>('/v2/admin/billing/overview'),
  plans: () => apiClient.get<any>('/v2/admin/billing/plans'),
  createPlan: (data: any) => apiClient.post<any>('/v2/admin/billing/plans', data),
  updatePlan: (id: string, data: any) => apiClient.put<any>(`/v2/admin/billing/plans/${id}`, data),
  deletePlan: (id: string) => apiClient.delete<any>(`/v2/admin/billing/plans/${id}`),
  subscriptions: () => apiClient.get<any>('/v2/admin/billing/subscriptions'),
  updateSubscription: (id: string, data: any) => apiClient.put<any>(`/v2/admin/billing/subscriptions/${id}`, data),
  deleteSubscription: (id: string) => apiClient.delete<any>(`/v2/admin/billing/subscriptions/${id}`),
  invoices: () => apiClient.get<any>('/v2/admin/billing/invoices'),
  createInvoice: (data: any) => apiClient.post<any>('/v2/admin/billing/invoices', data),
  updateInvoiceStatus: (id: string, status: string) => apiClient.put<any>(`/v2/admin/billing/invoices/${id}/status`, { status }),
  deleteInvoice: (id: string) => apiClient.delete<any>(`/v2/admin/billing/invoices/${id}`),
  transactions: () => apiClient.get<any>('/v2/admin/billing/transactions'),
  recordTransaction: (data: any) => apiClient.post<any>('/v2/admin/billing/transactions', data),
  updateTransaction: (id: string, data: any) => apiClient.put<any>(`/v2/admin/billing/transactions/${id}`, data),
  deleteTransaction: (id: string) => apiClient.delete<any>(`/v2/admin/billing/transactions/${id}`),
  reconcile: () => apiClient.post<any>('/v2/admin/billing/reconcile'),
};

// ==================== USER MANAGEMENT ====================
const qs = (params?: Record<string, any>) => {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
  });
  const s = search.toString();
  return s ? `?${s}` : '';
};

export const userApi = {
  stats: () => apiClient.get<any>('/v2/admin/users/stats'),
  list: (params?: { group?: string; q?: string; status?: string; page?: number; pageSize?: number }) =>
    apiClient.get<any>(`/v2/admin/users${qs(params)}`),
  create: (data: any) => apiClient.post<any>('/v2/admin/users', data),
  updateStatus: (id: string, status: string) => apiClient.put<any>(`/v2/admin/users/${id}/status`, { status }),
  remove: (id: string) => apiClient.delete<any>(`/v2/admin/users/${id}`),
  companyAdmins: () => apiClient.get<any>('/v2/admin/users/company-admins'),
  createCompanyAdmin: (data: any) => apiClient.post<any>('/v2/admin/users/company-admins', data),
  updateCompanyAdmin: (id: string, data: any) => apiClient.put<any>(`/v2/admin/users/company-admins/${id}`, data),
  deleteCompanyAdmin: (id: string) => apiClient.delete<any>(`/v2/admin/users/company-admins/${id}`),
};
