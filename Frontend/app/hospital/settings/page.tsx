"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Building2, CalendarDays, LayoutDashboard, LogOut, Save, Settings, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { getHospitalSettings, updateHospitalSettings } from "@/lib/api/hospital";
type State = { hospitalName: string; email: string; phone: string; address: string; appointmentAlerts: boolean; checkInAlerts: boolean; recordAlerts: boolean };
const empty: State = { hospitalName: "", email: "", phone: "", address: "", appointmentAlerts: true, checkInAlerts: true, recordAlerts: true };
const links = [{ label: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard }, { label: "Patients", href: "/hospital/patients", icon: Users }, { label: "Appointments", href: "/hospital/appointments", icon: CalendarDays }];
export default function HospitalSettingsPage() {
  const router = useRouter(); const [settings, setSettings] = useState(empty); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    getHospitalSettings()
      .then((data) => setSettings({ ...empty, ...data.settings }))
      .catch((e) => {
        if (e.response?.status === 401) {
          localStorage.removeItem("hospitalToken");
          router.replace("/login");
          return;
        }
        setMessage(e.response?.data?.message || "Unable to load settings. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, [router]);
  const set = <K extends keyof State>(key: K, value: State[K]) => setSettings((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent) => { event.preventDefault(); if (loading || saving) return; setMessage(null); setSaving(true); try { const result = await updateHospitalSettings(settings); setSettings({ ...empty, ...result.settings }); setMessage("Settings saved."); } catch (e: any) { if (e.response?.status === 401) { localStorage.removeItem("hospitalToken"); router.replace("/login"); return; } setMessage(e.response?.data?.message || "Unable to save settings."); } finally { setSaving(false); } };
  const logout = () => { localStorage.removeItem("hospitalToken"); router.push("/login"); };
  const disabled = saving;
  return <div className="min-h-screen bg-[#f6f8fc] text-slate-900"><aside className="fixed inset-y-0 left-0 hidden w-[272px] border-r bg-white px-4 py-5 lg:block"><BrandLogo size={35} showText subtitle="Hospital Portal" textClassName="text-[18px] font-black text-[#0057d9]" subtitleClassName="text-[10px] font-bold text-slate-400" /><nav className="mt-9 space-y-1">{links.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50"><Icon size={18} />{label}</Link>)}</nav><div className="mt-auto"><Link href="/hospital/settings" className="mt-8 flex items-center gap-3 rounded-xl bg-[#0057d9] px-3 py-2.5 text-sm font-bold text-white"><Settings size={18} />Settings</Link><button onClick={logout} className="mt-2 flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-500"><LogOut size={18} />Log out</button></div></aside><main className="mx-auto max-w-5xl p-4 lg:ml-[272px] md:p-7"><header className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold text-[#0057d9]">Hospital workspace</p><h1 className="mt-1 text-2xl font-extrabold">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage the profile and notification preferences for {settings.hospitalName || "your hospital"}.</p></div><Link href="/hospital/profile" className="rounded-xl border bg-white px-3 py-2 text-sm font-bold">Profile</Link></header>{message && <p role="status" className="mb-5 rounded-xl bg-slate-100 p-3 text-sm font-semibold">{message}</p>}<form onSubmit={save} className="space-y-6"><section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Building2 className="text-[#0057d9]" /><div><h2 className="font-extrabold">Hospital profile</h2><p className="text-xs text-slate-400">These values come from and are saved to your hospital account.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{([['hospitalName', 'Hospital name', 'text'], ['email', 'Admin email', 'email'], ['phone', 'Phone number', 'text'], ['address', 'Address', 'text']] as const).map(([key, label, type]) => <label key={key} className={`text-xs font-bold ${key === 'hospitalName' || key === 'address' ? 'sm:col-span-2' : ''}`}>{label}<input required={key === 'hospitalName' || key === 'email'} type={type} value={settings[key]} disabled={disabled} onChange={(e) => set(key, e.target.value)} className="mt-1.5 w-full rounded-xl border p-2.5 text-sm font-medium disabled:bg-slate-50" /></label>)}</div></section><section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Bell className="text-[#0057d9]" /><div><h2 className="font-extrabold">Notification preferences</h2><p className="text-xs text-slate-400">Choose which real-time portal alerts you receive.</p></div></div><div className="mt-5 divide-y">{([['appointmentAlerts', 'Appointment updates'], ['checkInAlerts', 'Patient check-ins'], ['recordAlerts', 'Medical record activity']] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between py-4 text-sm font-bold"><span>{label}</span><input type="checkbox" checked={settings[key]} disabled={disabled} onChange={(e) => set(key, e.target.checked)} className="h-5 w-5" /></label>)}</div></section><div className="flex justify-end"><button disabled={disabled} className="inline-flex items-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save size={16} />{saving ? "Saving…" : "Save changes"}</button></div></form></main></div>;
}
