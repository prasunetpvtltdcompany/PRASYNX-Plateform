'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  GraduationCap, Award, BookOpen, Clock, CheckCircle2,
  AlertTriangle, Plus, Search, Filter, Users, CalendarDays,
  TrendingUp, ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export function TrainingCertifications() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('programs');

  const trainingHook = useApi(() => workforceApi.getTrainingPrograms(orgId), [orgId], !!orgId);
  const certsHook = useApi(() => workforceApi.getCertifications(orgId), [orgId], !!orgId);

  const programs = Array.isArray(trainingHook.data?.data || trainingHook.data) ? (trainingHook.data?.data || trainingHook.data) : [];
  const certs = Array.isArray(certsHook.data?.data || certsHook.data) ? (certsHook.data?.data || certsHook.data) : [];

  return (
    <div>
      <div className="page-header">
        <h1>Training & Certifications</h1>
        <p>Manage training programs, workshops, certifications, and professional development.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Programs', value: programs.filter((p: any) => p.status === 'ACTIVE').length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Certifications', value: certs.length, icon: Award, color: 'bg-purple-50 text-purple-600' },
          { label: 'Expiring Soon', value: certs.filter((c: any) => {
            if (!c.expiry_date) return false;
            const days = (new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            return days > 0 && days < 30;
          }).length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Completed', value: programs.filter((p: any) => p.status === 'COMPLETED').length, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-[11px] font-semibold text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-2xl">
          <TabsTrigger value="programs" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Training Programs</TabsTrigger>
          <TabsTrigger value="workshops" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Workshops</TabsTrigger>
          <TabsTrigger value="certifications" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Certifications</TabsTrigger>
          <TabsTrigger value="skill-dev" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Skill Development</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Training Programs</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> New Program
            </Button>
          </div>
          {trainingHook.loading ? <LoadingSkeleton rows={3} cols={1} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {programs.map((p: any, i: number) => (
                <motion.div key={p.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <GraduationCap size={18} />
                    </div>
                    <Badge className={`text-[9px] font-extrabold ${
                      p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : p.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                    }`}>{p.status || 'ACTIVE'}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{p.title || p.name}</h4>
                  {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                    {p.start_date && <span className="flex items-center gap-1"><CalendarDays size={11} /> {new Date(p.start_date).toLocaleDateString()}</span>}
                    {p.duration && <span className="flex items-center gap-1"><Clock size={11} /> {p.duration}</span>}
                    {p.participant_count !== undefined && <span className="flex items-center gap-1"><Users size={11} /> {p.participant_count}</span>}
                  </div>
                  <Progress value={p.completion_percentage || 0} className="h-1.5" />
                  <div className="text-right text-[10px] text-gray-400 mt-1">{p.completion_percentage || 0}% complete</div>
                </motion.div>
              ))}
              {programs.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <GraduationCap size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No training programs yet</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certifications">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Certifications</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> Add Certification
            </Button>
          </div>
          {certsHook.loading ? <LoadingSkeleton rows={3} cols={1} /> : (
            <div className="space-y-3">
              {certs.map((c: any, i: number) => (
                <motion.div key={c.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Award size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{c.title || c.name}</h4>
                        <p className="text-xs text-gray-500">{c.issued_by || c.provider}</p>
                        <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-1">
                          {c.issued_date && <span>Issued: {new Date(c.issued_date).toLocaleDateString()}</span>}
                          {c.expiry_date && (
                            <span className={`flex items-center gap-1 ${new Date(c.expiry_date) < new Date() ? 'text-red-500' : ''}`}>
                              <Clock size={11} /> Expires: {new Date(c.expiry_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {c.file_url && (
                      <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 border-gray-200">
                        <ExternalLink size={12} className="mr-1" /> View
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
              {certs.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Award size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No certifications recorded</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workshops">
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 font-semibold">Workshop management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="skill-dev">
          <div className="text-center py-16">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 font-semibold">Skill development tracking coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
