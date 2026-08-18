const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers, credentials: 'include' });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || data.message || `Request failed with status ${res.status}` };
      }

      return { success: true, data: data.data || data, message: data.message };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  }

  async safeFetchArray(endpoint: string): Promise<any[]> {
    const res = await this.get<any[]>(endpoint);
    if (!res.success) return [];
    return Array.isArray(res.data) ? res.data : [];
  }

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.post('/v2/student/auth/login', { email, password });
  }
}

export const apiClient = new ApiClient(API_BASE);
export default apiClient;
