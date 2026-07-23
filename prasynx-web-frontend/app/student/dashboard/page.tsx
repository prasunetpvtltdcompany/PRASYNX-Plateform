import { BarChart3, Bell, BookOpen, Calendar, TrendingUp, GraduationCap } from 'lucide-react';

export default function StudentDashboard() {
  const stats = [
    { label: 'Enrolled Courses', value: '6', change: '+2 this semester', icon: BookOpen },
    { label: 'Current GPA', value: '3.8', change: '+0.2 from last term', icon: TrendingUp },
    { label: 'Pending Assignments', value: '3', change: 'Due this week', icon: GraduationCap },
    { label: 'Upcoming Exams', value: '2', change: 'Next 7 days', icon: Calendar },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Student Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back! Here is your academic overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500">{stat.label}</p>
              <p className="mt-1 text-[10px] font-semibold text-[#7C3AED]">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {['Grade posted: Mathematics - A', 'Assignment submitted: Physics Lab Report', 'New course material: Computer Science', 'Quiz scheduled: English Literature'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-[#F8FAFF] px-4 py-3 text-xs font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Upcoming</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[#E8E0FF] bg-[#F3F0FF] p-3">
              <p className="text-[10px] font-bold text-[#7C3AED]">TOMORROW</p>
              <p className="mt-1 text-xs font-bold text-slate-900">Math Final Exam</p>
              <p className="text-[10px] text-slate-500">10:00 AM - Room 301</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] p-3">
              <p className="text-[10px] font-bold text-slate-400">NEXT WEEK</p>
              <p className="mt-1 text-xs font-bold text-slate-900">Physics Practical</p>
              <p className="text-[10px] text-slate-500">Lab 2 - 2:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
