import { BookOpen, Users, BarChart3, Calendar } from 'lucide-react';

export default function StaffDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your classes, students, and gradebook.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Classes', value: '4', icon: BookOpen },
          { label: 'Total Students', value: '128', icon: Users },
          { label: 'Avg. Performance', value: '82%', icon: BarChart3 },
          { label: "Today's Classes", value: '3', icon: Calendar },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]"><Icon size={18} /></span>
              <p className="mt-4 text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Upcoming Classes</h2>
          <div className="mt-4 space-y-3">
            {[
              { time: '09:00 AM', subject: 'Mathematics - Class 10A' },
              { time: '10:30 AM', subject: 'Physics - Class 12B' },
              { time: '01:00 PM', subject: 'Chemistry - Class 11C' },
            ].map((c) => (
              <div key={c.time} className="flex items-center gap-4 rounded-xl bg-[#F8FAFF] px-4 py-3">
                <span className="text-[10px] font-bold text-[#7C3AED]">{c.time}</span>
                <span className="text-xs font-semibold text-slate-700">{c.subject}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Pending Tasks</h2>
          <div className="mt-4 space-y-3">
            {['Grade 15 assignments', 'Prepare weekly report', 'Schedule parent meeting', 'Upload study material'].map((task) => (
              <div key={task} className="flex items-center gap-3 rounded-xl bg-[#F8FAFF] px-4 py-3 text-xs font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {task}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
