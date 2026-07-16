"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, Stethoscope, UserRound, Users, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { createHospitalPatient, getHospitalPatients, getHospitalSettings } from "@/lib/api/hospital";
import { HospitalNotifications } from "../components/HospitalNotifications";

type Patient = { id: string; name: string; email: string; phone: string; age: number | null; gender: string | null; department: string | null; doctor: string | null; appointment: string | null; status: string };

const navigation = [
  { label: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/hospital/patients", icon: Users },
  { label: "Appointments", href: "/hospital/appointments", icon: CalendarDays },
];

const mapPatient = (patient: any): Patient => ({
  id: patient._id,
  name: patient.fullName,
  email: patient.email || "",
  phone: patient.phoneNumber || "",
  age: patient.age ?? null,
  gender: patient.gender ?? null,
  department: patient.department || patient.latestAppointment?.doctor?.specialization || null,
  doctor: patient.latestAppointment?.doctor?.fullName || null,
  appointment: patient.latestAppointment ? `${new Date(patient.latestAppointment.date).toLocaleDateString()} · ${patient.latestAppointment.time}` : null,
  status: patient.latestAppointment?.status || "No appointment",
});

const initials = (name: string) => name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();

export default function HospitalPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitalName, setHospitalName] = useState("");
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getHospitalPatients().then((data) => setPatients(data.patients.map(mapPatient))).catch((error) => setNotice(error.response?.data?.message || "Unable to load patients."));
    getHospitalSettings().then((data) => setHospitalName(data.settings.hospitalName)).catch(() => undefined);
  }, []);

  const visiblePatients = useMemo(() => {
    const query = search.toLowerCase().trim();
    return !query ? patients : patients.filter((patient) => [patient.name, patient.email, patient.phone, patient.department || "", patient.doctor || ""].some((value) => value.toLowerCase().includes(query)));
  }, [patients, search]);

  const addPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await createHospitalPatient({ fullName: form.get("fullName"), email: form.get("email"), phoneNumber: form.get("phoneNumber"), age: Number(form.get("age")) || undefined, gender: form.get("gender") || undefined, department: form.get("department") || undefined });
      setPatients((current) => [mapPatient(result.patient), ...current]);
      setAddOpen(false);
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Unable to add patient.");
    }
  };

  const logout = () => { localStorage.removeItem("hospitalToken"); router.push("/login"); };
  const activeCare = patients.filter((patient) => patient.status !== "No appointment").length;
  const departments = new Set(patients.map((patient) => patient.department).filter(Boolean)).size;

  const sidebar = (mobile = false) => <aside className={`flex h-full w-[272px] flex-col border-r border-slate-100 bg-white px-4 py-5 ${mobile ? "shadow-2xl" : ""}`}>
    <div className="flex items-center justify-between px-2"><BrandLogo size={35} showText subtitle="Hospital Portal" textClassName="text-[18px] font-black tracking-tight text-[#0057d9] leading-none" subtitleClassName="mt-1 text-[10px] font-bold tracking-wide text-slate-400" />{mobile && <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close menu"><X size={18} /></button>}</div>
    <nav className="mt-9 space-y-1"><p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">Workspace</p>{navigation.map(({ label, href, icon: Icon }) => <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${label === "Patients" ? "bg-[#0057d9] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={18} />{label}</Link>)}</nav>
    <div className="mt-auto border-t border-slate-100 pt-5"><Link href="/hospital/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-500 hover:bg-slate-50"><Settings size={18} />Settings</Link><button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"><LogOut size={18} />Log out</button></div>
  </aside>;

  return <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
    <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar()}</div>
    {isMobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><button onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/35" aria-label="Close menu" /><div className="relative h-full w-[272px]">{sidebar(true)}</div></div>}
    <div className="lg:pl-[272px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-7"><button onClick={() => setMobileMenuOpen(true)} className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden" aria-label="Open menu"><Menu size={21} /></button><div className="hidden max-w-md flex-1 sm:block"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none transition focus:border-blue-400 focus:bg-white" /></div></div><div className="ml-auto flex items-center gap-2.5"><HospitalNotifications /><div className="hidden h-7 w-px bg-slate-200 sm:block" /><Link href="/hospital/profile" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-[#0057d9]">{initials(hospitalName || "Hospital")}</div><div className="hidden sm:block"><p className="text-xs font-extrabold">{hospitalName || "Loading…"}</p><p className="mt-0.5 text-[10px] font-medium text-slate-400">Hospital Admin</p></div><ChevronDown size={15} className="hidden text-slate-400 sm:block" /></Link></div></header>
      <main className="mx-auto max-w-[1440px] p-4 md:p-7"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-[#0057d9]">Hospital workspace</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">Patients</h1><p className="mt-1 text-sm font-medium text-slate-500">Manage patient records and their care journey at {hospitalName || "your hospital"}.</p></div><button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,87,217,0.2)] transition hover:bg-blue-700"><Plus size={16} />Add patient</button></div>
        {notice && <div role="alert" className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{notice}</div>}
        <div className="grid gap-4 sm:grid-cols-3"><StatCard icon={Users} label="Total patients" value={patients.length} tone="bg-blue-50 text-[#0057d9]" /><StatCard icon={UserRound} label="Active care plans" value={activeCare} tone="bg-emerald-50 text-emerald-600" /><StatCard icon={Stethoscope} label="Care departments" value={departments} tone="bg-violet-50 text-violet-600" /></div>
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-base font-extrabold">Patient directory</h2><p className="mt-0.5 text-xs font-medium text-slate-400">{visiblePatients.length} patient{visiblePatients.length === 1 ? "" : "s"} shown</p></div><div className="relative sm:hidden"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="w-44 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 text-xs outline-none" /></div></div><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-extrabold uppercase tracking-[.1em] text-slate-400"><th className="px-6 py-3">Patient</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Care team</th><th className="px-4 py-3">Next appointment</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-50">{visiblePatients.map((patient) => <tr key={patient.id} className="transition-colors hover:bg-slate-50/70"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[11px] font-extrabold text-[#0057d9]">{initials(patient.name)}</div><div><p className="text-[13px] font-bold text-slate-800">{patient.name}</p><p className="text-[11px] font-medium text-slate-400">{patient.age === null ? "Age not provided" : `${patient.age} years`}{patient.gender ? ` · ${patient.gender}` : ""}</p></div></div></td><td className="px-4 py-3.5"><p className="text-[12px] font-semibold text-slate-700">{patient.email || "Not provided"}</p><p className="mt-0.5 text-[11px] text-slate-400">{patient.phone || "No phone number"}</p></td><td className="px-4 py-3.5"><p className="text-[12px] font-bold text-slate-700">{patient.department || "Not assigned"}</p><p className="mt-0.5 text-[11px] text-slate-400">{patient.doctor || "No doctor assigned"}</p></td><td className="px-4 py-3.5 text-[12px] font-semibold text-slate-600">{patient.appointment || "Not scheduled"}</td><td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${patient.status === "No appointment" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-[#0057d9]"}`}>{patient.status}</span></td></tr>)}</tbody></table>{visiblePatients.length === 0 && <p className="px-6 py-12 text-center text-sm font-semibold text-slate-400">No patients match your search.</p>}</div></section>
      </main>
    </div>
    {isAddOpen && <AddPatientModal onClose={() => setAddOpen(false)} onSubmit={addPatient} />}
  </div>;
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: string }) { return <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon size={21} /></div><p className="mt-5 text-[11px] font-extrabold uppercase tracking-[.1em] text-slate-400">{label}</p><p className="mt-0.5 text-3xl font-extrabold">{value}</p></section>; }

function AddPatientModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button onClick={onClose} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" aria-label="Close form" /><form onSubmit={onSubmit} className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h2 className="text-base font-bold text-slate-900">Add new patient</h2><p className="mt-0.5 text-[11px] font-medium text-slate-400">Create a patient record for your hospital.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button></div><div className="grid gap-4 px-6 py-5 sm:grid-cols-2"><Field label="Full name *"><input required name="fullName" placeholder="Patient name" /></Field><Field label="Email address *"><input required name="email" type="email" placeholder="patient@example.com" /></Field><Field label="Phone number *"><input required name="phoneNumber" placeholder="98XXXXXXXX" /></Field><Field label="Age"><input name="age" type="number" min="0" placeholder="Age" /></Field><Field label="Gender"><input name="gender" placeholder="Female, male, other" /></Field><Field label="Department"><input name="department" placeholder="e.g. Cardiology" /></Field></div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button className="rounded-xl bg-[#0057d9] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Add patient</button></div></form></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-slate-600 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-200 [&>input]:bg-slate-50 [&>input]:px-3 [&>input]:py-2.5 [&>input]:text-sm [&>input]:font-medium [&>input]:outline-none [&>input]:transition [&>input]:focus:border-blue-400 [&>input]:focus:bg-white"><span className="mb-1.5 block">{label}</span>{children}</label>; }
