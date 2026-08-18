'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  FileText, FolderOpen, Upload, Download, Search,
  CheckCircle2, AlertCircle, Clock, Plus, Filter,
  FileSignature, FileCheck, FileBadge, FileSpreadsheet,
  Eye, Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const documentTypes = [
  { key: 'all', label: 'All Documents' },
  { key: 'offer_letter', label: 'Offer Letters' },
  { key: 'joining_letter', label: 'Joining Letters' },
  { key: 'id_card', label: 'ID Cards' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'experience', label: 'Experience' },
  { key: 'appraisal', label: 'Appraisals' },
];

export function StaffDocuments() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('all');

  const docsHook = useApi(() => workforceApi.getStaffDocuments(orgId), [orgId], !!orgId);

  const documents = Array.isArray(docsHook.data?.data || docsHook.data) ? (docsHook.data?.data || docsHook.data) : [];

  const filtered = activeTab === 'all' ? documents : documents.filter((d: any) => d.document_type === activeTab || d.category === activeTab);

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'CONTRACT': return FileSignature;
      case 'CERTIFICATE': return FileCheck;
      case 'ID_PROOF': return FileBadge;
      default: return FileText;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'VERIFIED': return <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] font-extrabold">Verified</Badge>;
      case 'PENDING': return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-extrabold">Pending</Badge>;
      case 'REJECTED': return <Badge className="bg-red-50 text-red-700 border-red-200 text-[9px] font-extrabold">Rejected</Badge>;
      default: return <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-[9px]">{s}</Badge>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Staff Documents</h1>
        <p>Manage offer letters, certificates, contracts, and verification documents.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {documentTypes.map(t => (
            <button key={t.key} onClick={() => setLocalTab(t.key)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                activeTab === t.key ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
          <Upload size={14} className="mr-1" /> Upload Document
        </Button>
      </div>

      {docsHook.loading ? <LoadingSkeleton rows={4} cols={3} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((doc: any, i: number) => {
            const Icon = getDocIcon(doc.document_type);
            return (
              <motion.div key={doc.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1 truncate">{doc.title}</h4>
                <p className="text-[11px] text-gray-400 mb-2">{doc.staff_name || doc.full_name} • {doc.document_type}</p>
                {doc.description && <p className="text-[10px] text-gray-500 italic mb-3 line-clamp-2">"{doc.description}"</p>}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-[10px] font-bold text-center hover:bg-purple-100 transition-all">
                      <Eye size={12} className="inline mr-1" /> View
                    </a>
                  )}
                  {doc.status === 'PENDING' && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-lg text-[9px] h-7 px-3">
                      <CheckCircle2 size={11} className="mr-1" /> Verify
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <FolderOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 font-semibold">No documents found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
