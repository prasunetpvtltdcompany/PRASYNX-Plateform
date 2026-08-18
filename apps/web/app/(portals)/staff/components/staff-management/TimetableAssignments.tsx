'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  CalendarDays, Clock, Users, BookOpen, School,
  Plus, Search, Filter, ChevronLeft, ChevronRight,
  Building2, GraduationCap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TimetableAssignments() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [selectedDay, setSelectedDay] = useState('Monday');

  const timetableHook = useApi(() => workforceApi.getTimetableAssignments(orgId), [orgId], !!orgId);

  const timetables = Array.isArray(timetableHook.data?.data || timetableHook.data) ? (timetableHook.data?.data || timetableHook.data) : [];

  const daySchedule = timetables.filter((t: any) => t.day_of_week?.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <h1>Timetable Assignments</h1>
        <p>Manage staff timetable schedules, period assignments, and room allocations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays size={16} className="text-purple-500" /> Weekly Timetable
          </h3>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
            <Plus size={14} className="mr-1" /> New Entry
          </Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {days.map(day => (
            <button key={day} onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDay === day ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {day}
            </button>
          ))}
        </div>

        {timetableHook.loading ? <LoadingSkeleton rows={5} cols={4} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Staff</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Class</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Subject</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Room</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {daySchedule.length > 0 ? daySchedule.sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || '')).map((t: any, i: number) => (
                  <tr key={t.id || i} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        <span className="font-semibold text-gray-900 text-xs">{t.start_time} - {t.end_time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{t.staff_name || t.teacher_name}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-[9px]">
                        <School size={10} className="mr-1" /> {t.class_name} {t.section || ''}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">{t.subject_name || t.subject}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">{t.room || t.room_name || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 border-gray-200">Edit</Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-xs font-semibold">
                      <CalendarDays size={32} className="mx-auto mb-2 text-gray-300" />
                      No timetable entries for {selectedDay}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
