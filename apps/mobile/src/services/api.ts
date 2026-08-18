import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';

interface SessionData {
  token: string;
  user: any;
  organisation?: any;
}

const SESSION_KEYS: Record<string, string> = {
  admin: 'adminSession',
  management: 'managementSession',
  staff: 'staffSession',
  student: 'studentSession',
  parent: 'parentSession',
  job_provider: 'jobProviderSession',
};

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '192.168.30.128';

const API_URLS: Record<string, string> = {
  admin: `http://${API_HOST}:4001/api`,
  management: `http://${API_HOST}:4002/api`,
  staff: `http://${API_HOST}:4003/api`,
  student: `http://${API_HOST}:4004/api`,
  parent: `http://${API_HOST}:4005/api`,
  job_provider: `http://${API_HOST}:4006/api`,
};

let currentRole: string | null = null;

export function setApiRole(role: string | null) {
  currentRole = role;
}

export function getApiRole(): string | null {
  return currentRole;
}

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const role = currentRole || 'student';
      const key = role === 'job_provider' ? 'jobProviderSession' : `${role}Session`;
      try {
        const sessionStr = await AsyncStorage.getItem(key);
        if (sessionStr) {
          const session: SessionData = JSON.parse(sessionStr);
          if (session.token) {
            config.headers.Authorization = `Bearer ${session.token}`;
          }
        }
      } catch {}
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        const role = currentRole;
        const key = role ? SESSION_KEYS[role] || `${role}Session` : 'studentSession';
        await AsyncStorage.removeItem(key);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const clients: Record<string, AxiosInstance> = {};

for (const [role, url] of Object.entries(API_URLS)) {
  clients[role] = createClient(url);
}

export function getClient(): AxiosInstance {
  const role = currentRole || 'student';
  return clients[role] || clients.student;
}

export function getClientForRole(role: string): AxiosInstance {
  return clients[role] || clients.student;
}

export async function login(role: string, email: string, password: string): Promise<ApiResponse<SessionData>> {
  try {
    const client = getClientForRole(role);
    let url = `/v2/auth/login`;
    if (role === 'job_provider') {
      url = '/job-provider/login';
    }
    if (role === 'admin') {
      url = '/v2/admin/login';
    }
    const response = await client.post(url, { email, password });
    const data = response.data;
    if (data.success && data.token) {
      const session: SessionData = { token: data.token, user: data.user || data.provider };
      if (data.organisation) session.organisation = data.organisation;
      const key = SESSION_KEYS[role] || `${role}Session`;
      await AsyncStorage.setItem(key, JSON.stringify(session));
      currentRole = role;
    }
    return data;
  } catch (error: any) {
    const message = error?.response?.data?.error || error?.response?.data?.message || 'Login failed';
    return { success: false, error: message };
  }
}

export async function register(role: string, payload: any): Promise<ApiResponse<any>> {
  try {
    const client = getClientForRole(role);
    let url = `/v2/auth/register`;
    if (role === 'job_provider') {
      url = '/job-provider/register';
    }
    const response = await client.post(url, payload);
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.error || error?.response?.data?.message || 'Registration failed';
    return { success: false, error: message };
  }
}

export async function verifyToken(role: string): Promise<ApiResponse<any>> {
  try {
    const client = getClientForRole(role);
    let url = `/v2/auth/verify-token`;
    if (role === 'admin') {
      url = '/v2/admin/verify-token';
    }
    const response = await client.post(url);
    return response.data;
  } catch (error: any) {
    return { success: false, error: 'Token verification failed' };
  }
}

export async function logout(role: string): Promise<void> {
  const key = SESSION_KEYS[role] || `${role}Session`;
  await AsyncStorage.removeItem(key);
  currentRole = null;
}

export async function getStoredSession(role: string): Promise<SessionData | null> {
  const key = SESSION_KEYS[role] || `${role}Session`;
  try {
    const str = await AsyncStorage.getItem(key);
    if (str) return JSON.parse(str);
  } catch {}
  return null;
}

export async function clearAllSessions(): Promise<void> {
  const keys = Object.values(SESSION_KEYS);
  await AsyncStorage.multiRemove(keys);
  currentRole = null;
}

export async function apiGet<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    const response = await getClient().get(url, { params });
    return response.data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data?.error || 'Request failed' };
  }
}

export async function apiPost<T>(url: string, data?: any): Promise<ApiResponse<T>> {
  try {
    const response = await getClient().post(url, data);
    return response.data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data?.error || 'Request failed' };
  }
}

export async function apiPut<T>(url: string, data?: any): Promise<ApiResponse<T>> {
  try {
    const response = await getClient().put(url, data);
    return response.data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data?.error || 'Request failed' };
  }
}

export async function apiPatch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
  try {
    const response = await getClient().patch(url, data);
    return response.data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data?.error || 'Request failed' };
  }
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await getClient().delete(url);
    return response.data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data?.error || 'Request failed' };
  }
}
