'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../../lib/useApi';
import { classApiV2, studentApi } from '../../../lib/dataService';
import {
  LayoutDashboard, Layers, Users, UserPlus, Search, Plus, Edit3, Trash2,
  GraduationCap, DoorOpen, Loader2, TrendingUp, UserX, AlertTriangle,
  CheckCircle2, Building2, Sparkles, ArrowRight, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const MAX_STUDENTS = 35;
const CLR = {
  primary: "#6D4CFF",
  secondary: "#8B5CF6",
  accent: "#A855F7",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};
const PIE_COLORS = ["#6D4CFF", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"];

const NAVS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "classes", label: "Classes & Sections", icon: Layers },
  { key: "assign", label: "Assign Student", icon: UserPlus },
  { key: "students", label: "Class Students", icon: Users },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const viewMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as any },
};

// ======================== SHARED COMPONENTS ========================
function KpiCard({ icon: Icon, label, value, trend, color, bg, delay = 0 }: any) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={delay} className="stat-card group cursor-default">
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: bg, color }}
        >
          <Icon size={18} />
        </div>
        {trend && (
          <Badge variant={trend.startsWith("+") ? "success" : "danger"} className="text-[9px]">{trend}</Badge>
        )}
      </div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? "—"}</div>
    </motion.div>
  );
}

function CrudModal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all min-h-[44px] sm:min-h-0 w-full sm:w-auto"
    >
      <Plus size={14} /> {label}
    </button>
  );
}

function ModulePage({ title, desc, actions, children, icon: Icon, gradient }: any) {
  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl ${gradient || "bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6]"} flex items-center justify-center text-white flex-shrink-0`}>
              <Icon size={20} />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-gray-900 leading-tight truncate text-2xl">{title}</h1>
            {desc && <p className="text-sm text-gray-400 mt-1 truncate">{desc}</p>}
          </div>
        </div>
        {actions && <div className="flex-shrink-0 w-full md:w-auto">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ count, cap, color, className }: any) {
  const pct = Math.min(100, (count / Math.max(1, cap)) * 100);
  const c = color || (count >= cap ? "bg-red-500" : count / cap > 0.75 ? "bg-amber-500" : "bg-emerald-500");
  return (
    <div className={className}>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <motion.div className={`h-full ${c}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
      <div className="flex items-center justify-between mt-1 text-[10px]">
        <span className="text-gray-500">{count}/{cap}</span>
        {count >= cap && <span className="text-red-500 font-semibold flex items-center gap-0.5"><AlertTriangle size={10} /> Full</span>}
      </div>
    </div>
  );
}

