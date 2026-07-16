"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { createHospitalPatient, getHospitalPatients } from "@/lib/api/hospital";
import { HospitalNotifications } from "../components/HospitalNotifications";

type PatientStatus = "Active" | "In consultation" | "Follow-up";

type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  department: string;
  doctor: string;
  appointment: string;
  status: PatientStatus;
  lastVisit: string;
  notes: string;
};

const initialPatients: Patient[] = [
  { id: "PT-10042", name: "Aarav Sharma", initials: "AS", age: 42, gender: "Male", phone: "+977 980-111-8246", email: "aarav.sharma@email.com", department: "Cardiology", doctor: "Dr. Meera Shah", appointment: "Today, 09:30 AM", status: "In consultation", lastVisit: "12 Jun 2026", notes: "Follow-up cardiac consultation. Lab results attached to record." },
  { id: "PT-10043", name: "Sofia Rai", initials: "SR", age: 29, gender: "Female", phone: "+977 981-224-6531", email: "sofia.rai@email.com", department: "General Care", doctor: "Dr. Rohan Gupta", appointment: "Today, 10:15 AM", status: "Active", lastVisit: "08 Jun 2026", notes: "Routine review requested after recent diagnostic tests." },
  { id: "PT-10044", name: "Ritesh Thapa", initials: "RT", age: 56, gender: "Male", phone: "+977 984-887-2930", email: "ritesh.thapa@email.com", department: "Neurology", doctor: "Dr. Anika Patel", appointment: "Today, 11:00 AM", status: "Follow-up", lastVisit: "01 Jun 2026", notes: "Neurology follow-up. Current medication schedule reviewed." },
  { id: "PT-10045", name: "Maya Joshi", initials: "MJ", age: 34, gender: "Female", phone: "+977 986-930-4472", email: "maya.joshi@email.com", department: "Cardiology", doctor: "Dr. Meera Shah", appointment: "Today, 11:45 AM", status: "Active", lastVisit: "16 Jun 2026", notes: "Patient checked in for a scheduled cardiology appointment." },
  { id: "PT-10046", name: "Nabin Karki", initials: "NK", age: 47, gender: "Male", phone: "+977 980-746-2291", email: "nabin.karki@email.com", department: "Orthopedics", doctor: "Dr. Sagar Rana", appointment: "17 Jun, 02:30 PM", status: "Follow-up", lastVisit: "14 Jun 2026", notes: "Post-treatment follow-up appointment scheduled for tomorrow." },
  { id: "PT-10047", name: "Elina Shrestha", initials: "ES", age: 25, gender: "Female", phone: "+977 982-618-7045", email: "elina.shrestha@email.com", department: "Dermatology", doctor: "Dr. Alisha KC", appointment: "18 Jun, 10:00 AM", status: "Active", lastVisit: "10 Jun 2026", notes: "Consultation scheduled for dermatology assessment." },
];

