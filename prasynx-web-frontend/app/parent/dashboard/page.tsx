import { BookOpen, Users, TrendingUp, Calendar } from 'lucide-react';

export default function ParentDashboard() {
  const stats = [
    { label: 'Children Enrolled', value: '2', change: 'Both active', icon: Users },
    { label: 'Upcoming Events', value: '3', change: 'This month', icon: Calendar },
    { label: 'Pending Fees', value: '₹12,500', change: 'Due in 5 days', icon: BookOpen },
    { label: 'Avg. Performance', value: '87%', change: '+2% improvement', icon: TrendingUp },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Parent Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Stay informed about your child education journey.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]">
                <Icon size={18} />
              </span>
              <p className="mt-4 text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500">{stat.label}</p>
              <p className="mt-1 text-[10px] font-semibold text-[#7C3AED]">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Recent Updates</h2>
          <div className="mt-4 space-y-3">
            {['Math test score: 92/100', 'Parent-teacher meeting scheduled', 'New assignment: Science project', 'Attendance report for this month'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-[#F8FAFF] px-4 py-3 text-xs font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {['View Reports', 'Pay Fees', 'Message Teacher', 'Apply Leave'].map((action) => (
              <button key={action} className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
