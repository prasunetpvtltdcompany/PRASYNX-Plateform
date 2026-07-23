import { Building2, Users, BookOpen, DollarSign } from 'lucide-react';

export default function ManagementDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Institution Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Complete ERP and management overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Students', value: '1,247', change: '+12%', icon: Users },
          { label: 'Staff Members', value: '89', change: 'Full-time', icon: Building2 },
          { label: 'Classes', value: '42', change: 'Active', icon: BookOpen },
          { label: 'Monthly Revenue', value: '₹28.5L', change: '+8%', icon: DollarSign },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]"><Icon size={18} /></span>
              <p className="mt-4 text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500">{stat.label}</p>
              <p className="mt-1 text-[10px] font-semibold text-green-600">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {['New student enrollment: 15 students', 'Fee collection: ₹4.2L this week', 'Staff meeting scheduled', 'Exam timetable published'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-[#F8FAFF] px-4 py-3 text-xs font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]" /> {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Quick Stats</h2>
          <div className="mt-4 space-y-2">
            {['Attendance Today: 94%', 'Pending Approvals: 8', 'Library Books Issued: 23', 'Transport Routes Active: 5'].map((stat) => (
              <div key={stat} className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-xs font-semibold text-slate-700">{stat}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
