import { create } from 'zustand';

type Tab = 'chat' | 'voice' | 'tasks' | 'history';
type Role = 'parent' | 'student' | 'teacher' | 'admin' | 'management' | 'staff';

interface Notification {
  id: string;
  type: 'message' | 'ptm' | 'alert' | 'recommendation';
  title: string;
  read: boolean;
}

interface PreranaAIState {
  isOpen: boolean;
  activeTab: Tab;
  badgeCount: number;
  notifications: Notification[];
  role: Role;
  language: string;
  query: string;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setActiveTab: (tab: Tab) => void;
  setBadgeCount: (count: number) => void;
  incrementBadge: () => void;
  resetBadge: () => void;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
  setRole: (role: Role) => void;
  setLanguage: (lang: string) => void;
  setQuery: (q: string) => void;
}

export const usePreranaAIStore = create<PreranaAIState>((set) => ({
  isOpen: false,
  activeTab: 'chat',
  badgeCount: 4,
  notifications: [
    { id: '1', type: 'message', title: 'New Messages', read: false },
    { id: '2', type: 'ptm', title: 'PTM Reminders: Meeting Tomorrow', read: false },
    { id: '3', type: 'alert', title: 'School Alerts: Weather update', read: false },
    { id: '4', type: 'recommendation', title: 'AI Recommendations: Revise Algebra', read: false },
  ],
  role: 'admin',
  language: 'en',
  query: '',
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen, badgeCount: s.isOpen ? s.badgeCount : 0 })),
  setOpen: (open) => set((s) => ({ isOpen: open, badgeCount: open ? 0 : s.badgeCount })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setBadgeCount: (count) => set({ badgeCount: count }),
  incrementBadge: () => set((s) => ({ badgeCount: s.badgeCount + 1 })),
  resetBadge: () => set({ badgeCount: 0 }),
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
  markRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  })),
  setRole: (role) => set({ role }),
  setLanguage: (lang) => set({ language: lang }),
  setQuery: (query) => set({ query }),
}));


