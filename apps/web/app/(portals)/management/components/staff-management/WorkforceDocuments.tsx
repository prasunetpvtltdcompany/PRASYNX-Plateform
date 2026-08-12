'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  FileText, Award, GraduationCap, Search, Download, Eye,
  CheckCircle2, XCircle, Clock, Plus, RefreshCw, Calendar,
  FileSpreadsheet, FileImage, File, Upload, Shield,
} from 'lucide-react';

const TABS = [
  { key: 'documents', labelKey: 'mod.documents', icon: FileText },
  { key: 'certifications', labelKey: 'mod.certifications', icon: Award },
  { key: 'training', labelKey: 'mod.trainingPrograms', icon: GraduationCap },
];

function getStatusBadge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'verified') return <Badge variant="success" className="text-[10px] flex items-center gap-1"><CheckCircle2 size={10} />Verified</Badge>;
  if (s === 'rejected') return <Badge variant="danger" className="text-[10px] flex items-center gap-1"><XCircle size={10} />Rejected</Badge>;
  return <Badge variant="warning" className="text-[10px] flex items-center gap-1"><Clock size={10} />Pending</Badge>;
}

function formatDate(d: string) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

export function WorkforceDocuments() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('documents');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const docs = useApi(() => enterpriseStaffApi.getStaffDocuments(), []);
  const certs = useApi(() => enterpriseStaffApi.getCertifications(), []);
  const training = useApi(() => enterpriseStaffApi.getTrainingPrograms(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const staffList = useMemo(() => {
    const raw = directory.data?.data || directory.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [directory.data]);

  const handleVerify = async (id: string) => {
    try {
      const res = await enterpriseStaffApi.verifyDocument(id, { status: 'verified' });
      if (res.success) { toast.success('Document verified'); docs.refetch(); }
      else toast.error(res.error || 'Verification failed');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUpload = async () => {
    try {
      const res = await enterpriseStaffApi.uploadDocument({ ...formData, organisation_id: '' });
      if (res.success) { toast.success('Document uploaded'); setShowUpload(false); setFormData({}); docs.refetch(); }
      else toast.error(res.error || 'Upload failed');
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

  if (isLoading) return <LoadingSkeleton rows={4} cols={4} />;
  if (docs.error) return <ErrorState message={docs.error} onRetry={docs.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>{t('mod.staffDocuments')}</h1>
        <p>Manage contracts, ID cards, certificates, and employment documents</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-[#6D4CFF]" />
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <tab.icon size={12} /> {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Upload size={14} /> Upload Document</button>
        </div>
      </Card>

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.length === 0 ? <div className="lg:col-span-3"><EmptyState message="No documents found" /></div> :
            filteredDocs.map((doc: any, i: number) => (
              <motion.div key={doc.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F0EDFF] text-[#6D4CFF] flex-shrink-0">
                    {doc.type?.toLowerCase().includes('contract') ? <FileText size={18} /> :
                     doc.type?.toLowerCase().includes('id') ? <Shield size={18} /> :
                     doc.type?.toLowerCase().includes('certificate') ? <Award size={18} /> :
                     <File size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">{doc.title || doc.name || doc.file_name || 'Document'}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{doc.type || 'General'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-400">{doc.staff_name || '—'}</span>
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleVerify(doc.id)} className="text-[10px] text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Verify</button>
                  <button onClick={() => toast.info('Downloading...')} className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1"><Download size={12} /> Download</button>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCerts.length === 0 ? <div className="lg:col-span-3"><EmptyState message="No certifications found" /></div> :
            filteredCerts.map((cert: any, i: number) => (
              <motion.div key={cert.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F0FDFA] text-[#10B981] flex-shrink-0"><Award size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900">{cert.title || cert.name || 'Certification'}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{cert.staff_name || cert.issued_by || '—'}</div>
                    <div className="text-[9px] text-gray-400">Expires: {formatDate(cert.expiry_date)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTraining.length === 0 ? <div className="lg:col-span-3"><EmptyState message="No training programs found" /></div> :
            filteredTraining.map((prog: any, i: number) => (
              <motion.div key={prog.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EFF6FF] text-[#3B82F6] flex-shrink-0"><GraduationCap size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900">{prog.title || prog.name || 'Training'}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{prog.trainer || '—'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-400">{formatDate(prog.start_date)} - {formatDate(prog.end_date)}</span>
                      <Badge variant={(prog.status || 'upcoming').toLowerCase() === 'completed' ? 'success' : 'info'} className="text-[8px]">{prog.status || 'Upcoming'}</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-sm">Upload Document</h3>
                <button onClick={() => setShowUpload(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Staff Member</label>
                  <select value={formData.staff_id || ''} onChange={e => setFormData({ ...formData, staff_id: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select staff</option>
                    {staffList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.name}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Document Type</label>
                  <select value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select type</option>
                    <option value="contract">Employment Contract</option>
                    <option value="id_card">ID Card</option>
                    <option value="certificate">Certificate</option>
                    <option value="degree">Degree / Diploma</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Title</label><input value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">File (URL)</label><input value={formData.file_url || ''} onChange={e => setFormData({ ...formData, file_url: e.target.value })} placeholder="https://..." className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
                <button onClick={handleUpload} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">Upload Document</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
