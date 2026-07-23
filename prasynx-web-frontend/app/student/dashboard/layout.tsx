import { GraduationCap, BookOpen, BarChart3, Bell, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFF]">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] px-6 py-4">
          <img src="/logo.png" alt="Prasynx" className="h-8 w-auto" />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {[
            { href: '/student/dashboard', label: 'Dashboard', icon: BarChart3 },
            { href: '/student/courses', label: 'My Courses', icon: BookOpen },
            { href: '/student/grades', label: 'Grades', icon: GraduationCap },
            { href: '/student/profile', label: 'Profile', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-[#F3F0FF] hover:text-[#7C3AED]">
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#E2E8F0] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-[10px] font-bold text-white">S</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">Student</p>
              <p className="text-[10px] text-slate-500 capitalize">Student</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
