'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Shield, Award, AlertTriangle, Building2, Users,
  CheckCircle2, XCircle, Clock, Search, FileText
} from 'lucide-react';

const TABS = ['Certifications', 'Compliance Status', 'Audits'] as const;
type TabKey = typeof TABS[number];

const TAB_TRANSLATIONS: Record<TabKey, string> = {
  Certifications: 'mod.certifications', 'Compliance Status': 'mod.complianceStatus', Audits: 'mod.audits',
};

function getCertBadge(status: string, expiry?: string) {
  const s = (status || '').toLowerCase();
  if (s === 'verified' || s === 'active') return 'success';
  if (s === 'expired' || s === 'revoked') return 'danger';
  if (s === 'pending' || s === 'pending verification') return 'warning';
  if (expiry && new Date(expiry) < new Date()) return 'danger';
  return 'default';
}

function getCompliancePctColor(pct: number) {
  if (pct >= 90) return 'text-green-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-red-600';
}

function getComplianceBarColor(pct: number) {
  if (pct >= 90) return '#10B981';
  if (pct >= 70) return '#F59E0B';
  return '#EF4444';
}

const auditActions = [
  { action: 'Certification Verified', severity: 'info', icon: CheckCircle2, color: '#10B981' },
  { action: 'Certification Expired', severity: 'high', icon: XCircle, color: '#EF4444' },
  { action: 'Document Submitted', severity: 'info', icon: FileText, color: '#3B82F6' },
  { action: 'Compliance Review', severity: 'medium', icon: Shield, color: '#F59E0B' },
  { action: 'Audit Flagged', severity: 'critical', icon: AlertTriangle, color: '#EF4444' },
];

export function StaffCompliance() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [certSearch, setCertSearch] = useState('');

  const certifications = useApi(() => enterpriseStaffApi.getCertifications(), []);
  const lifecycle = useApi(() => enterpriseStaffApi.getStaffLifecycle(), []);

  const certList = useMemo(() => {
    let list = Array.isArray(certifications.data?.data) ? certifications.data.data : Array.isArray(certifications.data) ? certifications.data : [];
    if (certSearch) {
      const q = certSearch.toLowerCase();
      list = list.filter((c: any) => (c.staff_name || c.name || '').toLowerCase().includes(q) || (c.certification || c.cert_name || '').toLowerCase().includes(q));
    }
    return list;
  }, [certifications.data, certSearch]);

  const complianceData = useMemo(() => {
    const raw = lifecycle.data?.data || lifecycle.data || {};
    return Array.isArray(raw.compliance) ? raw.compliance : Array.isArray(raw) ? raw : [];
  }, [lifecycle.data]);

  const auditLogs = useMemo(() => {
    const raw = lifecycle.data?.data || lifecycle.data || {};
    const logs = Array.isArray(raw.audit_logs) ? raw.audit_logs : Array.isArray(raw.audits) ? raw.audits : [];
    return logs.slice(0, 20);
  }, [lifecycle.data]);

  const loading = certifications.loading || lifecycle.loading;
  const error = certifications.error || lifecycle.error;

  if (loading) return <div className="w-full"><LoadingSkeleton rows={3} cols={4} /></div>;
  if (error) return <ErrorState message={error} onRetry={() => { certifications.refetch(); lifecycle.refetch(); }} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Staff Compliance</h1>
        <p>Track certifications, department compliance status, and audit trails</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t(TAB_TRANSLATIONS[tab])}
          </button>
        ))}
      </div>

      {/* Tab: Certifications */}
      {activeTab === 0 && (
        <>
          <Card className="p-4 mb-6">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={certSearch} onChange={e => setCertSearch(e.target.value)}
                placeholder="Search by staff name or certification..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
            </div>
          </Card>

          {certList.length === 0 ? (
            <EmptyState message="No certifications found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">Staff Name</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">Certification</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">Issue Date</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">Expiry Date</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certList.map((cert: any, idx: number) => {
                    const name = cert.staff_name || cert.name || 'Unknown';
                    const certName = cert.certification || cert.cert_name || cert.document_type || 'Certification';
                    const issue = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : '—';
                    const expiry = cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : '—';
                    const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                    const status = isExpired ? 'expired' : (cert.status || 'pending');
                    const badgeVariant = getCertBadge(status, cert.expiry_date);

                    return (
                      <motion.tr key={cert.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-3 font-medium text-gray-900">{name}</td>
                        <td className="py-3 px-3 text-gray-700">{certName}</td>
                        <td className="py-3 px-3 text-gray-500">{issue}</td>
                        <td className={`py-3 px-3 ${isExpired ? 'text-red-500 font-medium' : 'text-gray-500'}`}>{expiry}</td>
                        <td className="py-3 px-3">
                          <Badge variant={badgeVariant} className="capitalize text-[10px]">{status}</Badge>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab: Compliance Status */}
      {activeTab === 1 && (
        complianceData.length === 0 ? (
          <EmptyState message="No compliance data available" />
        ) : (
          <div className="space-y-4">
            {complianceData.map((dept: any, idx: number) => {
              const total = dept.total_staff || dept.staff_count || 0;
              const compliant = dept.compliant_staff || dept.compliant || 0;
              const pct = total > 0 ? Math.round((compliant / total) * 100) : 0;
              const pending = dept.pending_items || dept.pending || 0;

              return (
                <motion.div key={dept.id || dept.name || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#6D4CFF] flex-shrink-0"><Building2 size={18} /></div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{dept.name || dept.department || 'Department'}</div>
                          <div className="text-[11px] text-gray-500">{total} staff members</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className={`text-lg font-extrabold ${getCompliancePctColor(pct)}`}>{pct}%</div>
                          <div className="text-[10px] text-gray-400">Compliant</div>
                        </div>
                        <div className="w-24">
                          <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              className="h-full rounded-full transition-all duration-700"
                              style={{ background: getComplianceBarColor(pct) }} />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-extrabold text-amber-500">{pending}</div>
                          <div className="text-[10px] text-gray-400">Pending</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )
      )}

      {/* Tab: Audits */}
      {activeTab === 2 && (
        auditLogs.length === 0 ? (
          <EmptyState message="No audit log entries" />
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log: any, idx: number) => {
              const match = auditActions.find(a => log.action?.toLowerCase().includes(a.action.toLowerCase()));
              const Icon = match?.icon || Shield;
              const color = match?.color || '#6D4CFF';
              const severity = log.severity || log.level || 'info';
              const sevBadge = severity === 'critical' || severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'default';

              return (
                <motion.div key={log.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Card className="p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, color }}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-900">{log.action || log.event || 'Audit Event'}</span>
                          <Badge variant={sevBadge} className="text-[9px] capitalize">{severity}</Badge>
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {log.description || log.details || log.message || 'No details'}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                          <span>{log.performed_by || log.user || log.actor || 'System'}</span>
                          <span>{log.timestamp || log.created_at ? new Date(log.timestamp || log.created_at).toLocaleString() : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
