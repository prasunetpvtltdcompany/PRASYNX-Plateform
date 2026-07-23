export interface Colors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryBg: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  error: string;
  errorBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;
  card: string;
  tabBar: string;
  tabBarInactive: string;
  statusBar: string;
  inputBg: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  sidebarBorder: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
}

export const lightColors: Colors = {
  primary: '#6D4CFF',
  primaryLight: '#8B5CF6',
  primaryDark: '#5A3FD6',
  secondary: '#F3F0FF',
  secondaryBg: '#F3F0FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  success: '#16A34A',
  successBg: '#F0FDF4',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  info: '#6D4CFF',
  infoBg: '#F3F0FF',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarInactive: '#94A3B8',
  statusBar: '#6D4CFF',
  inputBg: '#F8FAFC',
  sidebarBg: '#FFFFFF',
  sidebarText: '#475569',
  sidebarActiveBg: '#F3F0FF',
  sidebarBorder: '#F1F5F9',
  chart1: '#6D4CFF',
  chart2: '#22C55E',
  chart3: '#F59E0B',
  chart4: '#3B82F6',
};

export const darkColors: Colors = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#6D4CFF',
  secondary: '#2D1B69',
  secondaryBg: '#1E1B4B',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  border: '#334155',
  borderLight: '#1E293B',
  error: '#F87171',
  errorBg: '#451A1A',
  success: '#4ADE80',
  successBg: '#14532D',
  warning: '#FBBF24',
  warningBg: '#451A03',
  info: '#A78BFA',
  infoBg: '#2D1B69',
  card: '#1E293B',
  tabBar: '#1E293B',
  tabBarInactive: '#64748B',
  statusBar: '#0F172A',
  inputBg: '#1E293B',
  sidebarBg: '#1E293B',
  sidebarText: '#94A3B8',
  sidebarActiveBg: '#334155',
  sidebarBorder: '#334155',
  chart1: '#8B5CF6',
  chart2: '#4ADE80',
  chart3: '#FBBF24',
  chart4: '#60A5FA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
};

export const borderRadius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

export const shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: '#6D4CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
};
