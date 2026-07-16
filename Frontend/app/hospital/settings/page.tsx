// @ts-nocheck
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Building2, CalendarDays, ChevronRight, CircleCheck, ClipboardCheck, FileText, LayoutDashboard, LogOut, Mail, MapPin, Menu, Phone, Save, Settings, SlidersHorizontal, Users, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { getHospitalSettings, updateHospitalSettings } from "@/lib/api/hospital";

type State = { hospitalName: string; email: string; phone: string; address: string; appointmentAlerts: boolean; checkInAlerts: boolean; recordAlerts: boolean };
const empty: State = { hospitalName: "", email: "", phone: "", address: "", appointmentAlerts: true, checkInAlerts: true, recordAlerts: true };
const links = [{ label: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard }, { label: "Patients", href: "/hospital/patients", icon: Users }, { label: "Appointments", href: "/hospital/appointments", icon: CalendarDays }];

export default function HospitalSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getHospitalSettings().then((data) => setSettings({ ...empty, ...data.settings })).catch((error) => {
      if (error.response?.status === 401) { localStorage.removeItem("hospitalToken"); router.replace("/admin/login"); return; }
      setMessage(error.response?.data?.message || "Unable to load settings. Please refresh and try again.");
    }).finally(() => setLoading(false));
  }, [router]);

  const set = <K extends keyof State>(key: K, value: State[K]) => setSettings((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (loading || saving) return;
    setMessage(null); setSaving(true);
    try { const result = await updateHospitalSettings(settings); setSettings({ ...empty, ...result.settings }); setMessage("Settings saved successfully."); }
    catch (error: any) { if (error.response?.status === 401) { localStorage.removeItem("hospitalToken"); router.replace("/admin/login"); return; } setMessage(error.response?.data?.message || "Unable to save settings."); }
    finally { setSaving(false); }
  };
  const logout = () => { localStorage.removeItem("hospitalToken"); router.push("/admin/login"); };
  const initials = settings.hospitalName.split(/\s+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "HP";
  const disabled = loading || saving;

  const sidebar = (mobile = false) => <aside className={`flex h-full w-[272px] flex-col border-r border-slate-100 bg-white px-4 py-5 ${mobile ? "shadow-2xl" : ""}`}>
    <div className="flex items-center justify-between px-2"><BrandLogo size={35} showText subtitle="Hospital Portal" textClassName="text-[18px] font-black tracking-tight text-[#0057d9] leading-none" subtitleClassName="mt-1 text-[10px] font-bold tracking-wide text-slate-400" />{mobile && <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close menu"><X size={18} /></button>}</div>
    <nav className="mt-9 space-y-1"><p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">Workspace</p>{links.map(({ label, href, icon: Icon }) => <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-500 transition hover:bg-slate-50"><Icon size={18} />{label}</Link>)}</nav>
    <div className="mt-auto border-t border-slate-100 pt-5"><Link href="/hospital/settings" className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-[13px] font-bold text-[#0057d9]"><Settings size={18} />Settings</Link><button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><LogOut size={18} />Log out</button></div>
  </aside>;

  const notifications = [
    { key: "appointmentAlerts" as const, icon: BellRing, title: "Appointment updates", description: "New bookings, reschedules, and cancellations.", tone: "bg-blue-50 text-[#0057d9]" },
    { key: "checkInAlerts" as const, icon: ClipboardCheck, title: "Patient check-ins", description: "Alerts when a patient has arrived for care.", tone: "bg-emerald-50 text-emerald-600" },
    { key: "recordAlerts" as const, icon: FileText, title: "Medical record activity", description: "Updates to records associated with your hospital.", tone: "bg-violet-50 text-violet-600" },
  ];

  return <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
    <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar()}</div>
    {mobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><button onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/35" aria-label="Close navigation" /><div className="relative h-full w-[272px]">{sidebar(true)}</div></div>}
    <div className="lg:pl-[272px]"><header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-7"><button onClick={() => setMobileMenuOpen(true)} className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden" aria-label="Open menu"><Menu size={21} /></button><div><p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#0057d9]">Hospital workspace</p><p className="mt-0.5 text-sm font-bold text-slate-700">Settings & preferences</p></div><Link href="/hospital/profile" className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-[9px] font-extrabold text-[#0057d9]">{initials}</span><span className="hidden sm:inline">View profile</span><ChevronRight size={14} /></Link></header>
      <main className="mx-auto max-w-5xl p-4 md:p-7"><div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-[#0057d9]"><SlidersHorizontal size={13} /> Workspace settings</div><h1 className="mt-3 text-2xl font-extrabold tracking-tight md:text-[28px]">Make the portal yours</h1><p className="mt-1 text-sm font-medium text-slate-500">Manage your hospital&apos;s public details and operational alerts.</p></div><div className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex"><CircleCheck size={16} /> Changes save securely</div></div>
        {message && <div role="status" className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${message.includes("success") ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}><CircleCheck size={17} />{message}</div>}
        <form onSubmit={save} className="space-y-6"><section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/90 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0057d9] text-white shadow-sm"><Building2 size={20} /></span><div><h2 className="font-extrabold">Hospital profile</h2><p className="mt-0.5 text-xs font-medium text-slate-500">The details displayed across your workspace.</p></div></div><span className="w-fit rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">{loading ? "Loading…" : "Account details"}</span></div><div className="grid gap-5 p-5 md:grid-cols-2 md:p-7">{([{ key: "hospitalName", label: "Hospital name", icon: Building2, type: "text", full: true }, { key: "email", label: "Admin email", icon: Mail, type: "email" }, { key: "phone", label: "Phone number", icon: Phone, type: "tel" }, { key: "address", label: "Address", icon: MapPin, type: "text", full: true }] as const).map(({ key, label, icon: Icon, type, full }) => <label key={key} className={`block ${full ? "md:col-span-2" : ""}`}><span className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-slate-600"><Icon size={14} className="text-slate-400" />{label}</span><input required={key === "hospitalName" || key === "email"} type={type} value={settings[key]} disabled={disabled} onChange={(event) => set(key, event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50" placeholder={key === "address" ? "Add your hospital address" : ""} /></label>)}</div></section>
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 md:px-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Bell size={20} /></span><div><h2 className="font-extrabold">Notification preferences</h2><p className="mt-0.5 text-xs font-medium text-slate-500">Choose the operational alerts your team receives.</p></div></div><div className="divide-y divide-slate-100">{notifications.map(({ key, icon: Icon, title, description, tone }) => <label key={key} className="flex cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-slate-50/70 md:px-7"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-slate-800">{title}</span><span className="mt-0.5 block text-xs font-medium text-slate-500">{description}</span></span><span className="relative inline-flex shrink-0"><input type="checkbox" className="peer sr-only" checked={settings[key]} disabled={disabled} onChange={(event) => set(key, event.target.checked)} /><span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-[#0057d9] peer-disabled:opacity-50" /><span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" /></span></label>)}</div></section>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-medium text-slate-400">Your changes apply to the hospital portal immediately.</p><button disabled={disabled} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057d9] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Save size={17} />{saving ? "Saving changes…" : "Save changes"}</button></div>
        </form>
      </main>
    </div>
  </div>;
}