// ======================== MAIN ========================
export default function ClassSectionTab() {
  const [view, setView] = useState<"dashboard" | "classes" | "assign" | "students">("dashboard");
  const [q, setQ] = useState("");
  const [assignClassId, setAssignClassId] = useState("");
  const [assignStuQ, setAssignStuQ] = useState("");
  const [stuQ, setStuQ] = useState("");
  const [assignedClassFilter, setAssignedClassFilter] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSectionFor, setCreateSectionFor] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: "", capacity: MAX_STUDENTS, room_number: "", sections: [] });
  const [secForm, setSecForm] = useState<any>({ name: "", capacity: MAX_STUDENTS, room_number: "" });
  const [assigning, setAssigning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingReassign, setPendingReassign] = useState<any>(null);
  const [reassignArmed, setReassignArmed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const classes = useApi(() => classApiV2.getClasses(), []);
  const allStudents = useApi(() => studentApi.getAll(), []);
  const unassigned = useApi(() => classApiV2.getUnassignedStudents(), []);
  const assigned = useApi(() => classApiV2.getAllAssignedStudents(), []);

  const students = allStudents.data || [];
  const unassignedList = Array.isArray(unassigned.data) ? unassigned.data : [];
  const assignedList = Array.isArray(assigned.data) ? assigned.data : [];
  const classList = Array.isArray(classes.data)
    ? classes.data.map((c: any) => ({ ...c, name: c.class_name ?? c.name }))
    : [];

  useEffect(() => { setSelectedStudents([]); setAssignStuQ(""); }, [view]);

  const refresh = () => { classes.refetch(); unassigned.refetch(); allStudents.refetch(); assigned.refetch(); };

  const stats = useMemo(() => {
    const totalClasses = classList.length;
    const totalSections = classList.reduce((n: number, c: any) => n + (c.sections?.length || 0), 0);
    const totalStudents = students.length;
    const mappedStudents = assignedList.length;
    return { totalClasses, totalSections, totalStudents, mappedStudents };
  }, [classList, students, assignedList]);

  const targets = useMemo(() => {
    return classList.flatMap((c: any) => {
      const out: any[] = [];
      if (!c.sections?.length) {
        out.push({ id: c.id, name: c.name, kind: "class", count: c.student_count || 0, cap: c.capacity ?? MAX_STUDENTS });
      }
      (c.sections || []).forEach((s: any) => {
        out.push({ id: s.id, name: `${c.name} · Section ${s.name}`, kind: "section", count: s.student_count || 0, cap: s.capacity ?? MAX_STUDENTS });
      });
      return out;
    });
  }, [classList]);

  const fullTargets = targets.filter((t: any) => t.count >= t.cap);
  const nearFullTargets = targets.filter((t: any) => t.count > 0 && t.count / t.cap >= 0.75 && t.count < t.cap);
  const totalSeats = targets.reduce((n: number, t: any) => n + t.cap, 0);
  const totalPlaced = targets.reduce((n: number, t: any) => n + t.count, 0);
  const occupancy = totalSeats ? Math.round((totalPlaced / totalSeats) * 100) : 0;

  const chartData = useMemo(() => {
    return classList.map((c: any) => {
      const direct = c.student_count || 0;
      const sections = (c.sections || []).reduce((s: number, sec: any) => s + (sec.student_count || 0), 0);
      return { name: c.name, direct, sections, students: direct + sections };
    });
  }, [classList]);

  const sectionChartData = useMemo(() => {
    return classList.flatMap((c: any) =>
      (c.sections || []).map((s: any) => ({ name: `${c.name} · ${s.name}`, students: s.student_count || 0 }))
    ).filter((x: any) => x.students > 0);
  }, [classList]);

  const filtered = classList.filter((c: any) => {
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.sections || []).some((s: any) => s.name.toLowerCase().includes(q.toLowerCase()))
    );
  });

  // ---- Assign view derived state ----
  const assignClass = classList.find((c: any) => c.id === assignClassId) || null;
  const sectionsOfAssign = assignClass?.sections || [];
  const nextSection = useMemo(() => {
    if (!assignClass || !sectionsOfAssign.length) return null;
    const sorted = [...sectionsOfAssign].sort((a: any, b: any) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
    const target = sorted.find((s: any) => (s.student_count || 0) < (s.capacity ?? MAX_STUDENTS));
    return target || sorted[0];
  }, [assignClass, sectionsOfAssign]);

  const filteredUnassigned = unassignedList.filter((s: any) => {
    if (!assignStuQ) return true;
    const qq = assignStuQ.toLowerCase();
    return (s.full_name || "").toLowerCase().includes(qq) || (s.roll_number || s.roll_no || "").toLowerCase().includes(qq);
  });

  // Projected destination for each unassigned student using the same server rule:
  // Section A first — the next section is only used when the current one is full
  // (students without sections go direct).
  const destMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!assignClass) return map;
    if (!sectionsOfAssign.length) {
      filteredUnassigned.forEach((s: any) => map.set(s.id, assignClass.name));
      return map;
    }
    const counts = new Map<string, number>(sectionsOfAssign.map((s: any) => [s.id, s.student_count || 0]));
    const capOf = (id: string) => sectionsOfAssign.find((s: any) => s.id === id)?.capacity ?? MAX_STUDENTS;
    const byName = (a: any, b: any) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true });
    const sorted = [...sectionsOfAssign].sort(byName);
    for (const s of filteredUnassigned) {
      const target = sorted.find((sec: any) => (counts.get(sec.id) || 0) < capOf(sec.id));
      if (target) {
        map.set(s.id, `Section ${target.name}`);
        counts.set(target.id, (counts.get(target.id) || 0) + 1);
      } else {
        map.set(s.id, "—");
      }
    }
    return map;
  }, [assignClass, sectionsOfAssign, filteredUnassigned]);

  // Projection of where selected students would land across the class's sections.
  const projection = useMemo(() => {
    if (!assignClass) return null;
    const rows = sectionsOfAssign.map((s: any) => ({ id: s.id, name: s.name, count: s.student_count || 0, cap: s.capacity ?? MAX_STUDENTS, add: 0 }));
    if (!rows.length) {
      return { rows: [], direct: true, leftover: 0, capacity: assignClass.capacity ?? MAX_STUDENTS, current: assignClass.student_count || 0 };
    }
    const ordered = [...rows].sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
    let q = selectedStudents.length;
    for (const r of ordered) {
      if (q <= 0) break;
      const avail = Math.max(0, r.cap - r.count);
      const take = Math.min(avail, q);
      r.add = take;
      q -= take;
    }
    return { rows: ordered, direct: false, leftover: q, capacity: 0, current: 0 };
  }, [assignClass, sectionsOfAssign, selectedStudents]);

  const filteredAssigned = (assignedList || []).filter((r: any) => {
    if (assignedClassFilter && r.class_id !== assignedClassFilter) return false;
    if (!stuQ) return true;
    const qq = stuQ.toLowerCase();
    return (r.student?.full_name || "").toLowerCase().includes(qq) || (r.student?.roll_number || r.student?.roll_no || "").toLowerCase().includes(qq);
  });

  const assignedByClass = useMemo(() => {
    const map = new Map<string, number>();
    (assignedList || []).forEach((r: any) => map.set(r.class_name || "—", (map.get(r.class_name || "—") || 0) + 1));
    return [...map.entries()];
  }, [assignedList]);

  // ---- Class / Section CRUD ----
  const createClass = async () => {
    if (!form.name?.trim()) { toast.error("Class name is required"); return; }
    setSaving(true);
    try {
      const payload: any = { name: form.name.trim(), capacity: Number(form.capacity) || MAX_STUDENTS, room_number: form.room_number || null };
      const sectionNames = (form.sections || []).filter(Boolean).map((s: string) => s.trim()).filter(Boolean);
      if (editRow) {
        await classApiV2.updateClass(editRow.id, payload);
        toast.success("Class updated");
      } else {
        const res = await classApiV2.createClass(payload);
        const newClassId = res.data?.id;
        for (const sn of sectionNames) {
          await classApiV2.createSection(newClassId, { name: sn, capacity: MAX_STUDENTS });
        }
        toast.success("Class created");
      }
      setCreateOpen(false); setEditRow(null); setForm({ name: "", capacity: MAX_STUDENTS, room_number: "", sections: [] });
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to save class");
    } finally { setSaving(false); }
  };

  const openAddModal = () => {
    setEditRow(null);
    setForm({ name: "", capacity: MAX_STUDENTS, room_number: "", sections: [] });
    setCreateOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditRow(c);
    setForm({ name: c.name, capacity: c.capacity ?? MAX_STUDENTS, room_number: c.room_number || "", sections: [] });
    setCreateOpen(true);
  };

  const saveSection = async () => {
    if (!createSectionFor) return;
    if (!secForm.name?.trim()) { toast.error("Section name is required"); return; }
    setSaving(true);
    try {
      const payload = { name: secForm.name.trim(), capacity: Number(secForm.capacity) || MAX_STUDENTS, room_number: secForm.room_number || null };
      if (editRow?.class_id) {
        await classApiV2.updateSection(editRow.id, payload);
        toast.success("Section updated");
      } else {
        await classApiV2.createSection(createSectionFor, payload);
        toast.success("Section created");
      }
      setCreateSectionFor(null); setEditRow(null); setSecForm({ name: "", capacity: MAX_STUDENTS, room_number: "" });
      refresh();
    } catch (e: any) { toast.error(e.message || "Failed to save section"); }
    finally { setSaving(false); }
  };

  const openAddSection = (c: any) => {
    setCreateSectionFor(c.id);
    setEditRow(null);
    setSecForm({ name: "", capacity: MAX_STUDENTS, room_number: "" });
  };

  const openEditSection = (c: any, s: any) => {
    setEditRow(s);
    setCreateSectionFor(c.id);
    setSecForm({ name: s.name, capacity: s.capacity ?? MAX_STUDENTS, room_number: s.room_number || "" });
  };

  const requestDelete = (type: "class" | "section", item: any) => {
    setDeleteTarget({ type, item });
    setDeleteArmed(false);
    setDeleteConfirmText("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    if (!deleteArmed || deleteConfirmText.trim() !== item.name) return;
    setDeleting(true);
    try {
      if (type === "class") {
        const res: any = await classApiV2.deleteClass(item.id);
        toast.success(res.data?.message || "Class deleted");
        if (assignClassId === item.id) setAssignClassId("");
      } else {
        const res: any = await classApiV2.deleteSection(item.id);
        toast.success(res.data?.message || "Section deleted");
      }
      setDeleteTarget(null); setDeleteArmed(false); setDeleteConfirmText("");
      refresh();
    } catch (e: any) { toast.error(e.message || "Delete failed"); }
    finally { setDeleting(false); }
  };

  // ---- Assignment (auto-routes to sections A → B on the server) ----
  const assignOneToClass = async (classId: string, studentId: string, confirm = false) => {
    if (!classId) { toast.error("Select a class first"); return; }
    setAssigning(true);
    try {
      const res: any = await classApiV2.assignStudent(classId, studentId, confirm);
      if (!res.success && res.code === "REASSIGN_REQUIRES_CONFIRM") {
        setPendingReassign({ mode: "single", classId, studentId, currentAssignments: res.details?.current_assignments || [] });
        return;
      }
      if (!res.success) throw new Error(res.error || "Assignment failed");
      toast.success("Student assigned");
      unassigned.refetch(); classes.refetch(); assigned.refetch(); allStudents.refetch();
    } catch (e: any) { toast.error(e.message || "Assignment failed"); }
    finally { setAssigning(false); }
  };

  const assignBulkToClass = async (classId: string, studentIds: string[], confirm = false) => {
    if (!classId) { toast.error("Select a class first"); return; }
    if (!studentIds.length) { toast.error("Select at least one student"); return; }
    setAssigning(true);
    try {
      const res: any = await classApiV2.assignStudentsBulk(classId, studentIds, confirm);
      if (!res.success && res.code === "REASSIGN_REQUIRES_CONFIRM") {
        setPendingReassign({ mode: "bulk", classId, studentIds: [...studentIds], currentAssignments: res.details?.current_assignments || [] });
        return;
      }
      if (!res.success) throw new Error(res.error || "Bulk assignment failed");
      if (res.data?.skipped > 0) {
        toast.warning(`Assigned ${res.data.assigned}, ${res.data.skipped} skipped (sections at ${res.data.current}/${res.data.capacity})`);
      } else {
        toast.success(res.data?.message || `Assigned ${res.data?.assigned || 0} student(s)`);
      }
      setSelectedStudents([]);
      unassigned.refetch(); classes.refetch(); assigned.refetch(); allStudents.refetch();
    } catch (e: any) { toast.error(e.message || "Bulk assignment failed"); }
    finally { setAssigning(false); }
  };

  const removeAssigned = async (row: any) => {
    const name = row.student?.full_name || "student";
    const loc = `${row.class_name || ""}${row.section_name ? ` · Section ${row.section_name}` : ""}`;
    if (!window.confirm(`Remove ${name} from ${loc}?`)) return;
    try {
      await classApiV2.removeStudent(row.section_id || row.class_id, row.student_id);
      toast.success("Student removed");
      assigned.refetch(); unassigned.refetch(); classes.refetch();
    } catch (e: any) { toast.error(e.message || "Remove failed"); }
  };

  const toggleAllUnassigned = () => {
    if (selectedStudents.length === filteredUnassigned.length) setSelectedStudents([]);
    else setSelectedStudents(filteredUnassigned.map((s: any) => s.id).filter(Boolean));
  };

  // ======================== VIEWS ========================
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={Building2} label="Classes" value={stats.totalClasses} color={CLR.primary} bg="#F5F3FF" delay={0} />
          <KpiCard icon={Layers} label="Sections" value={stats.totalSections} color={CLR.info} bg="#EFF6FF" delay={1} />
          <KpiCard icon={CheckCircle2} label="Students Assigned" value={stats.mappedStudents} color={CLR.success} bg="#F0FDF4" delay={2} />
          <KpiCard icon={UserX} label="Unassigned" value={unassignedList.length} color={CLR.danger} bg="#FEF2F2" delay={3} />
          <KpiCard icon={TrendingUp} label="Occupancy" value={`${occupancy}%`} color={CLR.warning} bg="#FFFBEB" delay={4} />
          <KpiCard icon={AlertTriangle} label="Full Sections" value={fullTargets.length} color={CLR.danger} bg="#FEF2F2" delay={5} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 border border-gray-100 rounded-xl bg-white/80 backdrop-blur-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Students by Class</h3>
              <Badge className="text-[9px] bg-[#F3F0FF] text-[#6D4CFF]">{chartData.reduce((n, c) => n + c.students, 0)} total</Badge>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barSize={26}>
                  <defs>
                    <linearGradient id="gDirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6D4CFF" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.75} />
                    </linearGradient>
                    <linearGradient id="gSection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid #f0f0f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} cursor={{ fill: "rgba(109,76,255,0.04)" }} />
                  <Bar dataKey="direct" name="Direct" stackId="a" fill="url(#gDirect)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="sections" name="Sections" stackId="a" fill="url(#gSection)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No class data yet" />
            )}
          </Card>

          <Card className="p-5 border border-gray-100 rounded-xl bg-white/80 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Overall Occupancy</h3>
            {totalSeats > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="62%" outerRadius="95%" barSize={14} data={[{ name: "occupancy", value: occupancy }]}>
                    <RadialBar dataKey="value" fill={occupancy >= 90 ? "#EF4444" : occupancy >= 75 ? "#F59E0B" : "#6D4CFF"} cornerRadius={10} background={{ fill: "#F3F0FF" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-3xl font-extrabold text-gray-900">{occupancy}%</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">{totalPlaced}/{totalSeats} seats filled</div>
                </div>
              </div>
            ) : (
              <EmptyState message="No capacity data" />
            )}
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-extrabold text-[#6D4CFF]">{fullTargets.length}</div>
                <div className="text-[9px] text-gray-400">Full</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-amber-500">{nearFullTargets.length}</div>
                <div className="text-[9px] text-gray-400">Near full</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-emerald-500">{targets.length - fullTargets.length - nearFullTargets.length}</div>
                <div className="text-[9px] text-gray-400">Available</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts + distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sectionChartData.length > 0 && (
            <Card className="p-5 border border-gray-100 rounded-xl bg-white/80 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Section Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie data={sectionChartData} dataKey="students" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={80} paddingAngle={2} label={({ name }: any) => name?.split(" · ").pop()}>
                    {sectionChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                </RePieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {(fullTargets.length > 0 || nearFullTargets.length > 0) && (
            <Card className="p-4 border border-red-100 rounded-xl bg-red-50/40">
              <h3 className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1.5"><AlertTriangle size={13} /> Attention ({fullTargets.length + nearFullTargets.length})</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {[...fullTargets, ...nearFullTargets].map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between text-[11px] text-gray-600">
                    <span className="font-medium truncate flex items-center gap-1.5">
                      {t.count >= t.cap ? <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      {t.name}
                    </span>
                    <Badge variant={t.count >= t.cap ? "danger" : "warning"} className="text-[9px]">{t.count}/{t.cap}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {unassignedList.length > 0 && (
            <Card className="p-4 border border-blue-100 rounded-xl bg-blue-50/40">
              <h3 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1.5"><UserX size={13} /> Unassigned ({unassignedList.length})</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {unassignedList.slice(0, 8).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between text-[11px] text-blue-600/90">
                    <span className="font-medium truncate">{s.full_name || s.name}</span>
                    <span className="text-blue-400">{s.roll_number || s.roll_no || ""}</span>
                  </div>
                ))}
                {unassignedList.length > 8 && <div className="text-[10px] text-blue-400">+{unassignedList.length - 8} more</div>}
              </div>
              <button onClick={() => setView("assign")} className="mt-2 text-[11px] font-semibold text-[#6D4CFF] hover:underline flex items-center gap-1">
                Assign now <ArrowRight size={11} />
              </button>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderClasses = () => {
    return (
      <motion.div {...viewMotion} className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search classes / sections..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh"><RefreshCw size={14} /></button>
            <AddButton onClick={openAddModal} label="Add Class" />
          </div>
        </div>

        {classes.loading ? (
          <LoadingSkeleton rows={5} cols={5} />
        ) : classes.error ? (
          <ErrorState message={classes.error} onRetry={classes.refetch} />
        ) : filtered.length === 0 ? (
          <div className="p-8"><EmptyState message="No classes found" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c: any, idx: number) => {
              const classTotal = (c.student_count || 0) + (c.sections || []).reduce((s: number, sec: any) => s + (sec.student_count || 0), 0);
              const cap = c.capacity ?? MAX_STUDENTS;
              return (
                <motion.div
                  key={c.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={idx}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                >
                  {/* Class header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                          <GraduationCap size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold leading-tight truncate">{c.name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-white/80 mt-0.5">
                            {c.room_number && (
                              <span className="flex items-center gap-1"><DoorOpen size={10} /> Room {c.room_number}</span>
                            )}
                            <span className="flex items-center gap-1"><Layers size={10} /> {(c.sections || []).length} section{(c.sections || []).length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-extrabold leading-none">{classTotal}</div>
                        <div className="text-[9px] text-white/70 uppercase tracking-wider mt-1">Students</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] text-white/85 mb-1">
                        <span>{classTotal}/{cap} capacity</span>
                        <span>{cap ? Math.min(100, Math.round((classTotal / cap) * 100)) : 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${cap ? Math.min(100, (classTotal / cap) * 100) : 0}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1 bg-gray-50/50">
                    {(c.sections || []).length > 0 ? (
                      (c.sections || []).map((s: any) => {
                        const scount = s.student_count || 0;
                        const scap = s.capacity ?? MAX_STUDENTS;
                        const spct = Math.min(100, (scount / Math.max(1, scap)) * 100);
                        const full = scount >= scap;
                        return (
                          <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 ${full ? "bg-red-50 text-red-600" : spct >= 75 ? "bg-amber-50 text-amber-600" : "bg-[#6D4CFF]/10 text-[#6D4CFF]"}`}>
                                  {s.name}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-gray-800">Section {s.name}</div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                                    {s.room_number && (
                                      <span className="flex items-center gap-1"><DoorOpen size={9} /> Room {s.room_number}</span>
                                    )}
                                    {s.room_number && <span className="text-gray-200">•</span>}
                                    <span className="flex items-center gap-1"><Users size={9} /> {scount}/{scap}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => openEditSection(c, s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Edit Section"><Edit3 size={13} /></button>
                                <button onClick={() => requestDelete("section", s)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Delete Section"><Trash2 size={13} /></button>
                              </div>
                            </div>
                            <ProgressBar count={scount} cap={scap} />
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 px-4 text-center bg-white rounded-xl border border-dashed border-gray-200">
                        <DoorOpen size={20} className="text-gray-300 mb-2" />
                        <p className="text-[11px] text-gray-400 mb-3">No sections yet — students are assigned directly to this class.</p>
                        <button onClick={() => openAddSection(c)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#6D4CFF]/10 transition-colors">
                          <Plus size={12} /> Add Section
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Class footer actions */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2 bg-white">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openAddSection(c)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors" title="Add Section">
                        <Plus size={12} /> Section
                      </button>
                      <button onClick={() => openEditModal(c)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors" title="Edit Class">
                        <Edit3 size={12} /> Edit
                      </button>
                    </div>
                    <button onClick={() => requestDelete("class", c)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Class">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Class */}
        <CrudModal open={createOpen} onClose={() => { setCreateOpen(false); setEditRow(null); }} title={editRow ? `Edit ${editRow.name}` : "Add Class"}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Class 1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Capacity (per section)</label>
                <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Room</label>
                <input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} placeholder="e.g. 101" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              </div>
            </div>
            {!editRow && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sections (comma separated, e.g. A, B, C — optional)</label>
                <input
                  value={form.sections.join(", ")}
                  onChange={(e) => setForm({ ...form, sections: e.target.value.split(",").map((s: string) => s.trim()) })}
                  placeholder="Leave empty for a class with no sections"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
                />
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5"><Sparkles size={12} /> Students assigned to a class with sections are auto-placed in Section A first (B only when A is full).</p>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => { setCreateOpen(false); setEditRow(null); }} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={createClass} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} {editRow ? "Save Changes" : "Create Class"}
              </button>
            </div>
          </div>
        </CrudModal>

        {/* Add / Edit Section */}
        <CrudModal open={createSectionFor !== null} onClose={() => { setCreateSectionFor(null); setEditRow(null); }} title={editRow?.class_id ? `Edit Section ${editRow.name}` : "Add Section"}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Section Name <span className="text-red-500">*</span></label>
                <input value={secForm.name} onChange={(e) => setSecForm({ ...secForm, name: e.target.value })} placeholder="e.g. A" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                <input type="number" value={secForm.capacity} onChange={(e) => setSecForm({ ...secForm, capacity: e.target.value })} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Room</label>
                <input value={secForm.room_number} onChange={(e) => setSecForm({ ...secForm, room_number: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => { setCreateSectionFor(null); setEditRow(null); }} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveSection} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} {editRow?.class_id ? "Save Changes" : "Add Section"}
              </button>
            </div>
          </div>
        </CrudModal>
      </motion.div>
    );
  };

  const renderAssign = () => {
    const selCap = projection?.direct ? projection.capacity : 0;
    const selCount = projection?.direct ? projection.current : 0;
    return (
      <motion.div {...viewMotion} className="space-y-5">
        {/* Class picker */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1 · Choose a class</label>
          <div className="flex flex-wrap gap-2">
            {classList.map((c: any) => {
              const total = (c.student_count || 0) + (c.sections || []).reduce((s: number, sec: any) => s + (sec.student_count || 0), 0);
              const active = assignClassId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setAssignClassId(c.id); setSelectedStudents([]); }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${active ? "bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-transparent shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-[#6D4CFF]/40 hover:text-[#6D4CFF]"}`}
                >
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={13} />
                    {c.name}
                    <span className={`text-[10px] font-bold ${active ? "text-white/80" : "text-gray-400"}`}>{total} st</span>
                  </span>
                </button>
              );
            })}
            {!classList.length && <span className="text-xs text-gray-400 py-2">No classes yet. Create a class first.</span>}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {assignClass && (
            <motion.div key={assignClass.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="space-y-5">
              {/* Auto-assign flow */}
              <Card className="p-5 border border-[#6D4CFF]/15 rounded-xl bg-gradient-to-br from-[#F8F6FF] to-white overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#6D4CFF]/10 blur-2xl anim-float" />
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] flex items-center justify-center"><Sparkles size={13} /></span>
                  <h3 className="text-sm font-bold text-gray-800">Auto-Assign · {assignClass.name}</h3>
                </div>
                <p className="text-[11px] text-gray-400 mb-4">
                  Students are placed in <strong className="text-[#6D4CFF]">Section A first</strong>. Only when A is full does the next student automatically go to Section B, then C.
                </p>

                {sectionsOfAssign.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(sectionsOfAssign || []).map((s: any) => {
                      const proj = projection?.rows?.find((p: any) => p.id === s.id);
                      const isNext = nextSection?.id === s.id;
                      return (
                        <div key={s.id} className={`p-3 rounded-xl border transition-all ${isNext ? "border-[#6D4CFF]/40 bg-[#6D4CFF]/[0.04] ring-1 ring-[#6D4CFF]/20" : "border-gray-100 bg-white"}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              Section {s.name}
                              {isNext && <span className="px-1.5 py-0.5 rounded bg-[#6D4CFF] text-white text-[8px] font-bold uppercase">next</span>}
                            </span>
                            <span className="text-[10px] text-gray-400">{s.student_count || 0}/{s.capacity ?? MAX_STUDENTS}</span>
                          </div>
                          <ProgressBar count={s.student_count || 0} cap={s.capacity ?? MAX_STUDENTS} />
                          {proj?.add > 0 && (
                            <div className="mt-1.5 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Plus size={10} /> {proj.add} here
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><GraduationCap size={13} /> {assignClass.name} (no sections)</span>
                      <span className="text-[10px] text-gray-400">{selCount}/{selCap}</span>
                    </div>
                    <ProgressBar count={selCount} cap={selCap} />
                    <p className="text-[10px] text-gray-400 mt-2">This class has no sections — students are assigned directly to the class.</p>
                  </div>
                )}

                {selectedStudents.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-white border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">{selectedStudents.length} student(s) selected</span>
                      <span className="text-[10px] text-gray-400">distribution preview</span>
                    </div>
                    {projection?.direct ? (
                      <div className="text-[11px] text-gray-500">
                        Will be assigned directly to <strong>{assignClass.name}</strong> ({projection.current}/{projection.capacity} now
                        {projection.leftover > 0 ? <span className="text-amber-600 font-semibold"> · {projection.leftover} will not fit</span> : null}).
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(projection?.rows || []).filter((r: any) => r.add > 0).map((r: any) => (
                          <div key={r.id} className="text-[11px] text-gray-600 flex items-center justify-between">
                            <span>Section {r.name}</span>
                            <span className="font-bold text-[#6D4CFF]">+{r.add}</span>
                          </div>
                        ))}
                        {!!projection && projection.leftover > 0 && (
                          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                            <AlertTriangle size={11} /> {projection.leftover} will not fit (sections full)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Unassigned students */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">2 · Unassigned students</h3>
                    <Badge className="text-[9px] bg-[#FEF2F2] text-red-500">{unassignedList.length} available</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={assignStuQ} onChange={(e) => setAssignStuQ(e.target.value)} placeholder="Search students..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
                    </div>
                    <button onClick={toggleAllUnassigned} className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                      {selectedStudents.length ? `Clear (${selectedStudents.length})` : "Select all"}
                    </button>
                    <button
                      onClick={() => assignBulkToClass(assignClassId, selectedStudents)}
                      disabled={assigning || !selectedStudents.length}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50"
                    >
                      {assigning ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                      Assign {selectedStudents.length ? `${selectedStudents.length}` : ""} to {assignClass.name}
                    </button>
                  </div>
                </div>

                <Card className="border border-gray-100 rounded-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                  {unassigned.loading ? (
                    <LoadingSkeleton rows={4} cols={4} />
                  ) : unassigned.error ? (
                    <ErrorState message={unassigned.error} onRetry={unassigned.refetch} />
                  ) : filteredUnassigned.length === 0 ? (
                    <div className="p-8"><EmptyState message={unassignedList.length ? "No students match the search" : "No unassigned students 🎉"} /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                            <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                            <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Goes to</th>
                            <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUnassigned.map((s: any, i: number) => (
                            <tr key={s.id} className="border-b border-gray-50 hover:bg-purple-50/40 transition-colors">
                              <td className="p-3">
                                <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => setSelectedStudents((prev) => prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id])} className="accent-[#6D4CFF]" />
                              </td>
                              <td className="p-3 text-sm font-medium text-gray-800">{s.full_name || s.name}</td>
                              <td className="p-3 text-xs text-gray-600">{s.roll_number || s.roll_no || "—"}</td>
                              <td className="p-3"><Badge variant="success" className="text-[9px]">{s.status || "active"}</Badge></td>
                              <td className="p-3">
                                {destMap.get(s.id) ? (
                                  <span className="text-[11px] font-semibold text-[#6D4CFF]">{destMap.get(s.id)}</span>
                                ) : (
                                  <span className="text-[11px] text-gray-400">—</span>
                                )}
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => assignOneToClass(assignClassId, s.id)}
                                  disabled={assigning}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-bold hover:bg-[#6D4CFF] hover:text-white transition-colors disabled:opacity-50"
                                >
                                  <ArrowRight size={11} /> Assign
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderStudents = () => {
    return (
      <motion.div {...viewMotion} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Assigned Students</h3>
            <Badge className="text-[9px] bg-[#F0FDF4] text-emerald-600">{assignedList.length} assigned</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={stuQ} onChange={(e) => setStuQ(e.target.value)} placeholder="Search students..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
            </div>
            <select value={assignedClassFilter} onChange={(e) => setAssignedClassFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
              <option value="">All Classes</option>
              {classList.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={refresh} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh"><RefreshCw size={14} /></button>
          </div>
        </div>

        {assignedByClass.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assignedByClass.map(([name, count]) => (
              <span key={name} className="px-3 py-1.5 rounded-full bg-[#F3F0FF] text-[10px] font-bold text-[#6D4CFF] border border-[#6D4CFF]/10">
                {name} · {count}
              </span>
            ))}
          </div>
        )}

        <Card className="border border-gray-100 rounded-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          {assigned.loading ? (
            <LoadingSkeleton rows={5} cols={5} />
          ) : assigned.error ? (
            <ErrorState message={assigned.error} onRetry={assigned.refetch} />
          ) : filteredAssigned.length === 0 ? (
            <div className="p-8"><EmptyState message="No assigned students yet" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssigned.map((r: any) => (
                    <tr key={r.student_id} className="border-b border-gray-50 hover:bg-purple-50/40 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white shrink-0 text-[11px] font-bold">
                            {(r.student?.full_name || "?").slice(0, 1).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{r.student?.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-600">{r.class_name || "—"}</td>
                      <td className="p-3">
                        {r.section_name ? (
                          <Badge className="text-[9px] bg-[#F3F0FF] text-[#6D4CFF]">Section {r.section_name}</Badge>
                        ) : (
                          <Badge className="text-[9px] bg-gray-100 text-gray-500">Direct</Badge>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-600">{r.student?.roll_number || r.student?.roll_no || "—"}</td>
                      <td className="p-3"><Badge variant={r.student?.status === "active" ? "success" : "warning"} className="text-[9px]">{r.student?.status || "—"}</Badge></td>
                      <td className="p-3">
                        <button onClick={() => removeAssigned(r)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Remove"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  // ======================== MAIN RENDER ========================
  return (
    <ModulePage
      icon={Building2}
      gradient="bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6]"
      title="Class & Section Management"
      desc="Manage classes, sections and smart student assignment"
      actions={
        <div className="flex gap-2">
          {view === "assign" && !assignClassId && classList.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-xs font-semibold"><Sparkles size={13} /> Pick a class to start</span>
          )}
        </div>
      }
    >
      <div className="flex gap-1 flex-wrap mb-6 p-1 bg-gray-100/60 rounded-xl">
        {NAVS.map((n) => (
          <button
            key={n.key}
            onClick={() => setView(n.key as any)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${view === n.key ? "text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            {view === n.key && (
              <motion.span layoutId="classNavPill" className="absolute inset-0 bg-white rounded-lg shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <n.icon size={14} />
              {n.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
          {view === "dashboard" && renderDashboard()}
          {view === "classes" && renderClasses()}
          {view === "assign" && renderAssign()}
          {view === "students" && renderStudents()}
        </motion.div>
      </AnimatePresence>

      {/* Reassign confirmation */}
      {pendingReassign && (
        <CrudModal open={!!pendingReassign} onClose={() => { setPendingReassign(null); setReassignArmed(false); }} title="Re-assign student(s)?">
          <p className="text-xs text-gray-500 mb-4">
            {pendingReassign.mode === "bulk"
              ? `${pendingReassign.studentIds.length} selected student(s) are already assigned to another class/section. Re-assigning will move them here, replacing their previous assignment.`
              : "This student is already assigned to another class/section. Re-assigning will move them here, replacing their previous assignment."}
          </p>
          {pendingReassign.currentAssignments?.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-600 max-h-24 overflow-y-auto">
              {pendingReassign.currentAssignments.map((a: any, i: number) => (
                <div key={i} className="py-0.5">• Currently in {a.class_name}{a.section_name ? ` · Section ${a.section_name}` : ""}</div>
              ))}
            </div>
          )}
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={reassignArmed} onChange={(e) => setReassignArmed(e.target.checked)} className="mt-0.5 accent-[#6D4CFF]" />
              <span className="text-[11px] text-amber-800 font-medium">I understand the previous assignment will be replaced.</span>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setPendingReassign(null); setReassignArmed(false); }} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
            <button
              disabled={!reassignArmed}
              onClick={async () => {
                const req = pendingReassign;
                setPendingReassign(null);
                setReassignArmed(false);
                if (req.mode === "bulk") {
                  await assignBulkToClass(req.classId, req.studentIds, true);
                } else {
                  await assignOneToClass(req.classId, req.studentId, true);
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs text-white disabled:opacity-40"
            >
              Yes, move {pendingReassign.mode === "bulk" ? `${pendingReassign.studentIds.length} student(s)` : "student"} here
            </button>
          </div>
        </CrudModal>
      )}

      {/* Double-confirmation delete */}
      {deleteTarget && (
        <CrudModal open={!!deleteTarget} onClose={() => { if (!deleting) { setDeleteTarget(null); setDeleteArmed(false); setDeleteConfirmText(""); } }} title={`Delete ${deleteTarget.type === "class" ? "Class" : "Section"}`}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0"><AlertTriangle size={17} /></div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">Delete "{deleteTarget.item.name}"?</h4>
              <p className="text-xs text-gray-500 mt-1">
                {deleteTarget.type === "class"
                  ? `This will delete the class and its ${deleteTarget.item.sections?.length || 0} section(s). Students currently assigned will be unassigned and can be re-assigned later.`
                  : "Students currently in this section will be fully unassigned (class + section) and can be re-assigned later."}
              </p>
            </div>
          </div>

          {!deleteArmed ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-[11px] text-red-600 flex items-start gap-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span><strong>Step 1 of 2:</strong> This action cannot be undone. Review the details above before continuing.</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={() => setDeleteArmed(true)} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-xs text-white"><Trash2 size={13} className="inline mr-1" /> Continue to Confirmation</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-[11px] text-red-600 flex items-start gap-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span><strong>Step 2 of 2:</strong> Type <strong>{deleteTarget.item.name}</strong> exactly to confirm permanent deletion.</span>
              </div>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`Type "${deleteTarget.item.name}" to confirm`}
                autoFocus
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setDeleteTarget(null); setDeleteArmed(false); setDeleteConfirmText(""); }} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50" disabled={deleting}>Cancel</button>
                <button
                  disabled={deleting || deleteConfirmText.trim() !== deleteTarget.item.name}
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-xs text-white disabled:opacity-40"
                >
                  {deleting ? <Loader2 size={13} className="inline animate-spin" /> : <Trash2 size={13} className="inline mr-1" />} Permanently Delete
                </button>
              </div>
            </div>
          )}
        </CrudModal>
      )}
    </ModulePage>
  );
}