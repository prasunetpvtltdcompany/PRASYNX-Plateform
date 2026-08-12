'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  FileText, Award, GraduationCap, Search, Download, Eye,
  CheckCircle2, XCircle, Clock, Plus, RefreshCw, Calendar
} from 'lucide-react';

const TABS = [
  { key: 'documents', labelKey: 'mod.allDocuments', icon: FileText },
  { key: 'certifications', labelKey: 'mod.certifications', icon: Award },
  { key: 'training', labelKey: 'mod.trainingPrograms', icon: GraduationCap },
];

function getStatusBadge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'verified') return <Badge variant="success" className="text-[10px] flex items-center gap-1"><CheckCircle2 size={10} />Verified</Badge>;
  if (s === 'rejected') return <Badge variant="danger" className="text-[10px] flex items-center gap-1"><XCircle size={10} />Rejected</Badge>;
  return <Badge variant="warning" className="text-[10px] flex items-center gap-1"><Clock size={10} />Pending</Badge>;
}

function getTrainingStatusBadge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return <Badge variant="success" className="text-[10px]">Completed</Badge>;
  if (s === 'in_progress') return <Badge variant="warning" className="text-[10px]">In Progress</Badge>;
  return <Badge variant="default" className="text-[10px]">{status || 'Upcoming'}</Badge>;
}

function formatDate(d: string) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

export function StaffDocuments() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('documents');
  const [search, setSearch] = useState('');

  const docs = useApi(() => enterpriseStaffApi.getStaffDocuments(), [], true);
  const certs = useApi(() => enterpriseStaffApi.getCertifications(), [], true);
  const training = useApi(() => enterpriseStaffApi.getTrainingPrograms(), [], true);

  const handleVerify = async (id: string) => {
    try {
      const res = await enterpriseStaffApi.verifyDocument(id, { status: 'verified' });
      if (res.success) { toast.success('Document verified'); docs.refetch(); }
      else toast.error(res.error || 'Verification failed');
    } catch (err: any) { toast.error(err.message); }
  };

  const filterFn = (arr: any[]) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  };

  const filteredDocs = filterFn(Array.isArray(docs.data?.data) ? docs.data.data : Array.isArray(docs.data) ? docs.data : []);
  const filteredCerts = filterFn(Array.isArray(certs.data?.data) ? certs.data.data : Array.isArray(certs.data) ? certs.data : []);
  const filteredTraining = filterFn(Array.isArray(training.data?.data) ? training.data.data : Array.isArray(training.data) ? training.data : []);

  const isLoading = docs.loading || certs.loading || training.loading;

  return (
    <div>
      <div className="page-header">
        <h1>Staff Documents</h1>
        <p>Manage staff documents, certifications, and training records</p>
      </div>

      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <tab.icon size={14} /> {t(tab.labelKey)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="w-full sm:w-56 pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <button onClick={() => { docs.refetch(); certs.refetch(); training.refetch(); }}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'documents' && (
          <motion.div key="documents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {docs.loading ? <LoadingSkeleton rows={5} cols={5} /> : docs.error ? <ErrorState message={docs.error} onRetry={docs.refetch} /> :
            !filteredDocs.length ? <EmptyState message="No documents found" /> : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Staff Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Document Type</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Upload Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map((doc: any, i: number) => (
                        <tr key={doc.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-[10px] font-bold">
                                {(doc.staff_name || doc.full_name || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-800">{doc.staff_name || doc.full_name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{doc.document_type || doc.type || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(doc.upload_date || doc.created_at)}</td>
                          <td className="px-4 py-3">{getStatusBadge(doc.status || 'pending')}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => handleVerify(doc.id)}
                                disabled={doc.status === 'verified'}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                title="Verify Document">
                                <CheckCircle2 size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title="View Document">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="Download">
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'certifications' && (
          <motion.div key="certifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {certs.loading ? <LoadingSkeleton rows={5} cols={5} /> : certs.error ? <ErrorState message={certs.error} onRetry={certs.refetch} /> :
            !filteredCerts.length ? <EmptyState message="No certifications found" /> : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Staff Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Certification</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Issue Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Expiry Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCerts.map((cert: any, i: number) => (
                        <tr key={cert.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-bold">
                                {(cert.staff_name || cert.full_name || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-800">{cert.staff_name || cert.full_name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{cert.certification_name || cert.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(cert.issue_date)}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(cert.expiry_date)}</td>
                          <td className="px-4 py-3">{getStatusBadge(cert.status || 'active')}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title="View Details">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="Download">
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'training' && (
          <motion.div key="training" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {training.loading ? <LoadingSkeleton rows={5} cols={5} /> : training.error ? <ErrorState message={training.error} onRetry={training.refetch} /> :
            !filteredTraining.length ? <EmptyState message="No training programs found" /> : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Program Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Participants</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTraining.map((prog: any, i: number) => (
                        <tr key={prog.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
                                <GraduationCap size={13} />
                              </div>
                              <span className="font-semibold text-gray-800">{prog.program_name || prog.name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{prog.participants ?? prog.participant_count ?? '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Calendar size={12} />
                              {formatDate(prog.date || prog.start_date)}
                            </div>
                          </td>
                          <td className="px-4 py-3">{getTrainingStatusBadge(prog.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title="View Details">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all" title="Add Participants">
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
