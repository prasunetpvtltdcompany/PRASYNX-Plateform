'use client';

import { useState } from 'react';
import { useApi } from './useApi';
import { auditApiV4 } from './dataService';
import { Shield, RefreshCw, CheckCircle, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ValidationAuditTab() {
  const [run, setRun] = useState(false);
  const audit = useApi(() => run ? auditApiV4.runAll() : Promise.resolve({ success: true, data: { checks: [], scoring: { total: 0, passed: 0, failed: 0, warnings: 0, score: 0 } } }), [run]);

  const data = audit.data as any;
  const checks = data?.checks || [];
  const scoring = data?.scoring || { total: 0, passed: 0, failed: 0, warnings: 0, score: 0 };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Validation Audit</h2>
          <p className="text-xs text-gray-500">Run 16 integrity checks against your data</p>
        </div>
        <button
          onClick={() => { setRun(true); setTimeout(() => setRun(false), 100); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]"
        >
          <RefreshCw size={14} /> Run Audit
        </button>
      </div>

      {checks.length > 0 && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div className="text-2xl font-bold text-purple-700">{scoring.total}</div>
            <div className="text-[10px] text-purple-500 font-medium mt-1">Total Checks</div>
          </div>
          <div className="p-4 rounded-xl bg-green-50 border border-green-100">
            <div className="text-2xl font-bold text-green-700">{scoring.passed}</div>
            <div className="text-[10px] text-green-500 font-medium mt-1">Passed</div>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="text-2xl font-bold text-red-700">{scoring.failed}</div>
            <div className="text-[10px] text-red-500 font-medium mt-1">Failed</div>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
            <div className="text-2xl font-bold text-yellow-700">{scoring.warnings}</div>
            <div className="text-[10px] text-yellow-500 font-medium mt-1">Warnings</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-2xl font-bold text-blue-700">{(scoring.score * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-blue-500 font-medium mt-1">Integrity Score</div>
          </div>
        </div>
      )}

      {audit.loading && <div className="text-center py-8 text-gray-400 text-xs">Running 16 integrity checks...</div>}

      {!audit.loading && checks.length === 0 && !run && (
        <div className="text-center py-16 text-gray-400">
          <Shield size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Click "Run Audit" to validate your data</p>
          <p className="text-xs mt-1">16 checks: orphan records, duplicates, missing data, status mismatches & more</p>
        </div>
      )}

      {!audit.loading && checks.length > 0 && (
        <div className="space-y-2">
          {checks.map((check: any, i: number) => (
            <div key={i} className={`p-4 rounded-xl border ${
              check.status === 'pass' ? 'bg-green-50/50 border-green-100' :
              check.status === 'fail' ? 'bg-red-50/50 border-red-100' :
              'bg-yellow-50/50 border-yellow-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {check.status === 'pass' ? <CheckCircle size={16} className="text-green-500" /> :
                   check.status === 'fail' ? <XCircle size={16} className="text-red-500" /> :
                   <AlertTriangle size={16} className="text-yellow-500" />}
                  <span className="text-xs font-semibold text-gray-700">{check.check}</span>
                </div>
                {check.count != null && (
                  <Badge className={
                    check.status === 'pass' ? 'bg-green-100 text-green-700' :
                    check.status === 'fail' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>{check.count}</Badge>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 ml-6">{check.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
