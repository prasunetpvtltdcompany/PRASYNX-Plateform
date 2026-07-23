'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, Users, User, Calendar, Folder, MessageSquare, Plus, Activity, Layers, Shield, FileText, Sparkles, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab?: (tab: string) => void;
  staffList?: any[];
}

export default function CommandPalette({ isOpen, onClose, setActiveTab, staffList = [] }: CommandPaletteProps) {
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

  const navigationItems = [
    { key: 'dashboard', label: 'Go to Admin Dashboard', icon: LayoutDashboard, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('dashboard'); } else { router.push('/?tab=dashboard'); } } },
    { key: 'analytics', label: 'Go to Analytics & Metrics', icon: Activity, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('analytics'); } else { router.push('/?tab=analytics'); } } },
    { key: 'ai-insights', label: 'Go to AI Insights (Prerana AI)', icon: Sparkles, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('ai-insights'); } else { router.push('/?tab=ai-insights'); } } },
    { key: 'staff', label: 'Go to Staff Directory Management', icon: Users, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('staff'); } else { router.push('/?tab=staff'); } } },
    { key: 'students', label: 'Go to Student Directory', icon: User, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('students'); } else { router.push('/?tab=students'); } } },
    { key: 'parents', label: 'Go to Parent Directory', icon: User, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('parents'); } else { router.push('/?tab=parents'); } } },
    { key: 'timetable', label: 'Go to School Timetable Setup', icon: Calendar, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('timetable'); } else { router.push('/?tab=timetable'); } } },
    { key: 'exams', label: 'Go to Examination Setup', icon: FileText, category: 'Navigation', action: () => { if (setActiveTab) { setActiveTab('exams'); } else { router.push('/?tab=exams'); } } },
  ];

  // Filter items based on search query
  const filtered = [
    ...navigationItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    ...staffList.map(s => ({
      key: `staff-${s.id}`,
      label: `Staff Profile: ${s.full_name} [${s.designation || s.role || 'Staff'}]`,
      icon: Users,
      category: 'Staff Directory',
      action: () => { router.push(`/staff/${s.id}/overview`); }
    })).filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-xs animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-lg mx-4 bg-white/95 backdrop-blur-xl border border-gray-150 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search shortcuts, staff profiles (CMD+K)..."
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

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs font-semibold text-gray-400">
              No matching shortcuts or staff profiles found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                    isSelected ? 'bg-[#6D4CFF] text-white shadow-md shadow-[#6D4CFF]/15' : 'text-gray-650 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className={isSelected ? 'text-white' : 'text-[#6D4CFF]'} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
