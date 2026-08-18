const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem('parentSession');
      if (session) { const p = JSON.parse(session); return p.token || null; }
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
      if (!res.ok) return { success: false, error: data.error || data.message || `Status ${res.status}` };
      return { success: true, data: data.data || data, message: data.message };
    } catch (error: any) { return { success: false, error: error.message || 'Network error' }; }
  }

  async get<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  async post<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }); }
  async put<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }); }

  async safeFetchArray(endpoint: string): Promise<any[]> {
    const res = await this.get<any[]>(endpoint);
    return res.success && Array.isArray(res.data) ? res.data : [];
  }

  async login(email: string, password: string) { return this.post('/v2/parents/auth/login', { email, password }); }
}

export const apiClient = new ApiClient(API_BASE);
export default apiClient;
