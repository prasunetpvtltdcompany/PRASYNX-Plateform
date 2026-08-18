'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, GraduationCap, Award, Trophy,
  Heart, Target, Star, School, Plus, Search, Filter,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function AcademicAssignments() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('classes-subjects');

  const assignmentsHook = useApi(() => workforceApi.getAcademicAssignments(orgId), [orgId], !!orgId);
  const timetableHook = useApi(() => workforceApi.getTimetableAssignments(orgId), [orgId], !!orgId);

  const assignments = Array.isArray(assignmentsHook.data?.data || assignmentsHook.data) ? (assignmentsHook.data?.data || assignmentsHook.data) : [];
  const timetables = Array.isArray(timetableHook.data?.data || timetableHook.data) ? (timetableHook.data?.data || timetableHook.data) : [];

  const tabs = [
    { key: 'classes-subjects', label: 'Classes & Subjects', icon: BookOpen },
    { key: 'class-teacher', label: 'Class Teacher', icon: Users },
    { key: 'exam-duties', label: 'Exam Duties', icon: GraduationCap },
    { key: 'club-responsibilities', label: 'Club Responsibilities', icon: Trophy },
    { key: 'house-responsibilities', label: 'House Responsibilities', icon: Star },
    { key: 'mentorship', label: 'Mentorship', icon: Heart },
    { key: 'committee', label: 'Committee', icon: Target },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Academic Assignments</h1>
        <p>Assign classes, sections, subjects, and responsibilities to staff.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 overflow-x-auto">
          <TabsList className="bg-gray-100 p-1 rounded-2xl inline-flex">
            {tabs.map(t => (
              <TabsTrigger key={t.key} value={t.key} className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <t.icon size={14} className="mr-1" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="classes-subjects">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Class & Subject Assignments</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> Assign Classes
            </Button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Staff</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Class</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Section</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Subject</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? assignments.map((a: any, i: number) => (
                  <tr key={a.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{a.staff_name || a.teacher_name}</td>
                    <td className="py-3 px-4 text-gray-600">{a.class_name}</td>
                    <td className="py-3 px-4 text-gray-600">{a.section || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px]">{a.subject_name || a.subject}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 border-gray-200">Edit</Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 text-xs font-semibold">No class assignments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {tabs.slice(1).map(t => (
          <TabsContent key={t.key} value={t.key}>
            <div className="text-center py-16">
              <t.icon size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 font-semibold capitalize">{t.label} assignments will appear here</p>
              <Button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                <Plus size={14} className="mr-1" /> New {t.label}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
