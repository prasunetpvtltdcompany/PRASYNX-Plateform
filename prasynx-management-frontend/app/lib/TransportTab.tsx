'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useApi, useForm } from './useApi';
import { transportApiV2, studentApi } from './dataService';
import {
  Bus, MapPin, Users, UserCheck, Navigation, DollarSign,
  Plus, Search, X, LayoutDashboard, Brain, FileSpreadsheet,
  Fuel, Wrench, ShieldCheck, CalendarClock, AlertTriangle,
  CheckCircle2, Trash2, Eye, Settings, TrendingUp, Route as RouteIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return value;
}

function SearchBox({ value, onChange, placeholder }: any) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]/50 transition-shadow"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function FilterChips({ options, value, onChange, emptyLabel = 'All' }: any) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange('')}
        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${value === '' ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
      >
        {emptyLabel}
      </button>
      {options.map((opt: string) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all ${value === opt ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {opt.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
}

function ResultCount({ total, shown }: any) {
  if (!shown) return null;
  return (
    <span className="text-[10px] text-gray-400 font-medium">
      Showing <span className="text-gray-600 font-bold">{shown}</span> of {total} records
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg, delay }: any) {
  return (
    <div className={`p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-3 hover-lift anim-fade-up ${delay || ''}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg, color }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-gray-900 leading-none truncate">{value}</div>
        <div className="text-[10px] text-gray-500 font-medium mt-1 truncate">{label}</div>
        {sub && <div className="text-[9px] text-gray-400 truncate">{sub}</div>}
      </div>
    </div>
  );
}

function DataTable({ columns, data, loading, empty }: any) {
  if (loading) return <div className="text-center py-10 text-gray-400 text-xs">Loading...</div>;
  if (!data?.length) return <div className="text-center py-10 text-gray-400 text-xs">{empty || 'No records found'}</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map((col: any) => (<th key={col.key} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{col.label}</th>))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={row.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
              {columns.map((col: any) => (<td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">{col.render ? col.render(row) : row[col.key] ?? '-'}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const NAVS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'vehicles', label: 'Vehicles', icon: Bus },
  { key: 'routes', label: 'Routes', icon: RouteIcon },
  { key: 'assignments', label: 'Assignments', icon: Users },
  { key: 'drivers', label: 'Drivers', icon: UserCheck },
  { key: 'gps', label: 'Live Tracking', icon: Navigation },
  { key: 'expenses', label: 'Expenses', icon: DollarSign },
  { key: 'reports', label: 'Reports', icon: FileSpreadsheet },
];

const VEHICLE_TYPES = ['bus', 'van', 'car', 'auto'];
const FUEL_TYPES = ['diesel', 'petrol', 'cng', 'electric'];
const VEHICLE_STATUS = ['active', 'maintenance', 'out_of_service', 'reserved'];
const EXPENSE_TYPES = ['fuel', 'maintenance', 'repair', 'insurance', 'permit', 'salary', 'other'];

const formatINR = (v: any) => '₹' + (Number(v) || 0).toLocaleString('en-IN');
const formatINRShort = (v: any) => {
  const n = Number(v) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const STATUS_STYLE: Record<string, { label: string; variant: any }> = {
  active: { label: 'Active', variant: 'success' },
  running: { label: 'Running', variant: 'success' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  out_of_service: { label: 'Out of Service', variant: 'danger' },
  reserved: { label: 'Reserved', variant: 'info' },
  inactive: { label: 'Inactive', variant: 'warning' },
};

const emptyVehicleForm = {
  vehicle_number: '', vehicle_type: 'bus', capacity: '40', driver_name: '', driver_phone: '',
  driver_license: '', route_id: '', fuel_type: 'diesel', status: 'active',
  last_service_date: '', insurance_expiry: '', permit_expiry: '',
};
const emptyRouteForm = {
  route_name: '', route_code: '', start_point: '', end_point: '', stops: '', distance: '', fee: '', status: 'active',
};
const emptyAssignmentForm = {
  student_id: '', route_id: '', vehicle_id: '', pickup_point: '', drop_point: '', monthly_fee: '', status: 'active',
};
const emptyExpenseForm = {
  vehicle_id: '', expense_type: 'fuel', amount: '', date: new Date().toISOString().split('T')[0], description: '',
};

export default function TransportTab() {
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 200);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [routeStatusFilter, setRouteStatusFilter] = useState('');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('');

  const [showVehicle, setShowVehicle] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<string | null>(null);
  const [editRouteId, setEditRouteId] = useState<string | null>(null);
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [serviceVehicle, setServiceVehicle] = useState<any>(null);
  const [reportPreview, setReportPreview] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dash = useApi(() => transportApiV2.getDashboard(), []);
  const vehicles = useApi(() => transportApiV2.getVehicles(), []);
  const routes = useApi(() => transportApiV2.getRoutes(), []);
  const assignments = useApi(() => transportApiV2.getAssignments(), []);
  const drivers = useApi(() => transportApiV2.getDrivers(), []);
  const expenses = useApi(() => transportApiV2.getExpenses(), []);
  const gps = useApi(() => transportApiV2.getGpsTracking(), []);
  const aiInsights = useApi(() => transportApiV2.getAiInsights(), []);
  const students = useApi(() => studentApi.getAll(), []);

  const vehicleForm = useForm(emptyVehicleForm);
  const routeForm = useForm(emptyRouteForm);
  const assignmentForm = useForm(emptyAssignmentForm);
  const expenseForm = useForm(emptyExpenseForm);

  const vehicleList = Array.isArray(vehicles.data) ? vehicles.data : [];
  const routeList = Array.isArray(routes.data) ? routes.data : [];
  const assignmentList = Array.isArray(assignments.data) ? assignments.data : [];
  const driverList = Array.isArray(drivers.data) ? drivers.data : [];
  const expenseList = Array.isArray(expenses.data) ? expenses.data : [];
  const gpsList = Array.isArray(gps.data) ? gps.data : [];
  const studentList = Array.isArray(students.data) ? students.data : [];
  const dd = dash.data || {};
  const aiRaw = aiInsights.data || {};
  const ai: any = useMemo(() => {
    const out: any = { ...aiRaw };
    const inr = (s: any) => typeof s === 'string' ? s.replace(/\$\s?/g, '₹') : s;
    out.routeOptimizationSuggestions = inr(aiRaw.routeOptimizationSuggestions);
    out.fuelCostForecast = inr(aiRaw.fuelCostForecast);
    out.maintenancePredictions = inr(aiRaw.maintenancePredictions);
    out.studentDensityAnalysis = inr(aiRaw.studentDensityAnalysis);
    out.vehicleUtilizationRecommendations = inr(aiRaw.vehicleUtilizationRecommendations);
    out.delayPredictions = inr(aiRaw.delayPredictions);
    out.driverPerformanceInsights = inr(aiRaw.driverPerformanceInsights);
    out.studentAllocationOptimization = inr(aiRaw.studentAllocationOptimization);
    if (Array.isArray(aiRaw.costReductionSuggestions)) {
      out.costReductionSuggestions = aiRaw.costReductionSuggestions.map((s: string) => inr(s));
    }
    return out;
  }, [aiRaw]);

  const totalVehicles = useCountUp(dd.totalVehicles ?? 0);
  const totalRoutes = useCountUp(dd.activeRoutes ?? 0);
  const totalStudents = useCountUp(dd.assignedStudents ?? 0);
  const totalDrivers = useCountUp(dd.activeDrivers ?? 0);
  const fleetHealth = useCountUp(dd.fleetHealthScore ?? 0);
  const utilization = useCountUp(dd.utilizationRate ?? 0);

  const studentMap = useMemo(() => Object.fromEntries(studentList.map((s: any) => [s.id, s])), [studentList]);
  const routeNameMap = useMemo(() => Object.fromEntries(routeList.map((r: any) => [r.id, r.route_name])), [routeList]);
  const vehicleNumberMap = useMemo(() => Object.fromEntries(vehicleList.map((v: any) => [v.id, v.vehicle_number])), [vehicleList]);

  useEffect(() => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setRouteStatusFilter('');
    setExpenseTypeFilter('');
  }, [view]);

  const filteredVehicles = useMemo(() => {
    let list = vehicleList;
    if (statusFilter) list = list.filter((v: any) => v.status === statusFilter);
    if (typeFilter) list = list.filter((v: any) => v.vehicle_type === typeFilter);
    if (!debouncedSearch) return list;
    const q = debouncedSearch.toLowerCase();
    return list.filter((v: any) =>
      (v.vehicle_number || '').toLowerCase().includes(q) ||
      (v.driver_name || '').toLowerCase().includes(q) ||
      (v.driver_phone || '').toLowerCase().includes(q) ||
      (v.vehicle_type || '').toLowerCase().includes(q)
    );
  }, [vehicleList, debouncedSearch, statusFilter, typeFilter]);

  const filteredRoutes = useMemo(() => {
    let list = routeList;
    if (routeStatusFilter) list = list.filter((r: any) => r.status === routeStatusFilter);
    if (!debouncedSearch) return list;
    const q = debouncedSearch.toLowerCase();
    return list.filter((r: any) =>
      (r.route_name || '').toLowerCase().includes(q) ||
      (r.route_code || '').toLowerCase().includes(q) ||
      (r.start_point || '').toLowerCase().includes(q) ||
      (r.end_point || '').toLowerCase().includes(q)
    );
  }, [routeList, debouncedSearch, routeStatusFilter]);

  const filteredAssignments = useMemo(() => {
    if (!debouncedSearch) return assignmentList;
    const q = debouncedSearch.toLowerCase();
    return assignmentList.filter((a: any) => {
      const student = studentMap[a.student_id];
      return (
        (student?.full_name || '').toLowerCase().includes(q) ||
        (student?.roll_number || '').toLowerCase().includes(q) ||
        (routeNameMap[a.route_id] || '').toLowerCase().includes(q) ||
        (vehicleNumberMap[a.vehicle_id] || '').toLowerCase().includes(q) ||
        (a.pickup_point || '').toLowerCase().includes(q)
      );
    });
  }, [assignmentList, debouncedSearch, studentMap, routeNameMap, vehicleNumberMap]);

  const filteredExpenses = useMemo(() => {
    let list = expenseList;
    if (expenseTypeFilter) list = list.filter((e: any) => e.expense_type === expenseTypeFilter);
    if (!debouncedSearch) return list;
    const q = debouncedSearch.toLowerCase();
    return list.filter((e: any) =>
      (e.expense_type || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      (vehicleNumberMap[e.vehicle_id] || '').toLowerCase().includes(q)
    );
  }, [expenseList, debouncedSearch, expenseTypeFilter, vehicleNumberMap]);

  const closeVehicle = () => { setShowVehicle(false); setEditVehicleId(null); vehicleForm.reset(); };
  const closeRoute = () => { setShowRoute(false); setEditRouteId(null); routeForm.reset(); };
  const closeAssignment = () => { setShowAssignment(false); setEditAssignmentId(null); assignmentForm.reset(); };
  const closeExpense = () => { setShowExpense(false); setEditExpenseId(null); expenseForm.reset(); };

  const openAddVehicle = () => { setEditVehicleId(null); vehicleForm.reset(); setShowVehicle(true); };
  const openEditVehicle = (v: any) => {
    setEditVehicleId(v.id);
    vehicleForm.setValues({
      vehicle_number: v.vehicle_number || '', vehicle_type: v.vehicle_type || 'bus', capacity: String(v.capacity ?? ''),
      driver_name: v.driver_name || '', driver_phone: v.driver_phone || '', driver_license: v.driver_license || '',
      route_id: v.route_id || '', fuel_type: v.fuel_type || 'diesel', status: v.status || 'active',
      last_service_date: v.last_service_date?.slice(0, 10) || '', insurance_expiry: v.insurance_expiry?.slice(0, 10) || '',
      permit_expiry: v.permit_expiry?.slice(0, 10) || '',
    });
    setShowVehicle(true);
  };
  const openAddRoute = () => { setEditRouteId(null); routeForm.reset(); setShowRoute(true); };
  const openEditRoute = (r: any) => {
    setEditRouteId(r.id);
    const stops = Array.isArray(r.stops) ? r.stops.join(', ') : (typeof r.stops === 'string' ? r.stops : '');
    routeForm.setValues({
      route_name: r.route_name || '', route_code: r.route_code || '', start_point: r.start_point || '',
      end_point: r.end_point || '', stops, distance: String(r.distance ?? ''), fee: String(r.fee ?? ''),
      status: r.status || 'active',
    });
    setShowRoute(true);
  };
  const openAddAssignment = () => { setEditAssignmentId(null); assignmentForm.reset(); setShowAssignment(true); };
  const openEditAssignment = (a: any) => {
    setEditAssignmentId(a.id);
    assignmentForm.setValues({
      student_id: a.student_id || '', route_id: a.route_id || '', vehicle_id: a.vehicle_id || '',
      pickup_point: a.pickup_point || '', drop_point: a.drop_point || '', monthly_fee: String(a.monthly_fee ?? ''),
      status: a.status || 'active',
    });
    setShowAssignment(true);
  };
  const openAddExpense = () => { setEditExpenseId(null); expenseForm.reset(); setShowExpense(true); };
  const openEditExpense = (e: any) => {
    setEditExpenseId(e.id);
    expenseForm.setValues({
      vehicle_id: e.vehicle_id || '', expense_type: e.expense_type || 'fuel', amount: String(e.amount ?? ''),
      date: e.date?.slice(0, 10) || new Date().toISOString().split('T')[0], description: e.description || '',
    });
    setShowExpense(true);
  };

  const handleSubmitVehicle = async () => {
    if (!vehicleForm.values.vehicle_number) { toast.error('Vehicle number is required'); return; }
    setSaving(true);
    try {
      const payload: any = { ...vehicleForm.values, capacity: Number(vehicleForm.values.capacity) || 0 };
      const res = editVehicleId
        ? await transportApiV2.updateVehicle(editVehicleId, payload)
        : await transportApiV2.createVehicle(payload);
      if (!res.success) { toast.error(res.error || 'Failed to save vehicle'); return; }
      toast.success(editVehicleId ? 'Vehicle updated' : 'Vehicle added');
      closeVehicle(); vehicles.refetch(); dash.refetch();
    } finally { setSaving(false); }
  };

  const handleSubmitRoute = async () => {
    if (!routeForm.values.route_name) { toast.error('Route name is required'); return; }
    setSaving(true);
    try {
      const stops = routeForm.values.stops.split(',').map((s: string) => s.trim()).filter(Boolean);
      const payload: any = {
        ...routeForm.values,
        stops,
        distance: Number(routeForm.values.distance) || 0,
        fee: Number(routeForm.values.fee) || 0,
      };
      const res = editRouteId
        ? await transportApiV2.updateRoute(editRouteId, payload)
        : await transportApiV2.createRoute(payload);
      if (!res.success) { toast.error(res.error || 'Failed to save route'); return; }
      toast.success(editRouteId ? 'Route updated' : 'Route created');
      closeRoute(); routes.refetch(); dash.refetch();
    } finally { setSaving(false); }
  };

  const handleSubmitAssignment = async () => {
    if (!assignmentForm.values.student_id) { toast.error('Select a student'); return; }
    if (!assignmentForm.values.route_id) { toast.error('Select a route'); return; }
    setSaving(true);
    try {
      const payload: any = { ...assignmentForm.values, monthly_fee: Number(assignmentForm.values.monthly_fee) || 0 };
      const res = editAssignmentId
        ? await transportApiV2.updateAssignment(editAssignmentId, payload)
        : await transportApiV2.createAssignment(payload);
      if (!res.success) { toast.error(res.error || 'Failed to save assignment'); return; }
      toast.success(editAssignmentId ? 'Assignment updated' : 'Student assigned to transport');
      closeAssignment(); assignments.refetch(); routes.refetch(); dash.refetch();
    } finally { setSaving(false); }
  };

  const handleSubmitExpense = async () => {
    if (!expenseForm.values.amount) { toast.error('Amount is required'); return; }
    setSaving(true);
    try {
      const payload: any = { ...expenseForm.values, amount: Number(expenseForm.values.amount) || 0 };
      const res = editExpenseId
        ? await transportApiV2.updateExpense(editExpenseId, payload)
        : await transportApiV2.createExpense(payload);
      if (!res.success) { toast.error(res.error || 'Failed to save expense'); return; }
      toast.success(editExpenseId ? 'Expense updated' : 'Expense recorded');
      closeExpense(); expenses.refetch(); dash.refetch();
    } finally { setSaving(false); }
  };

  const handleDelete = async (kind: 'vehicle' | 'route' | 'assignment', id: string) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const fn = kind === 'vehicle' ? transportApiV2.deleteVehicle(id)
        : kind === 'route' ? transportApiV2.deleteRoute(id)
        : transportApiV2.deleteAssignment(id);
      const res = await fn;
      if (!res.success) { toast.error(res.error || 'Failed to delete'); return; }
      toast.success('Record deleted');
      if (kind === 'vehicle') { vehicles.refetch(); dash.refetch(); }
      if (kind === 'route') { routes.refetch(); dash.refetch(); }
      if (kind === 'assignment') { assignments.refetch(); routes.refetch(); dash.refetch(); }
    } finally { setDeletingId(null); }
  };

  const handleOptimize = async (id: string) => {
    const res = await transportApiV2.optimizeRoute(id);
    if (res.success) {
      toast.success('Route optimized — estimated time savings 15%');
      routes.refetch();
    } else toast.error(res.error || 'Failed to optimize route');
  };

  const statusBadge = (status?: string) => {
    const s = STATUS_STYLE[status || ''] || { label: status || '—', variant: 'default' };
    return <Badge variant={s.variant} className="text-[9px] capitalize">{s.label}</Badge>;
  };

  const renderDashboard = () => {
    const byType: any = {};
    vehicleList.forEach((v: any) => { byType[v.vehicle_type || 'bus'] = (byType[v.vehicle_type || 'bus'] || 0) + 1; });
    const typeItems = VEHICLE_TYPES.map(t => ({ type: t, count: byType[t] || 0 }));
    const maxType = Math.max(1, ...typeItems.map(t => t.count));
    const maintenanceList = vehicleList.filter((v: any) => v.status === 'maintenance' || v.status === 'out_of_service');
    const revenue = dd.monthlyRevenue ?? 0;

    return (
      <div className="space-y-5 anim-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard icon={Bus} label="Total Vehicles" value={totalVehicles} sub={`${dd.vehiclesInService ?? 0} in service`} color="#6D4CFF" bg="#F5F3FF" delay="delay-1" />
          <StatCard icon={RouteIcon} label="Active Routes" value={totalRoutes} sub={`${dd.activeRoutes ?? 0} active`} color="#22C55E" bg="#F0FDF4" delay="delay-2" />
          <StatCard icon={Users} label="Assigned Students" value={totalStudents} sub={`${dd.utilizationRate ?? 0}% capacity used`} color="#3B82F6" bg="#EFF6FF" delay="delay-3" />
          <StatCard icon={UserCheck} label="Active Drivers" value={totalDrivers} sub="assigned to fleet" color="#F59E0B" bg="#FFFBEB" delay="delay-4" />
          <StatCard icon={DollarSign} label="Monthly Revenue" value={formatINRShort(revenue)} sub={`${formatINRShort(dd.monthlyExpenses ?? 0)} expenses`} color="#A855F7" bg="#FAF5FF" delay="delay-5" />
          <StatCard icon={ShieldCheck} label="Fleet Health" value={`${fleetHealth}%`} sub={`${utilization}% utilization`} color="#06B6D4" bg="#ECFEFF" delay="delay-5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-2"><Bus size={14} className="text-[#6D4CFF]" /> Fleet Status Overview</h4>
              <button onClick={() => setView('vehicles')} className="text-[10px] font-semibold text-[#6D4CFF] hover:underline">View all →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-[#22C55E10] text-center"><div className="text-[9px] text-gray-400">Active</div><div className="text-lg font-extrabold text-[#22C55E]">{vehicleList.filter((v: any) => v.status === 'active' || v.status === 'running' || !v.status).length}</div></div>
              <div className="p-3 rounded-xl bg-[#F59E0B10] text-center"><div className="text-[9px] text-gray-400">Maintenance</div><div className="text-lg font-extrabold text-[#F59E0B]">{vehicleList.filter((v: any) => v.status === 'maintenance').length}</div></div>
              <div className="p-3 rounded-xl bg-[#EF444410] text-center"><div className="text-[9px] text-gray-400">Out of Service</div><div className="text-lg font-extrabold text-[#EF4444]">{vehicleList.filter((v: any) => v.status === 'out_of_service').length}</div></div>
              <div className="p-3 rounded-xl bg-[#6D4CFF10] text-center"><div className="text-[9px] text-gray-400">Total Capacity</div><div className="text-lg font-extrabold text-[#6D4CFF]">{dd.totalCapacity ?? 0} seats</div></div>
            </div>
            <div className="space-y-2.5">
              {typeItems.map(t => (
                <div key={t.type} className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-500 w-14 capitalize">{t.type}s</span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bar-fill" style={{ width: `${(t.count / maxType) * 100}%`, background: 'linear-gradient(90deg,#6D4CFF,#8B5CF6)' }} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 w-6 text-right">{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white shadow-lg relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 anim-float" />
              <div className="flex items-center gap-2 mb-1"><Brain size={14} /><span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Fleet Insights</span></div>
              <p className="text-[11px] mt-1 opacity-95">{ai.routeOptimizationSuggestions || 'Add vehicles and routes to get AI recommendations.'}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="p-2 rounded-lg bg-white/10"><div className="text-[9px] opacity-75">Fuel Forecast</div><div className="text-sm font-bold">{ai.fuelCostForecast || '—'}</div></div>
                <div className="p-2 rounded-lg bg-white/10"><div className="text-[9px] opacity-75">Utilization</div><div className="text-sm font-bold">{ai.vehicleUtilizationRecommendations?.split(':')[1]?.trim() || '—'}</div></div>
              </div>
            </div>
            {maintenanceList.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]">
                <h4 className="text-[11px] font-semibold text-[#DC2626] flex items-center gap-1.5 mb-2"><AlertTriangle size={12} /> Vehicles Needing Attention</h4>
                <div className="space-y-1.5">
                  {maintenanceList.slice(0, 4).map((v: any) => (
                    <div key={v.id} className="flex items-center gap-2 text-[10px]">
                      <span className="font-semibold text-gray-700">{v.vehicle_number}</span>
                      <Badge variant="warning" className="text-[8px]">{v.status?.replace('_', ' ')}</Badge>
                      {v.last_service_date && <span className="text-gray-400 ml-auto">Last service: {new Date(v.last_service_date).toLocaleDateString()}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#6D4CFF] text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 anim-float" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-[#8B5CF6]/20 anim-pulse-glow" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Brain size={16} /></div>
              <div>
                <h4 className="text-sm font-bold leading-tight">AI Transport Intelligence</h4>
                <p className="text-[9px] opacity-75 uppercase tracking-wider">Real-time analysis & recommendations</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                <div className="text-[9px] opacity-75">Route Optimization</div>
                <div className="text-[11px] font-semibold mt-1 leading-snug">{ai.routeOptimizationSuggestions || '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                <div className="text-[9px] opacity-75">Fuel Cost Forecast</div>
                <div className="text-[11px] font-semibold mt-1 leading-snug">{ai.fuelCostForecast || '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                <div className="text-[9px] opacity-75">Maintenance Prediction</div>
                <div className="text-[11px] font-semibold mt-1 leading-snug">{ai.maintenancePredictions || '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                <div className="text-[9px] opacity-75">Student Density</div>
                <div className="text-[11px] font-semibold mt-1 leading-snug">{ai.studentDensityAnalysis || '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#22C55E]/20 flex items-center justify-center text-[#4ADE80] shrink-0"><CheckCircle2 size={13} /></div>
                <div>
                  <div className="text-[9px] opacity-75">Utilization</div>
                  <div className="text-[11px] font-semibold mt-0.5 leading-snug">{ai.vehicleUtilizationRecommendations || '—'}</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center text-[#FBBF24] shrink-0"><AlertTriangle size={13} /></div>
                <div>
                  <div className="text-[9px] opacity-75">Delay Prediction</div>
                  <div className="text-[11px] font-semibold mt-0.5 leading-snug">{ai.delayPredictions || '—'}</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center text-[#60A5FA] shrink-0"><TrendingUp size={13} /></div>
                <div>
                  <div className="text-[9px] opacity-75">Driver Insights</div>
                  <div className="text-[11px] font-semibold mt-0.5 leading-snug">{typeof ai.driverPerformanceInsights === 'string' ? ai.driverPerformanceInsights : '—'}</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[10px] font-semibold opacity-90 mb-2">Cost Reduction Suggestions</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(Array.isArray(ai.costReductionSuggestions) ? ai.costReductionSuggestions : []).map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/10 border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</div>
                    <span className="text-[10px] leading-snug opacity-95">{s}</span>
                  </div>
                ))}
                {!Array.isArray(ai.costReductionSuggestions) && (
                  <div className="text-[10px] opacity-75">Add vehicle and route data to generate cost-saving suggestions.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVehicles = () => (
    <div className="space-y-4 anim-fade-in">
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <SearchBox value={search} onChange={setSearch} placeholder="Search vehicle number, driver, phone..." />
        <div className="flex flex-wrap items-center gap-2">
          <FilterChips options={VEHICLE_STATUS} value={statusFilter} onChange={setStatusFilter} emptyLabel="All Status" />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <FilterChips options={VEHICLE_TYPES} value={typeFilter} onChange={setTypeFilter} emptyLabel="All Types" />
        <div className="ml-auto flex items-center gap-2">
          <ResultCount total={vehicleList.length} shown={filteredVehicles.length} />
          <button onClick={openAddVehicle} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"><Plus size={14} /> Add Vehicle</button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'vehicle_number', label: 'Vehicle', render: (row: any) => (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6D4CFF15] flex items-center justify-center text-[#6D4CFF]"><Bus size={12} /></div>
              <div><div className="text-xs font-semibold text-gray-700">{row.vehicle_number || '—'}</div><div className="text-[9px] text-gray-400 capitalize">{row.vehicle_type}</div></div>
            </div>
          )},
          { key: 'driver_name', label: 'Driver', render: (row: any) => (
            <div>
              <div className="text-[11px] text-gray-700">{row.driver_name || 'Not assigned'}</div>
              {row.driver_phone && <div className="text-[9px] text-gray-400">{row.driver_phone}</div>}
            </div>
          )},
          { key: 'capacity', label: 'Capacity', render: (row: any) => <span className="text-[11px]">{row.capacity || 0} seats</span> },
          { key: 'route_id', label: 'Route', render: (row: any) => <span className="text-[10px] text-gray-500">{routeNameMap[row.route_id] || '—'}</span> },
          { key: 'fuel_type', label: 'Fuel', render: (row: any) => <span className="text-[10px] capitalize flex items-center gap-1"><Fuel size={10} className="text-amber-500" />{row.fuel_type || 'diesel'}</span> },
          { key: 'last_service_date', label: 'Last Service', render: (row: any) => <span className="text-[10px] text-gray-400">{row.last_service_date ? new Date(row.last_service_date).toLocaleDateString() : '—'}</span> },
          { key: 'status', label: 'Status', render: (row: any) => statusBadge(row.status) },
          { key: 'id', label: '', render: (row: any) => (
            <div className="flex gap-1">
              <button onClick={() => setServiceVehicle(row)} className="px-2 py-1 rounded-lg bg-[#6D4CFF10] text-[#6D4CFF] text-[9px] font-semibold"><Wrench size={10} className="inline mr-1" />Service</button>
              <button onClick={() => openEditVehicle(row)} className="px-2 py-1 rounded-lg bg-gray-100 text-[9px] font-semibold text-gray-600">Edit</button>
              <button onClick={() => handleDelete('vehicle', row.id)} disabled={deletingId === row.id} className="px-2 py-1 rounded-lg bg-red-50 text-[#EF4444] text-[9px] font-semibold"><Trash2 size={10} className="inline mr-1" />{deletingId === row.id ? '...' : ''}</button>
            </div>
          )},
        ]}
        data={filteredVehicles}
        loading={vehicles.loading}
        empty={debouncedSearch ? 'No vehicles match your search.' : 'No vehicles yet — add your first vehicle.'}
      />
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-4 anim-fade-in">
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <SearchBox value={search} onChange={setSearch} placeholder="Search route name, code, start/end point..." />
        <div className="flex flex-wrap items-center gap-2">
          <FilterChips options={['active', 'inactive']} value={routeStatusFilter} onChange={setRouteStatusFilter} emptyLabel="All Status" />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <ResultCount total={routeList.length} shown={filteredRoutes.length} />
        <div className="ml-auto flex items-center gap-2">
          <button onClick={openAddRoute} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"><Plus size={14} /> Create Route</button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'route_name', label: 'Route', render: (row: any) => (
            <div>
              <div className="text-xs font-semibold text-gray-700">{row.route_name || '—'}</div>
              <div className="text-[9px] text-gray-400">{row.route_code || ''} · {row.start_point || ''} → {row.end_point || ''}</div>
            </div>
          )},
          { key: 'stopsList', label: 'Stops', render: (row: any) => (
            <div>
              <span className="text-[11px] text-gray-600">{Array.isArray(row.stopsList) ? row.stopsList.length : 0} stops</span>
              {Array.isArray(row.stopsList) && row.stopsList.length > 0 && (
                <div className="text-[9px] text-gray-400 max-w-[160px] truncate">{row.stopsList.join(', ')}</div>
              )}
            </div>
          )},
          { key: 'distance', label: 'Distance', render: (row: any) => <span className="text-[11px]">{row.distance || 0} km</span> },
          { key: 'assignedVehicle', label: 'Vehicle', render: (row: any) => <span className="text-[11px]">{row.assignedVehicle || '—'}</span> },
          { key: 'assignedStudents', label: 'Students', render: (row: any) => <span className="text-[11px] font-semibold text-[#6D4CFF]">{row.assignedStudents || 0}</span> },
          { key: 'fee', label: 'Monthly Fee', render: (row: any) => <span className="text-[11px] font-bold text-gray-700">{formatINR(row.fee)}</span> },
          { key: 'status', label: 'Status', render: (row: any) => statusBadge(row.status) },
          { key: 'id', label: '', render: (row: any) => (
            <div className="flex gap-1">
              <button onClick={() => handleOptimize(row.id)} className="px-2 py-1 rounded-lg bg-[#22C55E10] text-[#22C55E] text-[9px] font-semibold">Optimize</button>
              <button onClick={() => openEditRoute(row)} className="px-2 py-1 rounded-lg bg-gray-100 text-[9px] font-semibold text-gray-600">Edit</button>
              <button onClick={() => handleDelete('route', row.id)} disabled={deletingId === row.id} className="px-2 py-1 rounded-lg bg-red-50 text-[#EF4444] text-[9px] font-semibold"><Trash2 size={10} className="inline mr-1" /></button>
            </div>
          )},
        ]}
        data={filteredRoutes}
        loading={routes.loading}
        empty={debouncedSearch ? 'No routes match your search.' : 'No routes yet — create your first route.'}
      />
    </div>
  );

  const renderAssignments = () => {
    const unassigned = studentList.filter((s: any) => !assignmentList.some((a: any) => a.student_id === s.id));
    return (
      <div className="space-y-4 anim-fade-in">
        <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
          <SearchBox value={search} onChange={setSearch} placeholder="Search student, route, vehicle, pickup point..." />
          <p className="text-[10px] text-gray-400 flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-500" /> {unassigned.length} students not yet assigned transport.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ResultCount total={assignmentList.length} shown={filteredAssignments.length} />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={openAddAssignment} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"><Plus size={14} /> Assign Student</button>
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'student_id', label: 'Student', render: (row: any) => {
              const s = studentMap[row.student_id];
              return (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[9px] font-bold shrink-0">{(s?.full_name || '?').charAt(0)}</div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700">{s?.full_name || 'Unknown'}</div>
                    <div className="text-[9px] text-gray-400">{s?.roll_number ? `Roll ${s.roll_number}` : ''}{s?.student_class ? ` · ${s.student_class}` : ''}</div>
                  </div>
                </div>
              );
            }},
            { key: 'route_id', label: 'Route', render: (row: any) => <span className="text-[11px]">{routeNameMap[row.route_id] || '—'}</span> },
            { key: 'vehicle_id', label: 'Vehicle', render: (row: any) => <span className="text-[11px]">{vehicleNumberMap[row.vehicle_id] || '—'}</span> },
            { key: 'pickup_point', label: 'Pickup → Drop', render: (row: any) => (
              <div><div className="text-[11px] text-gray-600">{row.pickup_point || '—'}</div><div className="text-[9px] text-gray-400">↓ {row.drop_point || '—'}</div></div>
            )},
            { key: 'monthly_fee', label: 'Monthly Fee', render: (row: any) => <span className="text-[11px] font-bold text-[#6D4CFF]">{formatINR(row.monthly_fee)}</span> },
            { key: 'status', label: 'Status', render: (row: any) => statusBadge(row.status) },
            { key: 'id', label: '', render: (row: any) => (
              <div className="flex gap-1">
                <button onClick={() => openEditAssignment(row)} className="px-2 py-1 rounded-lg bg-gray-100 text-[9px] font-semibold text-gray-600">Edit</button>
                <button onClick={() => handleDelete('assignment', row.id)} disabled={deletingId === row.id} className="px-2 py-1 rounded-lg bg-red-50 text-[#EF4444] text-[9px] font-semibold"><Trash2 size={10} className="inline mr-1" /></button>
              </div>
            )},
          ]}
          data={filteredAssignments}
          loading={assignments.loading}
          empty={debouncedSearch ? 'No assignments match your search.' : 'No students assigned to transport yet.'}
        />
      </div>
    );
  };

  const renderDrivers = () => (
    <div className="space-y-4 anim-fade-in">
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <SearchBox value={search} onChange={setSearch} placeholder="Search driver name, license, vehicle..." />
        <p className="text-[10px] text-gray-400 flex items-center gap-1.5"><UserCheck size={12} className="text-[#F59E0B]" /> Drivers are pulled from vehicle records with driver details filled in.</p>
      </div>
      <div className="flex items-center justify-end">
        <ResultCount total={driverList.length} shown={driverList.length} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {driverList
          .filter((d: any) => !debouncedSearch || [d.driverName, d.licenseNumber, d.driverPhone, d.assignedVehicle, d.assignedRoute].some((f: any) => (f || '').toLowerCase().includes(debouncedSearch.toLowerCase())))
          .map((d: any) => (
            <div key={d.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center text-white text-xs font-bold shrink-0">{(d.driverName || '?').charAt(0)}</div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-700 truncate">{d.driverName}</div>
                  <div className="text-[9px] text-gray-400">{d.driverPhone || 'No phone'}</div>
                </div>
                {statusBadge(d.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-gray-50"><div className="text-[9px] text-gray-400">License</div><div className="font-semibold text-gray-600 truncate">{d.licenseNumber}</div></div>
                <div className="p-2 rounded-lg bg-gray-50"><div className="text-[9px] text-gray-400">Vehicle</div><div className="font-semibold text-gray-600 truncate">{d.assignedVehicle || '—'}</div></div>
                <div className="p-2 rounded-lg bg-gray-50 col-span-2"><div className="text-[9px] text-gray-400">Route</div><div className="font-semibold text-gray-600 truncate">{d.assignedRoute || '—'}</div></div>
              </div>
            </div>
          ))}
      </div>
      {driverList.length === 0 && !vehicles.loading && (
        <div className="text-center py-10 text-gray-400 text-xs">No drivers found. Fill in driver details when adding vehicles.</div>
      )}
    </div>
  );

  const renderGps = () => {
    const avgSpeed = gpsList.length > 0 ? Math.round(gpsList.reduce((s: number, v: any) => s + (v.speed || 0), 0) / gpsList.length) : 0;
    return (
      <div className="space-y-4 anim-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Live Fleet Tracking</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Active vehicles on the road with live speed and ETA estimates</p>
          </div>
          <Badge variant="success" className="text-[9px]"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1" />Live</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Bus} label="Active Vehicles" value={gpsList.length} color="#6D4CFF" bg="#F5F3FF" delay="delay-1" />
          <StatCard icon={Navigation} label="Avg Speed" value={`${avgSpeed} km/h`} color="#22C55E" bg="#F0FDF4" delay="delay-2" />
          <StatCard icon={MapPin} label="Routes Active" value={new Set(gpsList.map((v: any) => v.route_id)).size} color="#3B82F6" bg="#EFF6FF" delay="delay-3" />
          <StatCard icon={AlertTriangle} label="Delayed" value={gpsList.filter((v: any) => v.status === 'delayed').length} color="#EF4444" bg="#FEF2F2" delay="delay-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gpsList.map((v: any) => (
            <div key={v.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#6D4CFF15] flex items-center justify-center text-[#6D4CFF]"><Bus size={15} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">{v.vehicle_number}</span>
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  </div>
                  <div className="text-[9px] text-gray-400">{v.driver_name || 'No driver'} · {v.route?.route_name || 'No route'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#22C55E]">{v.speed || 0} <span className="text-[8px] font-normal text-gray-400">km/h</span></div>
                  <div className="text-[9px] text-gray-400">ETA {v.eta || '—'}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[9px] text-gray-400">
                <MapPin size={10} className="text-[#6D4CFF]" />
                <span className="truncate">{v.route?.start_point || '—'} → {v.route?.end_point || '—'}</span>
                {v.route?.stops && Array.isArray(v.route.stops) && <Badge className="text-[8px] bg-gray-100 text-gray-500">{v.route.stops.length} stops</Badge>}
              </div>
            </div>
          ))}
          {gpsList.length === 0 && !gps.loading && <div className="col-span-2 text-center py-10 text-gray-400 text-xs">No vehicles currently active on the road.</div>}
        </div>
      </div>
    );
  };

  const renderExpenses = () => {
    const total = expenseList.reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const byCategory = EXPENSE_TYPES.map(t => ({
      type: t,
      amount: expenseList.filter((e: any) => e.expense_type === t).reduce((s: number, e: any) => s + (e.amount || 0), 0),
    })).filter(c => c.amount > 0);
    const maxCat = Math.max(1, ...byCategory.map(c => c.amount));
    const catColors: Record<string, string> = {
      fuel: '#F59E0B', maintenance: '#EF4444', repair: '#8B5CF6', insurance: '#3B82F6',
      permit: '#06B6D4', salary: '#6D4CFF', other: '#94A3B8',
    };
    return (
      <div className="space-y-4 anim-fade-in">
        <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
          <SearchBox value={search} onChange={setSearch} placeholder="Search category, description, vehicle..." />
          <div className="flex flex-wrap items-center gap-2">
            <FilterChips options={EXPENSE_TYPES} value={expenseTypeFilter} onChange={setExpenseTypeFilter} emptyLabel="All Categories" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ResultCount total={expenseList.length} shown={filteredExpenses.length} />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={openAddExpense} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"><Plus size={14} /> Add Expense</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatCard icon={DollarSign} label="Total Expenses" value={formatINRShort(total)} color="#EF4444" bg="#FEF2F2" delay="delay-1" />
          <StatCard icon={Fuel} label="Fuel Cost" value={formatINRShort(byCategory.find(c => c.type === 'fuel')?.amount || 0)} color="#F59E0B" bg="#FFFBEB" delay="delay-2" />
          <StatCard icon={Wrench} label="Maintenance" value={formatINRShort(byCategory.find(c => c.type === 'maintenance' || c.type === 'repair')?.amount || 0)} color="#8B5CF6" bg="#FAF5FF" delay="delay-3" />
          <StatCard icon={CalendarClock} label="This Month" value={formatINRShort(dd.currentMonthExpenses || 0)} color="#06B6D4" bg="#ECFEFF" delay="delay-4" />
        </div>
        {byCategory.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-700 mb-4">Expense Breakdown</h4>
            <div className="space-y-2.5">
              {byCategory.map(c => (
                <div key={c.type} className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-gray-500 w-20 capitalize">{c.type}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bar-fill" style={{ width: `${(c.amount / maxCat) * 100}%`, background: catColors[c.type] || '#94A3B8' }} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 w-24 text-right">{formatINR(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <DataTable
          columns={[
            { key: 'expense_type', label: 'Category', render: (row: any) => (
              <Badge className="text-[9px] capitalize" style={{ background: `${catColors[row.expense_type] || '#94A3B8'}15`, color: catColors[row.expense_type] || '#64748B' }}>{row.expense_type || '—'}</Badge>
            )},
            { key: 'vehicle_id', label: 'Vehicle', render: (row: any) => <span className="text-[11px]">{vehicleNumberMap[row.vehicle_id] || '—'}</span> },
            { key: 'amount', label: 'Amount', render: (row: any) => <span className="text-[11px] font-bold text-[#EF4444]">{formatINR(row.amount)}</span> },
            { key: 'date', label: 'Date', render: (row: any) => <span className="text-[10px] text-gray-400">{row.date ? new Date(row.date).toLocaleDateString() : '—'}</span> },
            { key: 'description', label: 'Description', render: (row: any) => <span className="text-[10px] text-gray-500 max-w-[180px] inline-block truncate">{row.description || '—'}</span> },
            { key: 'id', label: '', render: (row: any) => (
              <div className="flex gap-1">
                <button onClick={() => openEditExpense(row)} className="px-2 py-1 rounded-lg bg-gray-100 text-[9px] font-semibold text-gray-600">Edit</button>
              </div>
            )},
          ]}
          data={filteredExpenses}
          loading={expenses.loading}
          empty={debouncedSearch ? 'No expenses match your search.' : 'No expenses recorded yet.'}
        />
      </div>
    );
  };

  const buildReport = (key: string) => {
    const vehicleName = (id: string) => vehicleNumberMap[id] || '—';
    const routeName = (id: string) => routeNameMap[id] || '—';
    const studentName = (id: string) => studentMap[id]?.full_name || 'Unknown';
    switch (key) {
      case 'vehicle': {
        const columns = ['Vehicle Number', 'Type', 'Capacity', 'Driver', 'Phone', 'Fuel', 'Status'];
        const rows = vehicleList.map((v: any) => [v.vehicle_number || '—', v.vehicle_type || '—', String(v.capacity ?? '—'), v.driver_name || '—', v.driver_phone || '—', v.fuel_type || '—', v.status || '—']);
        return { columns, rows };
      }
      case 'route': {
        const columns = ['Route', 'Code', 'Start', 'End', 'Stops', 'Distance', 'Fee', 'Students', 'Status'];
        const rows = routeList.map((r: any) => [r.route_name || '—', r.route_code || '—', r.start_point || '—', r.end_point || '—', String(Array.isArray(r.stopsList) ? r.stopsList.length : 0), `${r.distance || 0} km`, formatINR(r.fee), String(r.assignedStudents || 0), r.status || '—']);
        return { columns, rows };
      }
      case 'driver': {
        const columns = ['Driver', 'Phone', 'License', 'Vehicle', 'Route', 'Status'];
        const rows = driverList.map((d: any) => [d.driverName || '—', d.driverPhone || '—', d.licenseNumber || '—', d.assignedVehicle || '—', d.assignedRoute || '—', d.status || '—']);
        return { columns, rows };
      }
      case 'expense': {
        const columns = ['Date', 'Category', 'Vehicle', 'Amount', 'Description'];
        const rows = expenseList.map((e: any) => [e.date || '—', e.expense_type || '—', vehicleName(e.vehicle_id), formatINR(e.amount), e.description || '—']);
        return { columns, rows };
      }
      case 'revenue': {
        const columns = ['Student', 'Route', 'Vehicle', 'Pickup', 'Monthly Fee', 'Status'];
        const rows = assignmentList.map((a: any) => [studentName(a.student_id), routeName(a.route_id), vehicleName(a.vehicle_id), a.pickup_point || '—', formatINR(a.monthly_fee), a.status || 'active']);
        return { columns, rows };
      }
      case 'maintenance': {
        const columns = ['Date', 'Vehicle', 'Category', 'Amount', 'Description'];
        const rows = expenseList.filter((e: any) => e.expense_type === 'maintenance' || e.expense_type === 'repair').map((e: any) => [e.date || '—', vehicleName(e.vehicle_id), e.expense_type || '—', formatINR(e.amount), e.description || '—']);
        return { columns, rows };
      }
      case 'gps': {
        const columns = ['Vehicle', 'Driver', 'Route', 'Speed', 'ETA', 'Status'];
        const rows = gpsList.map((v: any) => [v.vehicle_number || '—', v.driver_name || '—', v.route?.route_name || '—', `${v.speed || 0} km/h`, `${v.eta_minutes || 0} min`, v.status || '—']);
        return { columns, rows };
      }
      default:
        return { columns: [], rows: [] };
    }
  };

  const exportCsv = (key: string) => {
    const { columns, rows } = buildReport(key);
    const csv = [columns, ...rows].map(r => r.map((c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transport-${key}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded as CSV');
  };

  const renderReports = () => {
    const items = [
      { key: 'vehicle', label: 'Vehicle Report', icon: Bus, desc: `${vehicleList.length} vehicles · ${vehicleList.filter((v: any) => v.status === 'active' || v.status === 'in_service').length} active · ${vehicleList.filter((v: any) => v.status === 'maintenance' || v.status === 'out_of_service').length} in maintenance` },
      { key: 'route', label: 'Route Report', icon: RouteIcon, desc: `${routeList.length} routes · ${routeList.reduce((s: number, r: any) => s + (r.distance || 0), 0)} km total distance` },
      { key: 'driver', label: 'Driver Report', icon: UserCheck, desc: `${driverList.length} drivers · ${driverList.filter((d: any) => d.status === 'active').length} active` },
      { key: 'expense', label: 'Expense Report', icon: DollarSign, desc: `${formatINRShort(expenseList.reduce((s: number, e: any) => s + (e.amount || 0), 0))} total transport expenses` },
      { key: 'revenue', label: 'Revenue Report', icon: TrendingUp, desc: `${formatINRShort(assignmentList.reduce((s: number, a: any) => s + (a.monthly_fee || 0), 0))} in student transport fees` },
      { key: 'maintenance', label: 'Maintenance Report', icon: Wrench, desc: `${expenseList.filter((e: any) => e.expense_type === 'maintenance' || e.expense_type === 'repair').length} maintenance records on file` },
      { key: 'gps', label: 'GPS Activity Report', icon: Navigation, desc: `${gpsList.length} vehicles tracked live` },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 anim-fade-in">
        {items.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.key} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover-lift">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6D4CFF10] flex items-center justify-center text-[#6D4CFF] shrink-0"><Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-800">{r.label}</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5">{r.desc}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setReportPreview({ key: r.key, label: r.label, ...buildReport(r.key) })} className="px-2.5 py-1 rounded-lg bg-[#6D4CFF] text-white text-[9px] font-semibold hover:bg-[#5A3EF0] transition-colors"><Eye size={10} className="inline mr-1" />Preview</button>
                    <button onClick={() => exportCsv(r.key)} className="px-2.5 py-1 rounded-lg border border-gray-200 text-[9px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"><FileSpreadsheet size={10} className="inline mr-1" />CSV</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const modalBase = "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white"><Bus size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Transport Management</h1>
            <p className="text-xs text-gray-500">Manage fleet vehicles, routes, student assignments, drivers, live tracking, and expenses</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap mb-6 p-1 bg-gray-100/60 rounded-xl anim-fade-in">
        {NAVS.map(n => (
          <button key={n.key} onClick={() => setView(n.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${view === n.key ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>
            <n.icon size={14} />
            {n.label}
          </button>
        ))}
      </div>

      {view === 'dashboard' && renderDashboard()}
      {view === 'vehicles' && renderVehicles()}
      {view === 'routes' && renderRoutes()}
      {view === 'assignments' && renderAssignments()}
      {view === 'drivers' && renderDrivers()}
      {view === 'gps' && renderGps()}
      {view === 'expenses' && renderExpenses()}
      {view === 'reports' && renderReports()}

      {showVehicle && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editVehicleId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
              <button onClick={closeVehicle} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Vehicle Number *</label>
                <input value={vehicleForm.values.vehicle_number} onChange={e => vehicleForm.handleChange('vehicle_number', e.target.value)} placeholder="e.g. KA-01-AB-1234" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Vehicle Type</label>
                <select value={vehicleForm.values.vehicle_type} onChange={e => vehicleForm.handleChange('vehicle_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Capacity (seats)</label>
                <input type="number" value={vehicleForm.values.capacity} onChange={e => vehicleForm.handleChange('capacity', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Driver Name</label>
                <input value={vehicleForm.values.driver_name} onChange={e => vehicleForm.handleChange('driver_name', e.target.value)} placeholder="Driver full name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Driver Phone</label>
                <input value={vehicleForm.values.driver_phone} onChange={e => vehicleForm.handleChange('driver_phone', e.target.value)} placeholder="Contact number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Driver License</label>
                <input value={vehicleForm.values.driver_license} onChange={e => vehicleForm.handleChange('driver_license', e.target.value)} placeholder="License no." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Route</label>
                <select value={vehicleForm.values.route_id} onChange={e => vehicleForm.handleChange('route_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">No route</option>
                  {routeList.map((r: any) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Fuel Type</label>
                <select value={vehicleForm.values.fuel_type} onChange={e => vehicleForm.handleChange('fuel_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  {FUEL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Status</label>
                <select value={vehicleForm.values.status} onChange={e => vehicleForm.handleChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  {VEHICLE_STATUS.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Last Service Date</label>
                <input type="date" value={vehicleForm.values.last_service_date} onChange={e => vehicleForm.handleChange('last_service_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Insurance Expiry</label>
                <input type="date" value={vehicleForm.values.insurance_expiry} onChange={e => vehicleForm.handleChange('insurance_expiry', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Permit Expiry</label>
                <input type="date" value={vehicleForm.values.permit_expiry} onChange={e => vehicleForm.handleChange('permit_expiry', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeVehicle} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmitVehicle} disabled={saving} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
                {saving ? 'Saving...' : (editVehicleId ? 'Save Changes' : 'Add Vehicle')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoute && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editRouteId ? 'Edit Route' : 'Create Route'}</h3>
              <button onClick={closeRoute} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Route Name *</label>
                <input value={routeForm.values.route_name} onChange={e => routeForm.handleChange('route_name', e.target.value)} placeholder="e.g. North Zone Route" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Route Code</label>
                <input value={routeForm.values.route_code} onChange={e => routeForm.handleChange('route_code', e.target.value)} placeholder="e.g. R-01" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Start Point</label>
                <input value={routeForm.values.start_point} onChange={e => routeForm.handleChange('start_point', e.target.value)} placeholder="e.g. Central Bus Stand" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">End Point</label>
                <input value={routeForm.values.end_point} onChange={e => routeForm.handleChange('end_point', e.target.value)} placeholder="School campus" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Stops (comma separated)</label>
                <textarea value={routeForm.values.stops} onChange={e => routeForm.handleChange('stops', e.target.value)} rows={2} placeholder="e.g. Gandhi Nagar, Indira Colony, City Center" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Distance (km)</label>
                <input type="number" value={routeForm.values.distance} onChange={e => routeForm.handleChange('distance', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Monthly Fee (₹)</label>
                <input type="number" value={routeForm.values.fee} onChange={e => routeForm.handleChange('fee', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Status</label>
                <select value={routeForm.values.status} onChange={e => routeForm.handleChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeRoute} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmitRoute} disabled={saving} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
                {saving ? 'Saving...' : (editRouteId ? 'Save Changes' : 'Create Route')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignment && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editAssignmentId ? 'Edit Assignment' : 'Assign Student to Transport'}</h3>
              <button onClick={closeAssignment} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Student *</label>
                <select value={assignmentForm.values.student_id} onChange={e => assignmentForm.handleChange('student_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Select student...</option>
                  {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}{s.roll_number ? ` (${s.roll_number})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Route *</label>
                <select value={assignmentForm.values.route_id} onChange={e => assignmentForm.handleChange('route_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Select route...</option>
                  {routeList.map((r: any) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Vehicle</label>
                <select value={assignmentForm.values.vehicle_id} onChange={e => assignmentForm.handleChange('vehicle_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Auto select / none</option>
                  {vehicleList.map((v: any) => <option key={v.id} value={v.id}>{v.vehicle_number} ({v.vehicle_type})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Pickup Point</label>
                <input value={assignmentForm.values.pickup_point} onChange={e => assignmentForm.handleChange('pickup_point', e.target.value)} placeholder="e.g. City Center" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Drop Point</label>
                <input value={assignmentForm.values.drop_point} onChange={e => assignmentForm.handleChange('drop_point', e.target.value)} placeholder="e.g. School" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Monthly Fee (₹)</label>
                <input type="number" value={assignmentForm.values.monthly_fee} onChange={e => assignmentForm.handleChange('monthly_fee', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Status</label>
                <select value={assignmentForm.values.status} onChange={e => assignmentForm.handleChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeAssignment} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmitAssignment} disabled={saving} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
                {saving ? 'Saving...' : (editAssignmentId ? 'Save Changes' : 'Assign Student')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpense && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editExpenseId ? 'Edit Expense' : 'Add Expense'}</h3>
              <button onClick={closeExpense} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Vehicle</label>
                <select value={expenseForm.values.vehicle_id} onChange={e => expenseForm.handleChange('vehicle_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">General / none</option>
                  {vehicleList.map((v: any) => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Category *</label>
                <select value={expenseForm.values.expense_type} onChange={e => expenseForm.handleChange('expense_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Amount (₹) *</label>
                <input type="number" value={expenseForm.values.amount} onChange={e => expenseForm.handleChange('amount', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Date</label>
                <input type="date" value={expenseForm.values.date} onChange={e => expenseForm.handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Description</label>
                <textarea value={expenseForm.values.description} onChange={e => expenseForm.handleChange('description', e.target.value)} rows={2} placeholder="Details about this expense" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeExpense} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmitExpense} disabled={saving} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
                {saving ? 'Saving...' : (editExpenseId ? 'Save Changes' : 'Add Expense')}
              </button>
            </div>
          </div>
        </div>
      )}

      {serviceVehicle && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Service History — {serviceVehicle.vehicle_number}</h3>
              <button onClick={() => setServiceVehicle(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-[#F5F3FF]"><div className="text-[9px] text-gray-400">Last Service</div><div className="text-xs font-bold text-[#6D4CFF]">{serviceVehicle.last_service_date ? new Date(serviceVehicle.last_service_date).toLocaleDateString() : '—'}</div></div>
              <div className="p-3 rounded-xl bg-[#F0FDF4]"><div className="text-[9px] text-gray-400">Status</div><div className="text-xs font-bold text-[#22C55E] capitalize">{serviceVehicle.status || 'active'}</div></div>
              <div className="p-3 rounded-xl bg-[#EFF6FF]"><div className="text-[9px] text-gray-400">Insurance</div><div className="text-xs font-bold text-[#3B82F6]">{serviceVehicle.insurance_expiry ? new Date(serviceVehicle.insurance_expiry).toLocaleDateString() : '—'}</div></div>
              <div className="p-3 rounded-xl bg-[#FFFBEB]"><div className="text-[9px] text-gray-400">Permit</div><div className="text-xs font-bold text-[#F59E0B]">{serviceVehicle.permit_expiry ? new Date(serviceVehicle.permit_expiry).toLocaleDateString() : '—'}</div></div>
            </div>
            <h4 className="text-[11px] font-semibold text-gray-700 mb-2">Maintenance Records</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {expenseList.filter((e: any) => e.vehicle_id === serviceVehicle.id && (e.expense_type === 'maintenance' || e.expense_type === 'repair')).slice(0, 10).map((e: any) => (
                <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-[10px]">
                  <Wrench size={11} className="text-[#F59E0B] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-600 capitalize truncate">{e.expense_type}</div>
                    <div className="text-[9px] text-gray-400 truncate">{e.description || e.date}</div>
                  </div>
                  <span className="font-bold text-[#EF4444]">{formatINR(e.amount)}</span>
                </div>
              ))}
              {expenseList.filter((e: any) => e.vehicle_id === serviceVehicle.id && (e.expense_type === 'maintenance' || e.expense_type === 'repair')).length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">No maintenance records yet. Record maintenance under Expenses.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {reportPreview && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{reportPreview.label}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => exportCsv(reportPreview.key)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"><FileSpreadsheet size={11} className="inline mr-1" />Export CSV</button>
                <button onClick={() => setReportPreview(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mb-3">{reportPreview.rows.length} records</div>
            <div className="flex-1 overflow-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    {reportPreview.columns.map((c: string) => <th key={c} className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">{c}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportPreview.rows.length === 0 && (
                    <tr><td colSpan={reportPreview.columns.length} className="px-3 py-8 text-center text-gray-400">No records for this report yet.</td></tr>
                  )}
                  {reportPreview.rows.map((row: any[], i: number) => (
                    <tr key={i} className="hover:bg-gray-50/60">
                      {row.map((cell: any, j: number) => <td key={j} className="px-3 py-2 text-gray-600 whitespace-nowrap">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
