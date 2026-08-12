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
  Briefcase, Users, GitPullRequest, Search, Plus, RefreshCw, Eye,
  Download, Calendar, ArrowRight
} from 'lucide-react';

const TABS = [
  { key: 'postings', labelKey: 'mod.jobPostings', icon: Briefcase },
  { key: 'applicants', labelKey: 'mod.applicants', icon: Users },
  { key: 'pipeline', labelKey: 'mod.hiringPipeline', icon: GitPullRequest },
];

const PIPELINE_STAGES = [
  { key: 'applied', labelKey: 'mod.applied', color: 'bg-blue-500' },
  { key: 'screening', labelKey: 'mod.screening', color: 'bg-indigo-500' },
  { key: 'interview', labelKey: 'mod.interview', color: 'bg-purple-500' },
  { key: 'offer', labelKey: 'mod.offer', color: 'bg-amber-500' },
  { key: 'hired', labelKey: 'mod.hired', color: 'bg-emerald-500' },
];

function getStatusBadge(status: string, variant: 'posting' | 'applicant' = 'posting') {
  const s = (status || '').toLowerCase();
  if (variant === 'posting') {
    if (s === 'open') return <Badge variant="success" className="text-[10px]">Open</Badge>;
    if (s === 'closed') return <Badge variant="default" className="text-[10px]">Closed</Badge>;
    if (s === 'draft') return <Badge variant="warning" className="text-[10px]">Draft</Badge>;
    return <Badge className="text-[10px]">{status}</Badge>;
  }
  if (s === 'new' || s === 'applied') return <Badge variant="info" className="text-[10px]">New</Badge>;
  if (s === 'screening') return <Badge variant="warning" className="text-[10px]">Screening</Badge>;
  if (s === 'interview') return <Badge variant="info" className="text-[10px]">Interview</Badge>;
  if (s === 'offer') return <Badge variant="warning" className="text-[10px]">Offer</Badge>;
  if (s === 'hired') return <Badge variant="success" className="text-[10px]">Hired</Badge>;
  if (s === 'rejected') return <Badge variant="danger" className="text-[10px]">Rejected</Badge>;
  return <Badge className="text-[10px]">{status}</Badge>;
}

function formatDate(d: string) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

