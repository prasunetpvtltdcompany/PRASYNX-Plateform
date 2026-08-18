'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, XCircle, Clock, AlertCircle,
  Plus, Search, Filter, FileText, Truck, Monitor, HelpCircle,
  Users, Building2, Umbrella
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const requestTypes = [
  { key: 'leave', label: 'Leave', icon: Umbrella, color: 'bg-blue-50 text-blue-600' },
  { key: 'resource', label: 'Resource', icon: ClipboardList, color: 'bg-purple-50 text-purple-600' },
  { key: 'document', label: 'Document', icon: FileText, color: 'bg-amber-50 text-amber-600' },
  { key: 'approval', label: 'Approval', icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
  { key: 'transport', label: 'Transport', icon: Truck, color: 'bg-orange-50 text-orange-600' },
  { key: 'it_support', label: 'IT Support', icon: Monitor, color: 'bg-cyan-50 text-cyan-600' },
];

export function StaffRequests() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('all');

  const requestsHook = useApi(() => workforceApi.getStaffRequests(orgId), [orgId], !!orgId);

  const requests = Array.isArray(requestsHook.data?.data || requestsHook.data) ? (requestsHook.data?.data || requestsHook.data) : [];

  const filtered = activeTab === 'all' ? requests : requests.filter((r: any) => r.request_type === activeTab);

  const pendingCount = requests.filter((r: any) => r.status === 'PENDING').length;

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'APPROVED': return <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] font-extrabold">Approved</Badge>;
      case 'PENDING': return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-extrabold">Pending</Badge>;
      case 'REJECTED': return <Badge className="bg-red-50 text-red-700 border-red-200 text-[9px] font-extrabold">Rejected</Badge>;
      default: return <Badge className="bg-gray-50 text-gray-600">{s}</Badge>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Staff Requests</h1>
        <p>Manage leave, resource, document, transport, and IT support requests.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {requestTypes.map((rt, i) => (
          <motion.div key={rt.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setLocalTab(rt.key)}>
            <div className={`w-10 h-10 rounded-xl ${rt.color} flex items-center justify-center mx-auto mb-2`}>
              <rt.icon size={18} />
            </div>
            <div className="text-lg font-black">{requests.filter((r: any) => r.request_type === rt.key).length}</div>
            <div className="text-[10px] font-semibold text-gray-400">{rt.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-extrabold px-3 py-1">
            {pendingCount} Pending
          </Badge>
        </div>
        <div className="flex gap-2">
          {['all', ...requestTypes.map(r => r.key)].map(tab => (
            <button key={tab} onClick={() => setLocalTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeTab === tab ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {tab === 'all' ? 'All' : tab === 'it_support' ? 'IT' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {requestsHook.loading ? <LoadingSkeleton rows={4} cols={1} /> : (
        <div className="space-y-3">
          {filtered.map((r: any, i: number) => {
            const rt = requestTypes.find(t => t.key === r.request_type);
            const Icon = rt?.icon || HelpCircle;
            const color = rt?.color || 'bg-gray-50 text-gray-600';
            return (
              <motion.div key={r.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-gray-900">{r.title || r.subject || `${r.request_type} Request`}</h4>
                        {getStatusBadge(r.status)}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{r.description || r.reason || r.details}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                        <span>{r.staff_name || r.full_name}</span>
                        <span>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </div>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-xl text-[9px] h-8"
                        onClick={() => toast.success('Request approved')}>
                        <CheckCircle2 size={12} className="mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-[9px] h-8"
                        onClick={() => toast.error('Request rejected')}>
                        <XCircle size={12} className="mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 font-semibold">No requests found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
