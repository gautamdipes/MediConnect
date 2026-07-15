"use client";

import { useState, type ComponentType } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BedDouble,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

type Icon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

type NavigationItem = {
  label: string;
  icon: Icon;
};

const primaryNavigation: NavigationItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Patients", icon: Users },
  { label: "Appointments", icon: CalendarDays },
  { label: "Analytics", icon: BarChart3 },
];

const secondaryNavigation: NavigationItem[] = [
  { label: "Settings", icon: Settings },
];

const appointments = [
  { patient: "Aarav Sharma", initials: "AS", doctor: "Dr. Meera Shah", time: "09:30 AM", type: "Cardiology", status: "Confirmed" },
  { patient: "Sofia Rai", initials: "SR", doctor: "Dr. Rohan Gupta", time: "10:15 AM", type: "General Care", status: "Pending" },
  { patient: "Ritesh Thapa", initials: "RT", doctor: "Dr. Anika Patel", time: "11:00 AM", type: "Neurology", status: "Confirmed" },
  { patient: "Maya Joshi", initials: "MJ", doctor: "Dr. Meera Shah", time: "11:45 AM", type: "Cardiology", status: "Checked in" },
];

const activities = [
  { title: "New appointment booked", detail: "Aarav Sharma • 09:30 AM", time: "10 min ago", icon: CalendarDays, tone: "bg-blue-50 text-[#0057d9]" },
  { title: "Patient checked in", detail: "Maya Joshi • Cardiology", time: "32 min ago", icon: ClipboardList, tone: "bg-emerald-50 text-emerald-600" },
  { title: "Medical record updated", detail: "Sofia Rai • Lab results", time: "1 hr ago", icon: FileText, tone: "bg-violet-50 text-violet-600" },
];