export function StaffRecruitment() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('postings');
  const [search, setSearch] = useState('');
  const [showAddPosting, setShowAddPosting] = useState(false);
  const [newPosting, setNewPosting] = useState({ title: '', department: '', description: '', location: '', type: 'full-time', vacancies: 1 });
  const [saving, setSaving] = useState(false);

  const recruitment = useApi(() => enterpriseStaffApi.getRecruitment(), [], true);

  const rawData = Array.isArray(recruitment.data?.data) ? recruitment.data.data : Array.isArray(recruitment.data) ? recruitment.data : [];

  const postings = rawData.filter((r: any) => r.type === 'posting' || r.job_title || r.title);
  const applicants = rawData.filter((r: any) => r.type === 'applicant' || r.applicant_name || r.name);

  const filterFn = (arr: any[]) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  };

  const filteredPostings = filterFn(postings);
  const filteredApplicants = filterFn(applicants);

  const handleAddPosting = async () => {
    if (!newPosting.title || !newPosting.department) {
      toast.error('Title and department are required');
      return;
    }
    setSaving(true);
    try {
      const res = await enterpriseStaffApi.addStaff({ ...newPosting, posting: true });
      if (res.success) {
        toast.success('Job posting created!');
        setShowAddPosting(false);
        setNewPosting({ title: '', department: '', description: '', location: '', type: 'full-time', vacancies: 1 });
        recruitment.refetch();
      } else {
        toast.error(res.error || 'Failed to create posting');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pipelineData = applicants.filter((a: any) =>
    ['applied', 'screening', 'interview', 'offer', 'hired'].includes((a.status || '').toLowerCase())
  );
  const pipelineCounts: Record<string, number> = {};
  PIPELINE_STAGES.forEach(s => {
    pipelineCounts[s.key] = pipelineData.filter((a: any) => (a.status || '').toLowerCase() === s.key).length;
  });

  return (
    <div>
      <div className="page-header">
        <h1>{t('mod.staffRecruitment')}</h1>
        <p>Manage job postings, applicants, and the hiring pipeline</p>
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
          {activeTab === 'postings' && (
            <button onClick={() => setShowAddPosting(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all">
              <Plus size={14} /> Add Posting
            </button>
          )}
          <button onClick={() => recruitment.refetch()}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'postings' && (
          <motion.div key="postings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {recruitment.loading ? <LoadingSkeleton rows={5} cols={5} /> : recruitment.error ? <ErrorState message={recruitment.error} onRetry={recruitment.refetch} /> :
            !filteredPostings.length ? <EmptyState message="No job postings found" /> : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Job Title</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Department</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Posted Date</th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Applicants</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPostings.map((post: any, i: number) => (
                        <tr key={post.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                                <Briefcase size={13} />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800">{post.job_title || post.title || '—'}</span>
                                {post.location && <span className="text-[10px] text-gray-400 block">{post.location}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{post.department || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(post.posted_date || post.created_at)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                              {post.applicant_count ?? post.applicants ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(post.status || 'open')}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title="View Details">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="View Applicants">
                                <Users size={14} />
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

        {activeTab === 'applicants' && (
          <motion.div key="applicants" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {recruitment.loading ? <LoadingSkeleton rows={5} cols={5} /> : recruitment.error ? <ErrorState message={recruitment.error} onRetry={recruitment.refetch} /> :
            !filteredApplicants.length ? <EmptyState message="No applicants found" /> : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Applicant Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Position</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Applied Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.map((app: any, i: number) => (
                        <tr key={app.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">
                                {(app.applicant_name || app.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800">{app.applicant_name || app.name || '—'}</span>
                                {app.email && <span className="text-[10px] text-gray-400 block">{app.email}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{app.position || app.job_title || app.title || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(app.applied_date || app.created_at)}</td>
                          <td className="px-4 py-3">{getStatusBadge(app.status || 'new', 'applicant')}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title="View Profile">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all" title="Download Resume">
                                <Download size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all" title="Move to Next Stage">
                                <ArrowRight size={14} />
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

        {activeTab === 'pipeline' && (
          <motion.div key="pipeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {recruitment.loading ? <LoadingSkeleton rows={3} cols={1} /> : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {PIPELINE_STAGES.map((stage, si) => (
                  <Card key={stage.key} className="p-4 min-h-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                        <h3 className="text-xs font-bold text-gray-800">{t(stage.labelKey)}</h3>
                      </div>
                      <span className="text-lg font-extrabold text-gray-900">{pipelineCounts[stage.key] || 0}</span>
                    </div>
                    <div className="space-y-2">
                      {pipelineData.filter((a: any) => (a.status || '').toLowerCase() === stage.key).slice(0, 4).map((app: any, ai: number) => (
                        <div key={app.id || ai} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 flex-shrink-0">
                              {(app.applicant_name || app.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold text-gray-800 truncate">{app.applicant_name || app.name || '—'}</p>
                              <p className="text-[9px] text-gray-400 truncate">{app.position || app.job_title || ''}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {pipelineCounts[stage.key] > 4 && (
                        <button className="w-full text-[10px] text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                          +{pipelineCounts[stage.key] - 4} more
                        </button>
                      )}
                      {pipelineCounts[stage.key] === 0 && (
                        <p className="text-[10px] text-gray-400 text-center py-4">No candidates</p>
                      )}
                    </div>
                    {si < PIPELINE_STAGES.length - 1 && (
                      <div className="hidden md:flex justify-center -mb-1 mt-2">
                        <ArrowRight size={14} className="text-gray-300" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showAddPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddPosting(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm">New Job Posting</h3>
              <button onClick={() => setShowAddPosting(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Job Title <span className="text-red-500">*</span></label>
                  <input type="text" value={newPosting.title} onChange={e => setNewPosting(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Senior Mathematics Teacher" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Department <span className="text-red-500">*</span></label>
                  <input type="text" value={newPosting.department} onChange={e => setNewPosting(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Science" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Location</label>
                  <input type="text" value={newPosting.location} onChange={e => setNewPosting(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Employment Type</label>
                  <select value={newPosting.type} onChange={e => setNewPosting(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Vacancies</label>
                  <input type="number" min={1} value={newPosting.vacancies} onChange={e => setNewPosting(p => ({ ...p, vacancies: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
                <textarea value={newPosting.description} onChange={e => setNewPosting(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white resize-none" placeholder="Brief description of the role..." />
              </div>
              <button onClick={handleAddPosting} disabled={saving}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
                {saving ? 'Creating...' : 'Create Job Posting'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
