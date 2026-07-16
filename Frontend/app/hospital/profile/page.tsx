"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Building2, CalendarDays, ChevronRight, Mail, MapPin, Pencil, Phone, Save, Settings, ShieldCheck } from "lucide-react";
import { HospitalNotifications } from "../components/HospitalNotifications";
import { getHospitalSettings, updateHospitalSettings } from "@/lib/api/hospital";

type HospitalProfile = { hospitalName: string; email: string; phone: string; address: string };
const initialProfile: HospitalProfile = { hospitalName: "", email: "", phone: "", address: "" };

export default function HospitalProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getHospitalSettings()
      .then((data) => setProfile((current) => ({ ...current, ...data.settings })))
      .catch((error) => setMessage(error.response?.data?.message || "Unable to load hospital details."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof HospitalProfile>(key: K, value: HospitalProfile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await updateHospitalSettings(profile);
      setProfile((current) => ({ ...current, ...result.settings }));
      setEditing(false);
      setMessage("Hospital details saved.");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Unable to save hospital details.");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.hospitalName.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  const fields = [
    { icon: Mail, label: "Email", key: "email" as const, type: "email" },
    { icon: Phone, label: "Phone", key: "phone" as const, type: "tel" },
    { icon: MapPin, label: "Address", key: "address" as const, type: "text" },
  ];

  return <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
    <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-7">
      <Link href="/hospital/dashboard" className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"><ArrowLeft size={18} /> <span className="hidden sm:inline">Back to dashboard</span></Link>
      <div className="ml-auto flex items-center gap-3"><HospitalNotifications /><div className="hidden h-7 w-px bg-slate-200 sm:block" /><Link href="/hospital/settings" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Settings size={15} /> <span className="hidden sm:inline">Settings</span></Link></div>
    </header>
    <main className="mx-auto max-w-4xl p-4 md:p-7">
      <div className="mb-7"><p className="text-xs font-bold text-[#0057d9]">Hospital workspace</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">Hospital profile</h1><p className="mt-1 text-sm font-medium text-slate-500">Your hospital&apos;s account details and portal access.</p></div>
      {message && <p role="status" className="mb-5 rounded-xl bg-slate-100 p-3 text-sm font-semibold">{message}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0057d9] to-blue-500 px-5 py-8 md:px-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-lg font-extrabold text-white ring-1 ring-white/30">{initials || "CH"}</div><div>{editing ? <input required value={profile.hospitalName} onChange={(event) => set("hospitalName", event.target.value)} className="w-full rounded-lg border border-white/40 bg-white/15 px-2 py-1 text-xl font-extrabold text-white outline-none placeholder:text-blue-100" aria-label="Hospital name" /> : <p className="text-xl font-extrabold text-white">{loading ? "Loading…" : profile.hospitalName}</p>}<p className="mt-1 text-sm font-medium text-blue-100">Hospital administrator account</p></div></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20"><ShieldCheck size={14} /> Verified portal access</span></div></div>
        <form onSubmit={save} className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-7"><div><div className="flex items-center justify-between"><h2 className="text-base font-extrabold">Contact information</h2>{!editing && <button type="button" onClick={() => setEditing(true)} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-[#0057d9] hover:bg-blue-50 disabled:opacity-50"><Pencil size={15} />Edit details</button>}</div><div className="mt-4 space-y-3">{fields.map(({ icon: Icon, label, key, type }) => <div key={key} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><Icon size={16} /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>{editing ? <input required={key !== "address"} type={type} value={profile[key]} onChange={(event) => set(key, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm font-bold text-slate-700" /> : <p className="mt-0.5 break-words text-sm font-bold text-slate-700">{loading ? "Loading…" : profile[key] || "Not provided"}</p>}</div></div>)}</div>{editing && <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setEditing(false)} disabled={saving} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Save size={16} />{saving ? "Saving…" : "Save details"}</button></div>}</div><div className="border-t border-slate-100 pt-5 md:w-56 md:border-l md:border-t-0 md:pl-6 md:pt-0"><h2 className="text-base font-extrabold">Workspace</h2><Link href="/hospital/appointments" className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"><span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-[#0057d9]" />Appointments</span><ChevronRight size={16} className="text-slate-400" /></Link><Link href="/hospital/settings" className="mt-2 flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"><span className="inline-flex items-center gap-2"><Building2 size={16} className="text-[#0057d9]" />Settings</span><ChevronRight size={16} className="text-slate-400" /></Link></div></form>
      </section>
    </main>
  </div>;
}
