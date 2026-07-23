export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">System-wide overview and management.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: '12,458' },
          { label: 'Active Institutions', value: '156' },
          { label: 'Total Students', value: '8,234' },
          { label: 'Monthly Revenue', value: '₹85.2L' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Recent Signups</h2>
          <div className="mt-4 space-y-2">
            {[
              { name: 'Delhi Public School', type: 'Institution', time: '2 hours ago' },
              { name: 'Google India', type: 'Recruiter', time: '5 hours ago' },
              { name: 'Priya Sharma', type: 'Student', time: '1 day ago' },
              { name: 'UNICEF Education', type: 'Organization', time: '2 days ago' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-[#F8FAFF] px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-500">{item.type}</p>
                </div>
                <span className="text-[10px] text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Platform Metrics</h2>
          <div className="mt-4 space-y-2">
            {['Active Users Today: 3,245', 'New Registrations: 127', 'Pending Verifications: 8', 'System Uptime: 99.97%'].map((metric) => (
              <div key={metric} className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-xs font-semibold text-slate-700">{metric}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
