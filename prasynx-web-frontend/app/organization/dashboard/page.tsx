export default function OrganizationDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Organization Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage partnerships, programs, and impact metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Programs', value: '8' },
          { label: 'Partner Institutions', value: '24' },
          { label: 'Students Reached', value: '5,200' },
          { label: 'Impact Score', value: 'A+' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs font-bold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-base font-black text-slate-900">Ongoing Programs</h2>
        <div className="mt-4 space-y-3">
          {['Teacher Training Initiative - 12 schools', 'Digital Literacy Program - 2,400 students', 'Career Counseling Workshops - 8 sessions', 'STEM Education Grant - 5 partner institutions'].map((prog) => (
            <div key={prog} className="flex items-center gap-3 rounded-xl bg-[#F8FAFF] px-4 py-3 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-green-400" /> {prog}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