const navigation = [
  { label: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/hospital/patients", icon: Users },
  { label: "Appointments", href: "/hospital/appointments", icon: CalendarDays },
];

function StatusBadge({ status }: { status: PatientStatus }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-600",
    "In consultation": "bg-blue-50 text-[#0057d9]",
    "Follow-up": "bg-amber-50 text-amber-600",
  };

  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${styles[status]}`}>{status}</span>;
}

function HospitalPatientsSidebar({ mobile, onClose, onLogout }: { mobile?: boolean; onClose?: () => void; onLogout: () => void }) {
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
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.label === "Patients";
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${active ? "bg-[#0057d9] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon size={18} strokeWidth={2.2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-5">
        <Link href="/hospital/settings" onClick={() => onClose?.()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
          <Settings size={18} strokeWidth={2.2} />
          Settings
        </Link>
        <button type="button" onClick={onLogout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
          <LogOut size={18} strokeWidth={2.2} />
          Log out
        </button>
      </div>
    </aside>
  );
}

function PatientDetailsPanel({ patient, onClose, onNotice }: { patient: Patient; onClose: () => void; onNotice: (message: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" aria-label="Close patient details" />
      <aside className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0057d9]">Patient details</p>
            <h2 className="mt-1 text-lg font-extrabold text-slate-900">{patient.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Close patient details">
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section className="flex items-center gap-4 rounded-2xl bg-blue-50/70 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sm font-extrabold text-[#0057d9] shadow-sm">{patient.initials}</div>
            <div>
              <p className="text-base font-extrabold text-slate-800">{patient.name}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{patient.id} • {patient.age} years • {patient.gender}</p>
              <div className="mt-2"><StatusBadge status={patient.status} /></div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">Contact information</h3>
            <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100 px-4">
              <div className="flex items-center justify-between py-3 text-sm"><span className="font-medium text-slate-500">Phone</span><span className="font-bold text-slate-700">{patient.phone}</span></div>
              <div className="flex items-center justify-between gap-4 py-3 text-sm"><span className="font-medium text-slate-500">Email</span><span className="truncate font-bold text-slate-700">{patient.email}</span></div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">Care overview</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Department</p><p className="mt-1 text-sm font-extrabold text-slate-700">{patient.department}</p></div>
              <div className="rounded-xl border border-slate-100 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Assigned doctor</p><p className="mt-1 text-sm font-extrabold text-slate-700">{patient.doctor}</p></div>
              <div className="rounded-xl border border-slate-100 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Next visit</p><p className="mt-1 text-sm font-extrabold text-slate-700">{patient.appointment}</p></div>
              <div className="rounded-xl border border-slate-100 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Last visit</p><p className="mt-1 text-sm font-extrabold text-slate-700">{patient.lastVisit}</p></div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">Latest note</h3>
            <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm font-medium leading-6 text-slate-600">{patient.notes}</p>
          </section>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => onNotice(`Medical records for ${patient.name} are ready to review.`)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><FileText size={16} /> View records</button>
            <button type="button" onClick={() => onNotice(`Appointment workflow opened for ${patient.name}.`)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"><CalendarDays size={16} /> Appointment</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function HospitalPatientsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PatientStatus>("All");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientList, setPatientList] = useState(initialPatients);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHospitalPatients()
      .then((data) => setPatientList(data.patients.map((patient: any) => ({ id: patient._id, name: patient.fullName, initials: patient.fullName.split(/\s+/).map((word: string) => word[0]).join("").slice(0, 2).toUpperCase(), age: patient.age || 0, gender: patient.gender || "Not specified", phone: patient.phoneNumber || "Not provided", email: patient.email, department: patient.department || patient.latestAppointment?.doctor?.specialization || "General Care", doctor: patient.latestAppointment?.doctor?.fullName || "Unassigned", appointment: patient.latestAppointment ? `${new Date(patient.latestAppointment.date).toLocaleDateString()} · ${patient.latestAppointment.time}` : "Not scheduled", status: patient.latestAppointment?.status === "PENDING" ? "Follow-up" : patient.latestAppointment?.status === "CONFIRMED" ? "In consultation" : "Active", lastVisit: patient.latestAppointment ? new Date(patient.latestAppointment.date).toLocaleDateString() : "New patient", notes: patient.notes || "No clinical notes available." })))
      )
      .catch((error) => setNotice(error.response?.data?.message || "Unable to load patients."))
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return patientList.filter((patient) => {
      const matchesSearch = !normalizedSearch || [patient.name, patient.id, patient.phone, patient.email, patient.department].some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesSearch && (statusFilter === "All" || patient.status === statusFilter);
    });
  }, [patientList, search, statusFilter]);

  const addPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    if (!name || !email || !phone) return;
    const initials = name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
    try {
      const result = await createHospitalPatient({ fullName: name, email, phoneNumber: phone, age: Number(data.get("age")) || undefined, gender: data.get("gender"), department: data.get("department"), notes: "Patient profile created from the hospital portal." });
      const patient = result.patient;
      setPatientList((current) => [{ id: patient._id, name: patient.fullName, initials, age: patient.age || 0, gender: patient.gender || "Not specified", phone: patient.phoneNumber, email: patient.email, department: patient.department || "General Care", doctor: "Unassigned", appointment: "Not scheduled", status: "Active", lastVisit: "New patient", notes: patient.notes || "" }, ...current]);
      setAddPatientOpen(false);
      setNotice(`${name} was added to the patient directory.`);
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Unable to add patient.");
    }
  };

  const logOut = () => {
    localStorage.removeItem("hospitalToken");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block"><HospitalPatientsSidebar onLogout={logOut} /></div>
      {mobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" aria-label="Close menu" /><div className="relative h-full w-[272px]"><HospitalPatientsSidebar mobile onClose={() => setMobileMenuOpen(false)} onLogout={logOut} /></div></div>}

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-7">
          <button type="button" onClick={() => setMobileMenuOpen(true)} className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
          <div className="hidden max-w-md flex-1 sm:block"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white" placeholder="Search patients, appointments..." /></div></div>
          <div className="ml-auto flex items-center gap-2.5"><HospitalNotifications /><div className="hidden h-7 w-px bg-slate-200 sm:block" /><Link href="/hospital/profile" className="flex items-center gap-2 text-left"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-[#0057d9]">CH</div><div className="hidden sm:block"><p className="text-xs font-extrabold text-slate-800">City Hospital</p><p className="mt-0.5 text-[10px] font-medium text-slate-400">Hospital Admin</p></div><ChevronDown size={15} className="hidden text-slate-400 sm:block" /></Link></div>
        </header>

        <main className="mx-auto max-w-[1440px] p-4 md:p-7">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold text-[#0057d9]">Hospital workspace</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-[28px]">Patients</h1><p className="mt-1 text-sm font-medium text-slate-500">Review and manage your hospital&apos;s patient information.</p></div>
            <button type="button" onClick={() => setAddPatientOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"><UserPlus size={16} /> Add patient</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[{ label: "Total patients", value: "1,284", icon: Users, tone: "bg-blue-50 text-[#0057d9]" }, { label: "New this month", value: "78", icon: UserPlus, tone: "bg-emerald-50 text-emerald-600" }, { label: "Scheduled today", value: "18", icon: CalendarDays, tone: "bg-violet-50 text-violet-600" }, { label: "Records to review", value: "6", icon: FileText, tone: "bg-amber-50 text-amber-600" }].map((stat) => { const Icon = stat.icon; return <section key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}><Icon size={19} /></div><p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">{stat.label}</p><p className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</p></section>; })}
          </div>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div><h2 className="text-base font-extrabold text-slate-900">Patient directory</h2><p className="mt-0.5 text-xs font-medium text-slate-400">{filteredPatients.length} patient{filteredPatients.length === 1 ? "" : "s"} shown</p></div>
              <div className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-[220px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white" placeholder="Search patients" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | PatientStatus)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-600 outline-none focus:border-blue-400"><option value="All">All statuses</option><option value="Active">Active</option><option value="In consultation">In consultation</option><option value="Follow-up">Follow-up</option></select></div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[940px] w-full text-left"><thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400"><th className="px-6 py-3 font-inherit">Patient</th><th className="px-4 py-3 font-inherit">Department</th><th className="px-4 py-3 font-inherit">Next appointment</th><th className="px-4 py-3 font-inherit">Status</th><th className="px-4 py-3 font-inherit">Last visit</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-slate-50">{filteredPatients.map((patient) => <tr key={patient.id} className="transition hover:bg-slate-50/70"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[11px] font-extrabold text-[#0057d9]">{patient.initials}</div><div><p className="text-[13px] font-bold text-slate-800">{patient.name}</p><p className="text-[11px] font-medium text-slate-400">{patient.id} • {patient.age} yrs</p></div></div></td><td className="px-4 py-3.5"><p className="text-[12px] font-bold text-slate-700">{patient.department}</p><p className="mt-0.5 text-[11px] font-medium text-slate-400">{patient.doctor}</p></td><td className="px-4 py-3.5 text-[12px] font-bold text-slate-700">{patient.appointment}</td><td className="px-4 py-3.5"><StatusBadge status={patient.status} /></td><td className="px-4 py-3.5 text-[12px] font-semibold text-slate-500">{patient.lastVisit}</td><td className="px-5 py-3.5"><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => setSelectedPatient(patient)} className="rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-[#0057d9] hover:bg-blue-50">View details</button><button type="button" className="rounded-lg p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600" aria-label={`More options for ${patient.name}`}><MoreHorizontal size={17} /></button></div></td></tr>)}</tbody></table>
              {loading && <div className="py-16 text-center text-sm font-semibold text-slate-400">Loading patients…</div>}
              {!loading && filteredPatients.length === 0 && <div className="flex flex-col items-center justify-center py-16 text-center"><CircleUserRound size={30} className="text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No patients found</p><p className="mt-1 text-xs font-medium text-slate-400">Try changing your search or status filter.</p></div>}
            </div>
          </section>
        </main>
      </div>
      {selectedPatient && <PatientDetailsPanel patient={selectedPatient} onClose={() => setSelectedPatient(null)} onNotice={setNotice} />}
      {addPatientOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" onClick={() => setAddPatientOpen(false)} className="absolute inset-0 bg-slate-950/35" aria-label="Close add patient" /><form onSubmit={addPatient} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0057d9]">Patient directory</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">Add patient</h2></div><button type="button" onClick={() => setAddPatientOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50" aria-label="Close"><X size={18} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><input required name="name" placeholder="Full name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 sm:col-span-2" /><input required type="email" name="email" placeholder="Email address" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /><input required name="phone" placeholder="Phone number" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /><input name="age" type="number" min="0" placeholder="Age" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" /><select name="gender" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"><option>Not specified</option><option>Female</option><option>Male</option><option>Other</option></select><select name="department" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 sm:col-span-2"><option>General Care</option><option>Cardiology</option><option>Neurology</option><option>Orthopedics</option><option>Dermatology</option></select></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setAddPatientOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button className="rounded-xl bg-[#0057d9] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Add patient</button></div></form></div>}
      {notice && <div role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"><span>{notice}</span><button onClick={() => setNotice(null)} className="text-slate-300 hover:text-white" aria-label="Dismiss notification"><X size={16} /></button></div>}
    </div>
  );
}
