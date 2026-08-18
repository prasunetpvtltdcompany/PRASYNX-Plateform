import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,

  toggleTheme: () => {
    set((state) => {
      const newDark = !state.isDark;
      AsyncStorage.setItem('theme', newDark ? 'dark' : 'light');
      return { isDark: newDark };
    });
  },

  setDark: (dark) => {
    AsyncStorage.setItem('theme', dark ? 'dark' : 'light');
    set({ isDark: dark });
  },

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem('theme');
      set({ isDark: stored === 'dark' });
    } catch {
      set({ isDark: false });
    }
  },
}));
