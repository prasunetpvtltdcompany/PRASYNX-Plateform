import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Organisation, PortalRole } from '../types';
import * as api from '../services/api';

interface AuthState {
  user: User | null;
  organisation: Organisation | null;
  role: PortalRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: PortalRole | null) => void;
  login: (role: PortalRole, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (role: PortalRole, payload: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organisation: null,
  role: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setRole: (role) => {
    set({ role });
    api.setApiRole(role);
  },

  login: async (role, email, password) => {
    set({ isLoading: true });
    try {
      const result = await api.login(role, email, password);
      if (result.success && result.data) {
        const { token, user, organisation } = result.data as any;
        api.setApiRole(role);
        set({
          user,
          organisation: organisation || null,
          role,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: result.error || 'Login failed' };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  register: async (role, payload) => {
    set({ isLoading: true });
    try {
      const result = await api.register(role, payload);
      set({ isLoading: false });
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.error || 'Registration failed' };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  logout: async () => {
    const { role } = get();
    if (role) {
      await api.logout(role);
    }
    await api.clearAllSessions();
    set({
      user: null,
      organisation: null,
      role: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  restoreSession: async () => {
    const roles: PortalRole[] = ['admin', 'management', 'staff', 'student', 'parent', 'job_provider'];
    for (const role of roles) {
      const session = await api.getStoredSession(role);
      if (session && session.token) {
        api.setApiRole(role);
        try {
          const verification = await api.verifyToken(role);
          if (verification.success) {
            set({
              user: session.user,
              organisation: session.organisation || null,
              role,
              token: session.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
        } catch {}
        await api.logout(role);
      }
    }
    set({ isLoading: false });
    return false;
  },

  setUser: (user) => set({ user }),
}));
