"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Download, Plus, Eye, ChevronLeft, ChevronRight,
  X, Loader2, AlertTriangle, CheckCircle2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type PatientStatus = "ACTIVE" | "EMERGENCY" | "PENDING" | "INACTIVE";
type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
type Gender = "Male" | "Female" | "Other";

interface Patient {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  status?: PatientStatus;
  createdAt: string;
  profileImage?: string;
}

const PAGE_SIZE = 10;
const BASE = "http://localhost:5000/api/v1/admin/users";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name?: string) {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-teal-100 text-teal-600",
    "bg-purple-100 text-purple-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
    "bg-emerald-100 text-emerald-600",
  ];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return colors[idx];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function generatePatientId(index: number) {
  return `#PA-${2041 + index}`;
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PatientStatus }) {
  const map: Record<PatientStatus, string> = {
    ACTIVE:    "bg-teal-50 text-teal-600 border border-teal-200",
    EMERGENCY: "bg-red-50 text-red-500 border border-red-200",
    PENDING:   "bg-amber-50 text-amber-600 border border-amber-200",
    INACTIVE:  "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "ACTIVE" ? "bg-teal-500" :
        status === "EMERGENCY" ? "bg-red-500" :
        status === "PENDING" ? "bg-amber-500" : "bg-gray-400"
      }`} />
      {status}
    </span>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

function ViewModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const initials    = getInitials(patient.fullName);
  const avatarColor = getAvatarColor(patient.fullName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-slate-900">Patient Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
            {patient.profileImage ? (
              <img
                src={`http://localhost:5000${patient.profileImage}`}
                alt={patient.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
              />
            ) : (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${avatarColor}`}>
                {initials}
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-base">{patient.fullName}</p>
              <p className="text-xs text-slate-400 font-medium">{patient.email}</p>
              {patient.status && <div className="mt-1"><StatusBadge status={patient.status} /></div>}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Phone",      value: patient.phoneNumber },
              { label: "Gender",     value: patient.gender     ?? "—" },
              { label: "Blood Group",value: patient.bloodGroup  ?? "—" },
              { label: "Registered", value: formatDate(patient.createdAt) },
            ].map((f) => (
              <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#0057d9] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Patient Modal ─────────────────────────────────────────────────────────

function AddPatientModal({
  onClose, onSuccess, token,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}) {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", phoneNumber: "",
    gender: "Male" as Gender, bloodGroup: "O+" as BloodGroup,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password || !form.phoneNumber) {
      setError("All fields are required"); return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? "Failed to add patient");
      }
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = "w-full h-10 px-3 border border-gray-200 rounded-xl text-sm outline-none transition-all font-medium focus:border-[#0057d9] bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-slate-900">Add New Patient</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {done ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <p className="text-sm font-bold text-slate-900">Patient added successfully!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl">
                  <AlertTriangle size={13} /> {error}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Full Name *</label>
                <input className={fieldCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="John Doe" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Email *</label>
                <input className={fieldCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Phone *</label>
                <input className={fieldCls} value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Password *</label>
                <input className={fieldCls} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Gender</label>
                  <select className={fieldCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                    {["Male", "Female", "Other"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Blood Group</label>
                  <select className={fieldCls} value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {!done && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#0057d9] text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              Add Patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPatientsPage() {
  const [patients, setPatients]     = useState<Patient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [genderFilter, setGender]   = useState("All");
  const [sort, setSort]             = useState("Recent");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [viewPatient, setView]      = useState<Patient | null>(null);
  const [showAdd, setShowAdd]       = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`${BASE}?page=1&limit=300`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      // API returns { users: [...] } or { data: [...] } — handle both
      const list = data.users ?? data.data ?? data ?? [];
      setPatients(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // ── Filter + sort ───────────────────────────────────────────────────────────

  const filtered = patients
    .filter((p) => statusFilter === "All" || (p.status ?? "ACTIVE") === statusFilter)
    .filter((p) => genderFilter === "All" || p.gender === genderFilter)
    .filter((p) =>
      search === "" ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phoneNumber?.includes(search)
    )
    .sort((a, b) => {
      if (sort === "Recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "Oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.fullName.localeCompare(b.fullName);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Checkbox logic ──────────────────────────────────────────────────────────

  const allChecked  = paginated.length > 0 && paginated.every((p) => selected.has(p._id));
  const toggleAll   = () => {
    if (allChecked) {
      setSelected((s) => { const n = new Set(s); paginated.forEach((p) => n.delete(p._id)); return n; });
    } else {
      setSelected((s) => { const n = new Set(s); paginated.forEach((p) => n.add(p._id)); return n; });
    }
  };
  const toggleOne = (id: string) => {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ["ID", "Name", "Email", "Phone", "Gender", "Blood", "Status", "Registered"],
      ...filtered.map((p, i) => [
        generatePatientId(i), p.fullName, p.email, p.phoneNumber,
        p.gender ?? "", p.bloodGroup ?? "", p.status ?? "ACTIVE", formatDate(p.createdAt),
      ]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "patients.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stat cards data ─────────────────────────────────────────────────────────

  const stats = [
    {
      label: "Total Patients",
      value: patients.length.toLocaleString(),
      delta: "+4.2%",
      deltaColor: "text-emerald-600",
      bg: "bg-blue-50",
      iconColor: "text-[#0057d9]",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Active Patients",
      value: patients.filter((p) => (p.status ?? "ACTIVE") === "ACTIVE").length.toLocaleString(),
      delta: "+2.1%",
      deltaColor: "text-emerald-600",
      bg: "bg-teal-50",
      iconColor: "text-teal-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "New Registrations",
      value: patients.filter((p) => {
        const d = new Date(p.createdAt);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length.toString(),
      delta: "Today",
      deltaColor: "text-slate-500",
      bg: "bg-slate-50",
      iconColor: "text-slate-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: "Emergency Cases",
      value: patients.filter((p) => p.status === "EMERGENCY").length.toString(),
      delta: "High Priority",
      deltaColor: "text-red-500",
      bg: "bg-red-50",
      iconColor: "text-red-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: "Verified Accounts",
      value: `${Math.round((patients.filter((p) => (p.status ?? "ACTIVE") !== "PENDING").length / Math.max(1, patients.length)) * 100)}%`,
      delta: "Excellent",
      deltaColor: "text-emerald-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* Title row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor patient records across the facility.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download size={15} strokeWidth={2.5} />
            Export CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0057d9] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">
          <AlertTriangle size={14} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} ${s.iconColor}`}>
                {s.icon}
              </div>
              <span className={`text-[10px] font-bold ${s.deltaColor}`}>{s.delta}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-[11px] font-semibold text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter by name, ID, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none font-medium focus:border-[#0057d9] transition-all shadow-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 px-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-[#0057d9] shadow-sm"
        >
          {["All", "ACTIVE", "EMERGENCY", "PENDING", "INACTIVE"].map((s) => (
            <option key={s}>{s === "All" ? "Status: All" : s}</option>
          ))}
        </select>

        <select
          value={genderFilter}
          onChange={(e) => { setGender(e.target.value); setPage(1); }}
          className="h-9 px-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-[#0057d9] shadow-sm"
        >
          {["All", "Male", "Female", "Other"].map((g) => (
            <option key={g}>{g === "All" ? "Gender: All" : g}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="h-9 px-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-[#0057d9] shadow-sm"
        >
          {["Recent", "Oldest", "Name A-Z"].map((s) => (
            <option key={s}>{`Sort: ${s}`}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-slate-300 accent-[#0057d9]"
            />
          </div>
          {["ID", "Patient", "Contact", "Gender", "Blood", "Reg. Date", "Status", ""].map((h, i) => (
            <div
              key={i}
              className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center
                ${h === "Patient" ? "col-span-3" : h === "" ? "col-span-1 justify-end" : "col-span-1"}`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin text-[#0057d9]" />
            <span className="text-sm font-semibold">Loading patients...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm font-bold">No patients found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          paginated.map((patient, i) => {
            const initials    = getInitials(patient.fullName);
            const avatarColor = getAvatarColor(patient.fullName);
            const status      = patient.status ?? "ACTIVE";
            const isChecked   = selected.has(patient._id);

            return (
              <div
                key={patient._id}
                className={`grid grid-cols-12 gap-2 px-5 py-4 items-center border-b border-slate-50 hover:bg-slate-50/40 transition-colors ${
                  i === paginated.length - 1 ? "border-b-0" : ""
                } ${isChecked ? "bg-blue-50/30" : ""}`}
              >
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(patient._id)}
                    className="w-4 h-4 rounded border-slate-300 accent-[#0057d9]"
                  />
                </div>

                {/* ID */}
                <div className="col-span-1 text-xs font-bold text-slate-400">
                  {generatePatientId((page - 1) * PAGE_SIZE + i)}
                </div>

                {/* Patient */}
                <div className="col-span-3 flex items-center gap-3">
                  {patient.profileImage ? (
                    <img
                      src={`http://localhost:5000${patient.profileImage}`}
                      alt={patient.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.fullName}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{patient.email}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="col-span-1 text-xs text-slate-600 font-medium">{patient.phoneNumber}</div>

                {/* Gender */}
                <div className="col-span-1 text-xs text-slate-600 font-medium">{patient.gender ?? "—"}</div>

                {/* Blood */}
                <div className="col-span-1">
                  <span className="text-xs font-bold text-slate-700">{patient.bloodGroup ?? "—"}</span>
                </div>

                {/* Reg Date */}
                <div className="col-span-2 text-xs text-slate-500 font-medium">{formatDate(patient.createdAt)}</div>

                {/* Status */}
                <div className="col-span-1">
                  <StatusBadge status={status as PatientStatus} />
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setView(patient)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0057d9] hover:bg-blue-50 transition-colors"
                    title="View"
                  >
                    <Eye size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-[11px] font-semibold text-slate-400">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()} patients
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
              </button>

              {/* Page numbers — show first, last, and window around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="w-7 text-center text-xs text-slate-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${
                        p === page ? "bg-[#0057d9] text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewPatient && <ViewModal patient={viewPatient} onClose={() => setView(null)} />}
      {showAdd && <AddPatientModal token={token} onClose={() => setShowAdd(false)} onSuccess={fetchPatients} />}
    </div>
  );
}