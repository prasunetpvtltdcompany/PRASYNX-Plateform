import { auth } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return auth.getToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        // Ensure cookies are sent/received in cross-origin dev setups
        // so the browser can accept the `Set-Cookie` header from the API.
        credentials: (options as RequestInit).credentials ?? 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error || data.message || `Request failed with status ${res.status}`,
          code: data.code,
          details: data.details,
        };
      }

      return { success: true, data: data.data || data, message: data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Safe fetch that returns array (backward compatible with existing code)
  async safeFetchArray(endpoint: string): Promise<any[]> {
    const res = await this.get<any[]>(endpoint);
    if (!res.success) return [];
    return Array.isArray(res.data) ? res.data : [];
  }

  // Login returns token + user data
  async login(email: string, password: string): Promise<ApiResponse<{
    token: string;
    user: any;
    organisation: any;
  }>> {
    const res = await this.post<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: any;
    }>('/v2/auth/login', { email, password });

    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Login failed' };
    }

    return {
      success: true,
      data: {
        token: res.data.accessToken,
        user: res.data.user,
        organisation: res.data.user?.organisation_id
          ? { id: res.data.user.organisation_id }
          : null,
      },
    };
  }
}

export const apiClient = new ApiClient(API_BASE);
export default apiClient;
