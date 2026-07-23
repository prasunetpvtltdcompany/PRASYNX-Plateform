const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const s = localStorage.getItem('jobProviderSession');
      if (s) { const p = JSON.parse(s); return p.token || null; }
    } catch { return null; }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || `Status ${res.status}` };
      return { success: true, data: data.data || data };
    } catch (error: any) { return { success: false, error: error.message || 'Network error' }; }
  }

  async get<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  async post<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }); }
  async put<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }); }
  async patch<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }); }
  async delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const apiClient = new ApiClient(API_BASE);
export default apiClient;
