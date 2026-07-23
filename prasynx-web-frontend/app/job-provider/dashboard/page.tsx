export default function JobProviderDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Recruiter Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Find and hire top talent from educational institutions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Jobs', value: '12' },
          { label: 'Total Applications', value: '347' },
          { label: 'Shortlisted', value: '48' },
          { label: 'Hires This Month', value: '6' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Recent Applications</h2>
          <div className="mt-4 space-y-2">
            {[
              { name: 'Priya Sharma', role: 'Software Engineer', score: '92%' },
              { name: 'Rahul Verma', role: 'Data Analyst', score: '88%' },
              { name: 'Ananya Patel', role: 'Product Manager', score: '85%' },
            ].map((app) => (
              <div key={app.name} className="flex items-center justify-between rounded-xl bg-[#F8FAFF] px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">{app.name}</p>
                  <p className="text-[10px] text-slate-500">{app.role}</p>
                </div>
                <span className="rounded-lg bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{app.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-base font-black text-slate-900">Job Performance</h2>
          <div className="mt-4 space-y-2">
            {['Frontend Developer - 45 applicants', 'Data Scientist - 32 applicants', 'UX Designer - 28 applicants', 'Marketing Lead - 21 applicants'].map((job) => (
              <div key={job} className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-xs font-semibold text-slate-700">{job}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
