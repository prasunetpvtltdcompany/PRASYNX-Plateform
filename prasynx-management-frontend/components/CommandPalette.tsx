'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, User, GraduationCap, CornerDownRight, LayoutDashboard, Activity, Sparkles, Users, Calendar, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface PaletteSection {
  workspace: string;
  label: string;
  icon: any;
  items: { key: string; label: string; icon: any }[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (workspace: string, view: string) => void;
  staffList?: any[];
  studentsList?: any[];
  navSections?: PaletteSection[];
}

const fallbackSections: PaletteSection[] = [
  {
    workspace: 'home',
    label: 'General',
    icon: LayoutDashboard,
    items: [
      { key: 'dashboard', label: 'Go to Admin Dashboard', icon: LayoutDashboard },
      { key: 'analytics', label: 'Go to Analytics & Metrics', icon: Activity },
      { key: 'ai-insights', label: 'Go to AI Insights (Prerana AI)', icon: Sparkles },
    ],
  },
  {
    workspace: 'staff',
    label: 'Staff Management',
    icon: Users,
    items: [
      { key: 'directory', label: 'Staff Directory', icon: Users },
      { key: 'attendance', label: 'Staff Attendance', icon: Calendar },
      { key: 'salary', label: 'Salary', icon: FileText },
      { key: 'roles', label: 'Roles & Permissions', icon: Users },
    ],
  },
  {
    workspace: 'students',
    label: 'Student Management',
    icon: GraduationCap,
    items: [
      { key: 'directory', label: 'Student Directory', icon: Users },
      { key: 'admissions', label: 'Admissions', icon: GraduationCap },
      { key: 'examinations', label: 'Examinations', icon: FileText },
    ],
  },
];

export default function CommandPalette({ isOpen, onClose, setActiveTab, onNavigate, staffList = [], studentsList = [], navSections }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const sections = navSections && navSections.length > 0 ? navSections : fallbackSections;

  interface Item {
    key: string;
    label: string;
    description?: string;
    icon: any;
    group: string;
    accent: string;
    action: () => void;
  }

  const runNav = (workspace: string, view: string, key: string) => {
    if (onNavigate) { onNavigate(workspace, view); return; }
    if (setActiveTab) { setActiveTab(key); return; }
    router.push(`/?tab=${key}`);
  };

  const allItems = useMemo<Item[]>(() => {
    const navItems: Item[] = sections.flatMap(section =>
      section.items.map(item => ({
        key: `${section.workspace}:${item.key}`,
        label: item.label,
        icon: item.icon || section.icon,
        group: section.label,
        accent: '#6D4CFF',
        action: () => runNav(section.workspace, item.key, item.key),
      }))
    );

    const people: Item[] = [
      ...staffList.slice(0, 200).map(s => ({
        key: `staff-${s.id}`,
        label: s.full_name || s.name || 'Staff',
        description: [s.designation || s.role || 'Staff member', s.employee_id || s.staff_unique_id].filter(Boolean).join(' • '),
        icon: User,
        group: 'Staff',
        accent: '#2563EB',
        action: () => router.push(`/staff/${s.id}/overview`),
      })),
      ...studentsList.slice(0, 200).map(s => ({
        key: `student-${s.id}`,
        label: s.full_name || s.name || 'Student',
        description: [s.roll_number && `Roll ${s.roll_number}`, s.class?.name || s.class_name].filter(Boolean).join(' • '),
        icon: GraduationCap,
        group: 'Students',
        accent: '#16A34A',
        action: () => runNav('students', 'directory', 'directory'),
      })),
    ];

    return [...navItems, ...people];
  }, [sections, staffList, studentsList, onNavigate, setActiveTab, router]);

  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalized) return allItems;
    return allItems.filter(item =>
      item.label.toLowerCase().includes(normalized) ||
      (item.description || '').toLowerCase().includes(normalized)
    );
  }, [allItems, normalized]);

  useEffect(() => { setSelectedIndex(0); }, [filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white/95 backdrop-blur-xl border border-gray-150 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tabs, staff, students… (⌘K)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full text-sm outline-none text-gray-800 bg-transparent font-medium"
          />
          <kbd className="text-[10px] bg-gray-100 border text-gray-400 font-bold px-1.5 py-0.5 rounded shadow-sm">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No matches for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try "Staff Directory", "Attendance" or a staff name.</p>
            </div>
          ) : Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{group}</span>
                <span className="text-[9px] text-gray-300">{items.length} result{items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isSelected = flatIndex === selectedIndex;
                  flatIndex += 1;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { item.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(flatIndex - 1)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs font-bold transition-all ${
                        isSelected ? 'bg-[#6D4CFF] text-white shadow-md shadow-[#6D4CFF]/15' : 'text-gray-650 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-50'}`}
                          style={!isSelected ? { color: item.accent } : undefined}>
                          <Icon size={14} />
                        </span>
                        <span className="truncate">{item.label}</span>
                        {item.description && (
                          <span className={`hidden sm:inline text-[9px] truncate ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>— {item.description}</span>
                        )}
                      </div>
                      <CornerDownRight size={12} className={`flex-shrink-0 ${isSelected ? 'text-white/70' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3 text-[9px] text-gray-400">
            <span><kbd className="px-1 py-0.5 bg-gray-100 border rounded text-gray-500 font-black">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 bg-gray-100 border rounded text-gray-500 font-black">↵</kbd> Open</span>
            <span><kbd className="px-1 py-0.5 bg-gray-100 border rounded text-gray-500 font-black">Esc</kbd> Close</span>
          </div>
        )}
      </div>
    </div>
  );
}