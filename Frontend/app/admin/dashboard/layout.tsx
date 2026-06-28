"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Grid, 
  Users, 
  Building2, 
  Stethoscope, 
  CalendarDays, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  Bell
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    router.push("/login");
  };

  // Re-architected: "Hospitals", "Doctors", and "Appointments" now live inside Core
  const coreLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: Grid },
    { name: "Patients", href: "/admin/dashboard/patients", icon: Users },
    { name: "Hospitals", href: "/admin/dashboard/facilities", icon: Building2 },
    { name: "Doctors", href: "/admin/dashboard/staff", icon: Stethoscope },
    { name: "Appointments", href: "/admin/dashboard/appointments", icon: CalendarDays },
  ];

  // Ops is now cleanly isolated to just Analytics
  const opsLinks = [
    { name: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
  ];

  const renderNavLinks = (links: typeof coreLinks) => {
    return links.map((link) => {
      const isActive = pathname === link.href;
      const Icon = link.icon;
      return (
        <button
          key={link.name}
          onClick={() => router.push(link.href)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
            isActive
              ? "bg-[#edf4ff] text-[#0057d9]"
              : "text-[#64748b] hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Icon size={18} className={isActive ? "text-[#0057d9]" : "text-[#94a3b8]"} />
          {link.name}
        </button>
      );
    });
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans antialiased text-[#1e293b]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-slate-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo Brand area with updated Medical Kit Case Logo */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0057d9] rounded-[11px] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,87,217,0.25)]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v1H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-4zm-6-1h4v1h-4V5zm7 10h-3v3h-2v-3H9v-2h3v-3h2v3h3v2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Mediconnect</h2>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-0.5">Admin</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-3 space-y-5 mt-4">
            <div>
              <p className="px-4 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Core</p>
              <nav className="space-y-0.5">{renderNavLinks(coreLinks)}</nav>
            </div>
            <div>
              <p className="px-4 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Ops</p>
              <nav className="space-y-0.5">{renderNavLinks(opsLinks)}</nav>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar actions */}
        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium text-[#64748b] hover:bg-gray-50">
            <Settings size={18} className="text-[#94a3b8]" />
            Settings
          </button>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} className="text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search infrastructure..." 
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50/50 rounded-lg text-sm border border-transparent focus:bg-white focus:border-slate-200 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-emerald-600 text-[12px] font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              SYNC LIVE
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                AR
              </div>
              <span className="text-sm font-semibold text-slate-700">Admin Root</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#f8fafc] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}