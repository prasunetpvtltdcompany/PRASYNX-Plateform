'use client';

import { useState, useEffect } from 'react';
import { useApi } from './lib/useApi';
import { staffAttendanceApi } from './lib/dataService';
import { auth } from './lib/auth';
import { 
  ClipboardList, Search, RefreshCw, Save, Check, Calendar, 
  ArrowUpRight, Download, Printer, User, Filter, SlidersHorizontal,
  ChevronLeft, ChevronRight, Upload, AlertCircle, Clock, CheckCircle2, XCircle, Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Constants
const STATUSES = [
  'Present', 'Absent', 'Late', 'Half Day', 
  'Leave', 'Holiday', 'Work From Home', 'Official Duty', 'Training'
];

const STATUS_COLORS: Record<string, string> = {
  'Not Marked': 'bg-gray-100 text-gray-500 hover:bg-gray-200',
  Present: 'bg-green-100 text-green-700 hover:bg-green-200',
  Absent: 'bg-red-100 text-red-700 hover:bg-red-200',
  Late: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  'Half Day': 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  Leave: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  Holiday: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'Work From Home': 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  'Official Duty': 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  Training: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
};

export default function StaffAttendanceTab({ staffList: staffListInput }: { staffList?: any }) {
  const staffList = Array.isArray(staffListInput) 
    ? staffListInput 
    : Array.isArray(staffListInput?.data) 
      ? staffListInput.data 
      : [];

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmpType, setFilterEmpType] = useState('');
  const [filterEmpId, setFilterEmpId] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  
  // Show advanced filters toggle
  const [showFilters, setShowFilters] = useState(false);

  // In-memory editable attendance state
  const [roster, setRoster] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Selected staff history state for Calendar Heatmap
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedStaffName, setSelectedStaffName] = useState<string>('');
  const [staffHistory, setStaffHistory] = useState<any[]>([]);
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear());
  const [historyMonth, setHistoryMonth] = useState(new Date().getMonth() + 1); // 1-indexed

  // CSV Import State
  const [csvFile, setCsvFile] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Use API hooks to fetch roster for selected date
  const attendanceData = useApi(() => staffAttendanceApi.getAll(selectedDate), [selectedDate]);

  // Synchronize local roster state when API returns data
  useEffect(() => {
    if (attendanceData.data) {
      setRoster(JSON.parse(JSON.stringify(attendanceData.data)));
    }
  }, [attendanceData.data]);

  // Sync / load selected staff history when selectedStaffId changes
  useEffect(() => {
    async function loadHistory() {
      if (!selectedStaffId) return;
      try {
        // We reuse the teacher attendance history route which resolves user_id appropriately
        const res = await staffAttendanceApi.getAll('');
        const token = auth.getToken() || '';
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api';
        
        const fetchUrl = `${base}/teacher/attendance/${selectedStaffId}`;
        const response = await fetch(fetchUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setStaffHistory(json.data);
        } else {
          setStaffHistory([]);
        }
      } catch (err) {
        console.error('Error fetching staff history', err);
        setStaffHistory([]);
      }
    }
    loadHistory();
  }, [selectedStaffId, historyYear, historyMonth]);

  // Auto calculate working hours if check_in and check_out are present
  const calculateHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return null;
    try {
      const [inH, inM] = inTime.split(':').map(Number);
      const [outH, outM] = outTime.split(':').map(Number);
      const diffMins = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMins <= 0) return 0;
      return parseFloat((diffMins / 60).toFixed(2));
    } catch {
      return null;
    }
  };

  const handleRowChange = (staffId: string, field: string, value: any) => {
    setRoster(prev => prev.map(row => {
      if (row.staff_id === staffId) {
        const updated = { ...row, [field]: value };
        if (field === 'check_in' || field === 'check_out') {
          const hours = calculateHours(updated.check_in, updated.check_out);
          updated.working_hours = hours;
        }
        return updated;
      }
      return row;
    }));
  };

  // Bulk marking functions
  const markAllStatus = (status: string) => {
    setRoster(prev => prev.map(row => {
      const updated = { ...row, status };
      if (status === 'Present') {
        updated.check_in = '09:00';
        updated.check_out = '17:00';
        updated.working_hours = 8.00;
      } else if (status === 'Absent' || status === 'Leave' || status === 'Holiday') {
        updated.check_in = null;
        updated.check_out = null;
        updated.working_hours = null;
      }
      return updated;
    }));
    toast.info(`Marked all visible staff as ${status}`);
  };

  // Individual save or approve
  const handleSaveRecord = async (row: any) => {
    try {
      const payload = {
        check_in: row.check_in,
        check_out: row.check_out,
        working_hours: row.working_hours,
        status: row.status,
        remarks: row.remarks,
        is_approved: true // Approved by the current manager saving it
      };
      
      let res;
      if (row.id) {
        res = await staffAttendanceApi.updateRecord(row.id, payload);
      } else {
        // Need to save via daily bulk list with just this single record
        res = await staffAttendanceApi.save(selectedDate, [row]);
      }

      if (res.success) {
        toast.success(`Updated record for ${row.employee_name}`);
        attendanceData.refetch();
      } else {
        toast.error(res.error || 'Failed to update record');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  // Delete a single attendance record
  const handleDeleteRecord = async (row: any) => {
    if (!row.id) return;
    if (!confirm(`Delete attendance record for ${row.employee_name}? This cannot be undone.`)) return;
    try {
      const res = await staffAttendanceApi.deleteRecord(row.id);
      if (res.success) {
        toast.success('Attendance record deleted');
        attendanceData.refetch();
      } else {
        toast.error(res.error || 'Failed to delete record');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while deleting');
    }
  };

  // Bulk save all roster records
  const handleSaveRoster = async () => {
    setIsSaving(true);
    try {
      const res = await staffAttendanceApi.save(selectedDate, roster);
      if (res.success) {
        toast.success('Roster saved successfully');
        attendanceData.refetch();
      } else {
        toast.error(res.error || 'Failed to save roster');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving roster');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter roster
  const filteredRoster = roster.filter(row => {
    if (row.status === 'Not Marked') return false;
    if (search && !row.employee_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterEmpId && !row.employee_id?.toLowerCase().includes(filterEmpId.toLowerCase())) return false;
    if (filterDept && row.department !== filterDept) return false;
    if (filterRole && row.role !== filterRole) return false;
    if (filterStatus && row.status !== filterStatus) return false;
    if (filterDesignation && !row.designation?.toLowerCase().includes(filterDesignation.toLowerCase())) return false;
    if (filterEmpType && row.employment_type !== filterEmpType) return false;
    return true;
  });

  // Calculate dynamic KPIs based on the daily roster
  const totalStaff = roster.length;
  const presentCount = roster.filter(r => ['Present', 'Work From Home', 'Official Duty', 'Training', 'Late', 'Half Day'].includes(r.status)).length;
  const absentCount = roster.filter(r => r.status === 'Absent').length;
  const lateCount = roster.filter(r => r.status === 'Late').length;
  const leaveCount = roster.filter(r => r.status === 'Leave').length;
  const notMarkedCount = roster.filter(r => r.status === 'Not Marked').length;
  const attendanceRate = (totalStaff - notMarkedCount) > 0 ? Math.round((presentCount / (totalStaff - notMarkedCount)) * 100) : 0;

  // Chart Data: Department Breakdown
  const deptStats: Record<string, { present: number; total: number }> = {};
  roster.forEach(r => {
    const dept = r.department || 'General';
    if (!deptStats[dept]) deptStats[dept] = { present: 0, total: 0 };
    deptStats[dept].total += 1;
    if (['Present', 'Work From Home', 'Official Duty', 'Training', 'Late', 'Half Day'].includes(r.status)) {
      deptStats[dept].present += 1;
    }
  });
  const deptChartData = Object.keys(deptStats).map(name => ({
    name,
    Present: deptStats[name].present,
    Total: deptStats[name].total,
    Rate: deptStats[name].total > 0 ? Math.round((deptStats[name].present / deptStats[name].total) * 100) : 0
  }));

  // Chart Data: Monthly Attendance Trends (Mock data layered over actual daily rate)
  const trendData = [
    { name: 'Mon', Rate: 88 },
    { name: 'Tue', Rate: 92 },
    { name: 'Wed', Rate: 95 },
    { name: 'Thu', Rate: attendanceRate || 90 },
    { name: 'Fri', Rate: 89 },
    { name: 'Sat', Rate: 84 },
  ];

  // CSV Exporter
  const handleExportCSV = () => {
    try {
      const headers = ['Employee ID', 'Employee Name', 'Department', 'Role', 'Status', 'Check In', 'Check Out', 'Working Hours', 'Remarks', 'Approved By'];
      const rows = filteredRoster.map(r => [
        r.employee_id,
        r.employee_name,
        r.department,
        r.role,
        r.status,
        r.check_in || '—',
        r.check_out || '—',
        r.working_hours || '—',
        r.remarks || '',
        r.approved_by ? 'Approved' : 'Pending'
      ]);

      const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Staff_Attendance_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Roster exported to CSV');
    } catch {
      toast.error('CSV Export failed');
    }
  };

  // CSV Importer Parser
  const handleCsvImport = () => {
    if (!csvFile.trim()) {
      toast.error('Please paste valid CSV contents');
      return;
    }
    try {
      const lines = csvFile.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error('No data rows found');
      
      const header = lines[0].toLowerCase().split(',');
      const idIdx = header.findIndex(h => h.includes('id') || h.includes('code'));
      const statusIdx = header.findIndex(h => h.includes('status'));
      const checkInIdx = header.findIndex(h => h.includes('in'));
      const checkOutIdx = header.findIndex(h => h.includes('out'));
      const remarksIdx = header.findIndex(h => h.includes('remark') || h.includes('note'));

      if (idIdx === -1 || statusIdx === -1) {
        throw new Error('CSV must contain headers for Employee ID/Code and Status');
      }

      let parsedCount = 0;
      const updatedRoster = roster.map(row => {
        // Find matching row in CSV
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          const csvEmpId = cols[idIdx];
          if (csvEmpId && (row.employee_id === csvEmpId || row.staff_id === csvEmpId)) {
            const csvStatus = cols[statusIdx];
            const matchingStatus = STATUSES.find(s => s.toLowerCase() === csvStatus?.toLowerCase()) || 'Present';
            parsedCount++;
            return {
              ...row,
              status: matchingStatus,
              check_in: checkInIdx !== -1 ? cols[checkInIdx] || null : row.check_in,
              check_out: checkOutIdx !== -1 ? cols[checkOutIdx] || null : row.check_out,
              remarks: remarksIdx !== -1 ? cols[remarksIdx] || '' : row.remarks,
              working_hours: checkInIdx !== -1 && checkOutIdx !== -1 
                ? calculateHours(cols[checkInIdx], cols[checkOutIdx]) 
                : row.working_hours
            };
          }
        }
        return row;
      });

      setRoster(updatedRoster);
      setShowImportModal(false);
      setCsvFile('');
      toast.success(`Successfully mapped ${parsedCount} records from CSV. Don't forget to Save!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse CSV format');
    }
  };

  // Calendar Heatmap Grid Math
  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  
  const daysInMonth = getDaysInMonth(historyYear, historyMonth);
  const startDayOffset = getFirstDayOfMonth(historyYear, historyMonth);
  
  const calendarCells = [];
  // Empty offset cells
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push(null);
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Find attendance record for a specific day in history
  const getDayHistory = (dayNum: number) => {
    if (!dayNum) return null;
    const dateStr = `${historyYear}-${String(historyMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    // Staff history records return `date` as YYYY-MM-DD
    return staffHistory.find(h => h.date === dateStr);
  };

  // Print helper
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const rowsHtml = filteredRoster.map(r => `
      <tr>
        <td>${r.employee_id}</td>
        <td>${r.employee_name}</td>
        <td>${r.department}</td>
        <td>${r.role}</td>
        <td>${r.status}</td>
        <td>${r.check_in || '—'}</td>
        <td>${r.check_out || '—'}</td>
        <td>${r.working_hours || '—'}</td>
        <td>${r.remarks || ''}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Staff Attendance Report - ${selectedDate}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; color: #1f2937; }
            h1 { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
            p { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 8px; border: 1px solid #e5e7eb; }
            td { padding: 8px; border: 1px solid #e5e7eb; }
            tr:nth-child(even) { background: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Staff Attendance Roster</h1>
          <p>Generated Date: ${selectedDate} | Total Staff: ${totalStaff} | Attendance Rate: ${attendanceRate}%</p>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-[#6D4CFF]" size={22} />
            Staff Attendance Center
          </h2>
          <p className="text-xs text-gray-500">Monitor daily attendance, manage corrections, view monthly trends, and run rosters.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => attendanceData.refetch()} 
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            title="Refresh logs"
          >
            <RefreshCw size={15} />
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Printer size={14} /> Print
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <Upload size={14} /> Import CSV
          </button>

          <button
            onClick={handleSaveRoster}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6D4CFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5B3FDD] transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save Roster'}
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition">
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Total Staff</div>
          <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-2">{totalStaff}</div>
          <div className="text-[10px] text-gray-400 font-medium mt-1">Active Accounts</div>
        </Card>
        
        <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition">
          <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Present Today</div>
          <div className="text-2xl font-extrabold text-green-600 mt-2">{presentCount}</div>
          <div className="text-[10px] text-green-500 font-medium mt-1">On-duty/Present</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition">
          <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Absent Today</div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">{absentCount}</div>
          <div className="text-[10px] text-red-400 font-medium mt-1">Unexcused Absences</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition">
          <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Late Today</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{lateCount}</div>
          <div className="text-[10px] text-amber-400 font-medium mt-1">Late arrivals</div>
        </Card>

        <Card className="p-4 bg-white border border-gray-100 flex flex-col justify-between hover:shadow-md transition text-purple-700">
          <div className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">On Leave</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-2">{leaveCount}</div>
          <div className="text-[10px] text-purple-400 font-medium mt-1">Approved Leaves</div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-md transition">
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Attendance Rate</div>
          <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-2">{attendanceRate}%</div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#6D4CFF] h-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </Card>
      </div>

      {/* ANALYTICS CHARTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Attendance Rate Bar Chart */}
        <Card className="p-4 lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">Department Wise Attendance Rate</h3>
          <div className="h-60">
            {deptChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No department stats available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val, name) => [name === 'Rate' ? `${val}%` : val, name]}
                  />
                  <Bar dataKey="Rate" name="Attendance Rate" fill="#6D4CFF" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Weekly Trend Area Chart */}
        <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">Weekly Attendance Trend (%)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6D4CFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Rate" stroke="#6D4CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* FILTER & BULK CONTROLS */}
      <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main search and date */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs">
              <Calendar size={14} className="text-gray-400" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                className="bg-transparent dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200 focus:outline-none" 
              />
            </div>
            
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search staff name..."
                className="pl-9 pr-4 py-2 w-56 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold transition ${
                showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={13} /> {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
          </div>

          {/* Quick Bulk marking desk */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Bulk Mark:</span>
            <button
              onClick={() => markAllStatus('Present')}
              className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold rounded-lg transition"
            >
              All Present
            </button>
            <button
              onClick={() => markAllStatus('Absent')}
              className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg transition"
            >
              All Absent
            </button>
            <button
              onClick={() => {
                const remarks = prompt('Enter remarks for bulk update:');
                if (remarks !== null) {
                  setRoster(prev => prev.map(row => ({ ...row, remarks })));
                  toast.success('Remarks updated for all staff');
                }
              }}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-lg border border-gray-200 transition"
            >
              Bulk Remarks
            </button>
          </div>
        </div>

        {/* ADVANCED FILTERS PANEL */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Employee ID</label>
              <input 
                type="text" 
                value={filterEmpId} 
                onChange={e => setFilterEmpId(e.target.value)}
                placeholder="e.g. STF-001"
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Department</label>
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:outline-none"
              >
                <option value="">All Departments</option>
                {Array.from(new Set(roster.map(r => r.department).filter(Boolean))).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">System Role</label>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="management">Management</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:outline-none"
              >
                <option value="">All Statuses</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Employment Type</label>
              <select
                value={filterEmpType}
                onChange={e => setFilterEmpType(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* TWO COLUMN CONTENT PANEL: DAILY ROSTER SHEET & MONTHLY HEATMAP/CALENDAR */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* DAILY ROSTER SHEET */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Daily Roster Sheet</span>
              <span className="text-[10px] text-gray-400">Showing {filteredRoster.length} staff members</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Employee ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Employee Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Department / Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Check In</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Check Out</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Working Hrs</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Remarks / Correction</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {attendanceData.loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-400 text-xs">Loading attendance roster...</td>
                    </tr>
                  ) : filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-400 text-xs">No attendance marked for this date yet. Records appear here once attendance is marked.</td>
                    </tr>
                  ) : (
                    filteredRoster.map(row => (
                      <tr key={row.staff_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                        {/* ID */}
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{row.employee_id}</td>
                        
                        {/* Name */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button 
                            onClick={() => {
                              setSelectedStaffId(row.staff_id);
                              setSelectedStaffName(row.employee_name);
                            }}
                            className="text-left text-[#6D4CFF] hover:underline font-semibold flex items-center gap-1.5"
                          >
                            <User size={13} className="text-gray-400" />
                            {row.employee_name}
                          </button>
                        </td>

                        {/* Dept/Role */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-gray-700 dark:text-gray-200">{row.department}</div>
                          <div className="text-[10px] text-gray-400 capitalize">{row.role} • {row.designation}</div>
                        </td>

                        {/* Status Select */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={row.status}
                            onChange={e => handleRowChange(row.staff_id, 'status', e.target.value)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer focus:ring-2 focus:ring-[#6D4CFF]/20 ${
                              STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {STATUSES.map(st => (
                              <option key={st} value={st} className="bg-white text-gray-700 font-normal">{st}</option>
                            ))}
                          </select>
                        </td>

                        {/* Check In */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="time"
                            value={row.check_in || ''}
                            onChange={e => handleRowChange(row.staff_id, 'check_in', e.target.value || null)}
                            disabled={['Absent', 'Leave', 'Holiday'].includes(row.status)}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#6D4CFF] disabled:bg-gray-50 disabled:text-gray-400 w-24"
                          />
                        </td>

                        {/* Check Out */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="time"
                            value={row.check_out || ''}
                            onChange={e => handleRowChange(row.staff_id, 'check_out', e.target.value || null)}
                            disabled={['Absent', 'Leave', 'Holiday'].includes(row.status)}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#6D4CFF] disabled:bg-gray-50 disabled:text-gray-400 w-24"
                          />
                        </td>

                        {/* Calculated Hours */}
                        <td className="px-4 py-3 text-center whitespace-nowrap font-medium text-gray-700 dark:text-gray-200">
                          {row.working_hours != null ? `${row.working_hours} hrs` : '—'}
                        </td>

                        {/* Remarks & Corrections indicator */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={row.remarks || ''}
                              onChange={e => handleRowChange(row.staff_id, 'remarks', e.target.value)}
                              placeholder="Add remarks..."
                              className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#6D4CFF] w-full min-w-[120px]"
                            />
                            {row.id && !row.approved_by && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-md self-start mt-0.5">
                                <Clock size={10} /> Pending Approval
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleSaveRecord(row)}
                              className="p-1.5 rounded-lg bg-purple-50 text-[#6D4CFF] hover:bg-purple-100 transition"
                              title="Save or Approve"
                            >
                              <Check size={14} />
                            </button>
                            {row.id && (
                              <button
                                onClick={() => handleDeleteRecord(row)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* MONTHLY CALENDAR HEATMAP */}
        <div className="xl:col-span-1">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="text-[#6D4CFF]" size={15} />
                Staff History Log
              </h3>
              {selectedStaffId && (
                <button 
                  onClick={() => { setSelectedStaffId(null); setStaffHistory([]); }} 
                  className="text-[10px] text-gray-400 hover:text-red-500"
                >
                  Clear
                </button>
              )}
            </div>

            {!selectedStaffId ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <User className="mx-auto text-gray-300" size={28} />
                <p className="text-xs">Click on any staff member's name in the table to display their calendar history log.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Staff Detail */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{selectedStaffName}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Calendar Heatmap Log</div>
                </div>

                {/* Calendar Navigation */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => {
                      if (historyMonth === 1) {
                        setHistoryMonth(12);
                        setHistoryYear(historyYear - 1);
                      } else {
                        setHistoryMonth(historyMonth - 1);
                      }
                    }}
                    className="p-1 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {new Date(historyYear, historyMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => {
                      if (historyMonth === 12) {
                        setHistoryMonth(1);
                        setHistoryYear(historyYear + 1);
                      } else {
                        setHistoryMonth(historyMonth + 1);
                      }
                    }}
                    className="p-1 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Week Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* Grid cells */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="h-7 w-full bg-transparent"></div>;
                    }

                    const hist = getDayHistory(day);
                    let cellBg = 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200';
                    let tooltip = `Day ${day}: No Record`;

                    if (hist) {
                      const statusClean = hist.status?.toLowerCase();
                      if (statusClean === 'present') {
                        cellBg = 'bg-green-500 text-white hover:bg-green-600';
                      } else if (statusClean === 'late') {
                        cellBg = 'bg-amber-500 text-white hover:bg-amber-600';
                      } else if (statusClean === 'absent') {
                        cellBg = 'bg-red-500 text-white hover:bg-red-600';
                      } else if (['leave', 'half day'].includes(statusClean)) {
                        cellBg = 'bg-purple-500 text-white hover:bg-purple-600';
                      } else {
                        cellBg = 'bg-blue-500 text-white hover:bg-blue-600';
                      }
                      tooltip = `${day}: ${hist.status} (${hist.check_in || '—'} - ${hist.check_out || '—'})`;
                    }

                    return (
                      <div 
                        key={`day-${day}`} 
                        className={`h-7 w-full rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition ${cellBg}`}
                        title={tooltip}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Legend</div>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-green-500 rounded-sm"></span> Present</div>
                    <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-amber-500 rounded-sm"></span> Late</div>
                    <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-red-500 rounded-sm"></span> Absent</div>
                    <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-purple-500 rounded-sm"></span> Leave/Half</div>
                    <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-blue-500 rounded-sm"></span> Others</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="bg-white border border-gray-200 p-6 max-w-md w-full mx-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Upload className="text-[#6D4CFF]" size={16} />
                Import Attendance from CSV
              </h3>
              <button 
                onClick={() => { setShowImportModal(false); setCsvFile(''); }}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold p-1 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Paste your CSV content below. CSV must contain at least the headers <strong className="text-gray-700">id</strong> or <strong className="text-gray-700">employee_id</strong>, and <strong className="text-gray-700">status</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Paste CSV Data</label>
              <textarea
                value={csvFile}
                onChange={e => setCsvFile(e.target.value)}
                placeholder="employee_id,status,check_in,check_out,remarks&#10;STF-001,Present,09:12,17:05,Shift okay&#10;STF-002,Late,09:45,17:00,Heavy traffic"
                rows={6}
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowImportModal(false); setCsvFile(''); }}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvImport}
                className="px-4 py-2 bg-[#6D4CFF] text-white text-xs font-semibold rounded-xl hover:bg-[#5B3FDD] transition"
              >
                Map and Merge
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
