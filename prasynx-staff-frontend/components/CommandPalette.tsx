'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, CheckSquare, Calendar, Folder, MessageSquare, Plus, Activity, Layers } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  tasks?: any[];
  resources?: any[];
}

export default function CommandPalette({ isOpen, onClose, setActiveTab, tasks = [], resources = [] }: CommandPaletteProps) {
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
    { key: 'my-work', label: 'Go to My Work Dashboard', icon: Layers, category: 'Navigation' },
    { key: 'my-tasks', label: 'Go to My Tasks Kanban Board', icon: CheckSquare, category: 'Navigation' },
    { key: 'my-schedule', label: 'Go to My Schedule / Timetable', icon: Calendar, category: 'Navigation' },
    { key: 'my-leave', label: 'Go to Leave Center (Apply Leave)', icon: Plus, category: 'Navigation' },
    { key: 'my-performance', label: 'Go to Performance Evaluations', icon: Activity, category: 'Navigation' },
    { key: 'my-resources', label: 'Go to My Issued Resources', icon: Compass, category: 'Navigation' },
    { key: 'my-messages', label: 'Open Direct Messages Feed', icon: MessageSquare, category: 'Navigation' },
    { key: 'my-documents', label: 'Open Credentials Document Wallet', icon: Folder, category: 'Navigation' },
    { key: 'my-activities', label: 'Open System Activity History', icon: Activity, category: 'Navigation' },
  ];

  // Filter items based on search query
  const filtered = [
    ...navigationItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    ...tasks.map(t => ({
      key: 'my-tasks',
      label: `Task: ${t.title} [${t.status}]`,
      icon: CheckSquare,
      category: 'Assigned Tasks'
    })).filter(t => t.label.toLowerCase().includes(query.toLowerCase())),
    ...resources.map(r => ({
      key: 'my-resources',
      label: `Resource: ${r.resource_name} [${r.status}]`,
      icon: Compass,
      category: 'Workplace Assets'
    })).filter(r => r.label.toLowerCase().includes(query.toLowerCase()))
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
        setActiveTab(filtered[selectedIndex].key);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-xs" onClick={onClose}>
      <div 
        className="w-full max-w-lg mx-4 bg-white/95 backdrop-blur-xl border border-gray-150 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, shortcuts, resources (CMD+K)..."
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
              No matching shortcuts, tasks, or resources found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(item.key);
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