function NavigationButton({
  item,
  active,
  onClick,
}: {
  item: NavigationItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition-colors ${
        active
          ? "bg-[#0057d9] text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={18} strokeWidth={2.2} />
      {item.label}
    </button>
  );
}

function HospitalSidebar({
  activeItem,
  onSelect,
  mobile,
  onClose,
}: {
  activeItem: string;
  onSelect: (label: string) => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside className={`flex h-full w-[272px] flex-col border-r border-slate-100 bg-white px-4 py-5 ${mobile ? "shadow-2xl" : ""}`}>
      <div className="flex items-center justify-between px-2">
        <BrandLogo
          size={35}
          showText
          subtitle="Hospital Portal"
          textClassName="text-[18px] font-black tracking-tight text-[#0057d9] leading-none"
          subtitleClassName="mt-1 text-[10px] font-bold tracking-wide text-slate-400"
        />
        {mobile && (
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="mt-9 space-y-1" aria-label="Hospital navigation">
        <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        {primaryNavigation.map((item) => (
          <NavigationButton key={item.label} item={item} active={activeItem === item.label} onClick={() => onSelect(item.label)} />
        ))}
      </nav>

      <nav className="mt-auto space-y-1 border-t border-slate-100 pt-5" aria-label="Hospital settings">
        {secondaryNavigation.map((item) => (
          <NavigationButton key={item.label} item={item} active={activeItem === item.label} onClick={() => onSelect(item.label)} />
        ))}
      </nav>

      <button type="button" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
        <LogOut size={18} strokeWidth={2.2} />
        Log out
      </button>
    </aside>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: Icon;
  tone: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={21} strokeWidth={2.2} />
        </div>
        <button type="button" className="rounded-lg p-1 text-slate-300 hover:bg-slate-50 hover:text-slate-500" aria-label={`More ${label} options`}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <ArrowUpRight size={14} strokeWidth={2.5} />
        {helper}
      </p>
    </section>
  );
}

export default function HospitalDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const selectNavigation = (label: string) => {
    setActiveItem(label);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="hidden fixed inset-y-0 left-0 z-30 lg:block">
        <HospitalSidebar activeItem={activeItem} onSelect={selectNavigation} />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative h-full w-[272px]">
            <HospitalSidebar activeItem={activeItem} onSelect={selectNavigation} mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-7">
          <button type="button" className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="hidden max-w-md flex-1 sm:block">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white" placeholder="Search patients, appointments..." />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Notifications">
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />
            <button type="button" className="flex items-center gap-2 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-[#0057d9]">CH</div>
              <div className="hidden sm:block">
                <p className="text-xs font-extrabold text-slate-800">City Hospital</p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400">Hospital Admin</p>
              </div>
              <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] p-4 md:p-7">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold text-[#0057d9]">Tuesday, June 16</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-[28px]">Good morning, City Hospital</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">Here&apos;s what&apos;s happening across your hospital today.</p>
            </div>
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
              <CalendarDays size={16} />
              View calendar
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Today&apos;s appointments" value="42" helper="8.2% from last week" icon={CalendarDays} tone="bg-blue-50 text-[#0057d9]" />
            <StatCard label="Patients checked in" value="18" helper="6 more than yesterday" icon={Users} tone="bg-emerald-50 text-emerald-600" />
            <StatCard label="Available beds" value="24" helper="Across 6 departments" icon={BedDouble} tone="bg-violet-50 text-violet-600" />
            <StatCard label="Active doctors" value="31" helper="All departments covered" icon={Stethoscope} tone="bg-amber-50 text-amber-600" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Today&apos;s appointments</h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">Tuesday, June 16 • 42 scheduled</p>
                </div>
                <button type="button" className="text-xs font-extrabold text-[#0057d9] hover:text-blue-700">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[680px] w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      <th className="px-6 py-3 font-inherit">Patient</th>
                      <th className="px-4 py-3 font-inherit">Doctor</th>
                      <th className="px-4 py-3 font-inherit">Time</th>
                      <th className="px-4 py-3 font-inherit">Status</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {appointments.map((appointment) => (
                      <tr key={appointment.patient} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[11px] font-extrabold text-[#0057d9]">{appointment.initials}</div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-800">{appointment.patient}</p>
                              <p className="text-[11px] font-medium text-slate-400">{appointment.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[12px] font-semibold text-slate-600">{appointment.doctor}</td>
                        <td className="px-4 py-3.5 text-[12px] font-bold text-slate-700">{appointment.time}</td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${appointment.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" : appointment.status === "Checked in" ? "bg-blue-50 text-[#0057d9]" : "bg-amber-50 text-amber-600"}`}>{appointment.status}</span>
                        </td>
                        <td className="px-5 py-3.5"><button type="button" className="rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600" aria-label={`More options for ${appointment.patient}`}><MoreHorizontal size={17} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Department capacity</h2>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">Current bed occupancy</p>
                  </div>
                  <Activity size={19} className="text-[#0057d9]" />
                </div>
                <div className="mt-5 space-y-4">
                  {[{ name: "Emergency", value: 82, color: "bg-rose-500" }, { name: "Cardiology", value: 65, color: "bg-[#0057d9]" }, { name: "General ward", value: 48, color: "bg-emerald-500" }].map((department) => (
                    <div key={department.name}>
                      <div className="mb-1.5 flex items-center justify-between text-xs font-bold"><span className="text-slate-600">{department.name}</span><span className="text-slate-400">{department.value}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${department.color}`} style={{ width: `${department.value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><h2 className="text-base font-extrabold text-slate-900">Recent activity</h2><button type="button" className="text-xs font-extrabold text-[#0057d9]">See all</button></div>
                <div className="mt-4 space-y-4">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return <div key={activity.title} className="flex gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.tone}`}><Icon size={15} /></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-700">{activity.title}</p><p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">{activity.detail}</p></div><span className="whitespace-nowrap text-[10px] font-medium text-slate-400">{activity.time}</span></div>;
                  })}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
