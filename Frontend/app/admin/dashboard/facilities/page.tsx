"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Download, Plus, Eye, Pencil, Trash2, CheckCircle2,
  ChevronLeft, ChevronRight, X, Loader2, AlertTriangle, SlidersHorizontal,
  Building2, Activity, Cross, Stethoscope, TrendingUp, Siren, Star,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type HospitalStatus = "VERIFIED" | "PENDING" | "SUSPENDED" | "INACTIVE";

interface Hospital {
  _id: string;
  hospitalName: string;
  type: string;              // e.g. "Multi-specialty Center", "Trauma Level 1"
  city: string;
  state: string;
  departments: string[];
  doctorsCount: number;
  status: HospitalStatus;
  rating?: number;           // 0–5
  emergency?: boolean;       // has an emergency center
  createdAt: string;
  image?: string;
  email?: string;
  phoneNumber?: string;
}

const PAGE_SIZE = 10;
const BASE = "http://localhost:5000/api/v1/admin/hospitals";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function generateHospitalId(index: number) {
  return `#H-${2041 + index}`;
}

// Icon + color per hospital, driven off facility type so the same type
// always renders the same way (deterministic, not random per-render).
const ICON_STYLES = [
  { icon: Building2,   bg: "bg-slate-100",  color: "text-slate-500" },
  { icon: Activity,    bg: "bg-teal-100",   color: "text-teal-600" },
  { icon: Cross,       bg: "bg-blue-100",   color: "text-blue-600" },
  { icon: Stethoscope, bg: "bg-indigo-100", color: "text-indigo-600" },
];

function getHospitalIcon(hospital: Hospital) {
  const key = (hospital.type || hospital.hospitalName || "H").charCodeAt(0);
  return ICON_STYLES[key % ICON_STYLES.length];
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: HospitalStatus }) {
  const map: Record<HospitalStatus, string> = {
    VERIFIED:  "bg-teal-50 text-teal-600 border border-teal-200",
    PENDING:   "bg-amber-50 text-amber-600 border border-amber-200",
    SUSPENDED: "bg-red-50 text-red-500 border border-red-200",
    INACTIVE:  "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "VERIFIED" ? "bg-teal-500" :
        status === "PENDING" ? "bg-amber-500" :
        status === "SUSPENDED" ? "bg-red-500" : "bg-gray-400"
      }`} />
      {status}
    </span>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

function ViewModal({ hospital, onClose }: { hospital: Hospital; onClose: () => void }) {
  const { icon: Icon, bg, color } = getHospitalIcon(hospital);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-slate-900">Hospital Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
            {hospital.image ? (
              <img
                src={`http://localhost:5000${hospital.image}`}
                alt={hospital.hospitalName}
                className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow"
              />
            ) : (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                <Icon size={26} strokeWidth={2} />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-base">{hospital.hospitalName}</p>
              <p className="text-xs text-slate-400 font-medium">{hospital.type}</p>
              <div className="mt-1"><StatusBadge status={hospital.status} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Location",   value: `${hospital.city}, ${hospital.state}` },
              { label: "Doctors",    value: hospital.doctorsCount.toString() },
              { label: "Rating",     value: hospital.rating ? `${hospital.rating.toFixed(1)}/5.0` : "—" },
              { label: "Registered", value: formatDate(hospital.createdAt) },
            ].map((f) => (
              <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Departments</p>
            <div className="flex flex-wrap gap-1.5">
              {hospital.departments.map((d, idx) => (
                <span key={`${d}-${idx}`} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                  {d}
                </span>
              ))}
            </div>
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

// ── Add Hospital Modal ────────────────────────────────────────────────────────

function AddHospitalModal({
  onClose, onSuccess, token,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}) {
  const [form, setForm] = useState({
    hospitalName: "", type: "Multi-specialty Center", city: "", state: "",
    phoneNumber: "", email: "", departments: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.hospitalName || !form.city || !form.state || !form.phoneNumber || !form.email) {
      setError("All required fields must be filled"); return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          departments: form.departments.split(",").map((d) => d.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? "Failed to add hospital");
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
          <h2 className="text-base font-bold text-slate-900">Add New Hospital</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {done ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <p className="text-sm font-bold text-slate-900">Hospital added successfully!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl">
                  <AlertTriangle size={13} /> {error}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Hospital Name *</label>
                <input className={fieldCls} value={form.hospitalName} onChange={(e) => set("hospitalName", e.target.value)} placeholder="Central General Hospital" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Facility Type</label>
                <select className={fieldCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {["Multi-specialty Center", "Trauma Level 1", "Trauma Level 2", "Specialized Family Care", "General Hospital", "Clinic"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">City *</label>
                  <input className={fieldCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Downtown" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">State *</label>
                  <input className={fieldCls} value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="NY" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Email *</label>
                <input className={fieldCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@hospital.com" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Phone *</label>
                <input className={fieldCls} value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Departments (comma separated)</label>
                <input className={fieldCls} value={form.departments} onChange={(e) => set("departments", e.target.value)} placeholder="Cardiology, ER, Neurology" />
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
              Add Hospital
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function EditHospitalModal({ hospital, token, onClose, onSuccess }: { hospital: Hospital; token: string | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    hospitalName: hospital.hospitalName, type: hospital.type || "General Hospital", city: hospital.city, state: hospital.state,
    email: hospital.email || "", phoneNumber: hospital.phoneNumber || "", departments: hospital.departments.join(", "),
    doctorsCount: String(hospital.doctorsCount || 0), rating: String(hospital.rating ?? 0), emergency: Boolean(hospital.emergency),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const fieldCls = "w-full h-10 px-3 border border-gray-200 rounded-xl text-sm outline-none transition-all font-medium focus:border-[#0057d9] bg-white";
  const save = async () => {
    if (!form.hospitalName.trim() || !form.city.trim() || !form.state.trim() || !form.email.trim() || !form.phoneNumber.trim()) { setError("Hospital name, location, email, and phone are required."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch(`${BASE}/${hospital._id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, departments: form.departments.split(",").map((department) => department.trim()).filter(Boolean), doctorsCount: Number(form.doctorsCount) || 0, rating: Number(form.rating) || 0 }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.message || "Failed to update hospital"); }
      onSuccess(); onClose();
    } catch (error: any) { setError(error.message || "Failed to update hospital"); } finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-gray-100 px-6 py-4"><h2 className="text-base font-bold text-slate-900">Edit Hospital</h2><button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={16} /></button></div><div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 py-5">{error && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600"><AlertTriangle size={13} />{error}</div>}<Field label="Hospital Name *"><input className={fieldCls} value={form.hospitalName} onChange={(e) => set("hospitalName", e.target.value)} /></Field><Field label="Facility Type"><input className={fieldCls} value={form.type} onChange={(e) => set("type", e.target.value)} /></Field><div className="grid grid-cols-2 gap-3"><Field label="City *"><input className={fieldCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field><Field label="State *"><input className={fieldCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field></div><Field label="Email *"><input className={fieldCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field><Field label="Phone *"><input className={fieldCls} value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} /></Field><Field label="Departments (comma separated)"><input className={fieldCls} value={form.departments} onChange={(e) => set("departments", e.target.value)} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Doctors"><input className={fieldCls} type="number" min="0" value={form.doctorsCount} onChange={(e) => set("doctorsCount", e.target.value)} /></Field><Field label="Rating"><input className={fieldCls} type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} /></Field></div><label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input type="checkbox" checked={form.emergency} onChange={(e) => set("emergency", e.target.checked)} /> Emergency center</label></div><div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4"><button onClick={onClose} disabled={saving} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button><button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-[#0057d9] px-5 py-2 text-xs font-bold text-white disabled:opacity-50">{saving && <Loader2 size={12} className="animate-spin" />}Save changes</button></div></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="mb-1.5 block text-xs font-bold text-slate-600">{label}</label>{children}</div>; }

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals]   = useState<Hospital[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [typeFilter, setType]       = useState("All");
  const [page, setPage]             = useState(1);
  const [viewHospital, setView]     = useState<Hospital | null>(null);
  const [editHospital, setEdit]     = useState<Hospital | null>(null);
  const [showAdd, setShowAdd]       = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`${BASE}?page=1&limit=300`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch hospitals");
      const data = await res.json();
      const list = data.hospitals ?? data.data ?? data ?? [];
      // Guard against malformed records missing required fields
      const safeList = (Array.isArray(list) ? list : []).filter(
        (h: Partial<Hospital>) => !!h && !!h.hospitalName && !!h._id
      );
      setHospitals(safeList);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const verifyHospital = async (id: string) => {
    try {
      const res = await fetch(`${BASE}/${id}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to verify hospital");
      fetchHospitals();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteHospital = async (id: string) => {
    if (!confirm("Remove this hospital from the network?")) return;
    try {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete hospital");
      fetchHospitals();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────

  const facilityTypes = ["All", ...Array.from(new Set(hospitals.map((h) => h.type || "General Hospital")))];

  const filtered = hospitals
    .filter((h) => statusFilter === "All" || h.status === statusFilter)
    .filter((h) => typeFilter === "All" || (h.type || "General Hospital") === typeFilter)
    .filter((h) =>
      search === "" ||
      h.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Export CSV ────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ["ID", "Hospital Name", "Type", "City", "State", "Departments", "Doctors", "Status", "Rating", "Registered"],
      ...filtered.map((h, i) => [
        generateHospitalId(i), h.hospitalName, h.type, h.city, h.state,
        h.departments.join(" | "), h.doctorsCount.toString(), h.status,
        h.rating?.toFixed(1) ?? "", formatDate(h.createdAt),
      ]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "hospitals.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stat cards ────────────────────────────────────────────────────────────

  const avgRating = hospitals.length
    ? hospitals.reduce((sum, h) => sum + (h.rating ?? 0), 0) / hospitals.length
    : 0;
  const activeCount = hospitals.filter((h) => h.status !== "INACTIVE").length;
  const activePct = hospitals.length ? Math.round((activeCount / hospitals.length) * 100) : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* Title row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospitals</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor healthcare facilities across the network.</p>
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
            Add Hospital
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
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Hospitals</p>
          <div className="flex items-end justify-between mt-1.5">
            <p className="text-2xl font-extrabold text-slate-900">{hospitals.length.toLocaleString()}</p>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mb-1">
              <TrendingUp size={11} strokeWidth={3} /> +4%
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified</p>
          <div className="flex items-end justify-between mt-1.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {hospitals.filter((h) => h.status === "VERIFIED").length.toLocaleString()}
            </p>
            <CheckCircle2 size={16} className="text-teal-500 mb-1" strokeWidth={2.5} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Centers</p>
          <div className="flex items-end justify-between mt-1.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {hospitals.filter((h) => h.emergency).length}
            </p>
            <Siren size={16} className="text-red-400 mb-1" strokeWidth={2.5} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Facilities</p>
          <div className="flex items-end justify-between mt-1.5">
            <p className="text-2xl font-extrabold text-slate-900">{activeCount}</p>
            <span className="flex items-center justify-center w-8 h-5 rounded-full bg-blue-100 text-blue-600 text-[9px] font-bold mb-0.5">
              {activePct}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Rating</p>
          <div className="flex items-end justify-between mt-1.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {avgRating.toFixed(1)}<span className="text-sm text-slate-400 font-bold">/5.0</span>
            </p>
            <Star size={16} className="text-amber-400 fill-amber-400 mb-1" />
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, ID, or city..."
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
          {["All", "VERIFIED", "PENDING", "SUSPENDED", "INACTIVE"].map((s) => (
            <option key={s}>{s === "All" ? "Status: All" : s}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-9 px-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-[#0057d9] shadow-sm"
        >
          {facilityTypes.map((t) => (
            <option key={t}>{t === "All" ? "Type: All Facilities" : t}</option>
          ))}
        </select>

        <button className="h-9 w-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-colors">
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          {[
            ["ID", "col-span-1"],
            ["Hospital Name", "col-span-3"],
            ["Location", "col-span-2"],
            ["Departments", "col-span-3"],
            ["Doctors", "col-span-1"],
            ["Status", "col-span-1"],
            ["Actions", "col-span-1 justify-end"],
          ].map(([h, cls]) => (
            <div key={h} className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center ${cls}`}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin text-[#0057d9]" />
            <span className="text-sm font-semibold">Loading hospitals...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm font-bold">No hospitals found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          paginated.map((hospital, i) => {
            const { icon: Icon, bg, color } = getHospitalIcon(hospital);

            return (
              <div
                key={hospital._id}
                className={`grid grid-cols-12 gap-2 px-5 py-4 items-center border-b border-slate-50 hover:bg-slate-50/40 transition-colors ${
                  i === paginated.length - 1 ? "border-b-0" : ""
                }`}
              >
                {/* ID */}
                <div className="col-span-1 text-xs font-bold text-slate-400">
                  {generateHospitalId((page - 1) * PAGE_SIZE + i)}
                </div>

                {/* Hospital Name */}
                <div className="col-span-3 flex items-center gap-3">
                  {hospital.image ? (
                    <img
                      src={`http://localhost:5000${hospital.image}`}
                      alt={hospital.hospitalName}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg} ${color}`}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{hospital.hospitalName}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{hospital.type || "General Hospital"}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="col-span-2 text-xs text-slate-600 font-medium">
                  {hospital.city}, {hospital.state}
                </div>

                {/* Departments */}
                <div className="col-span-3 flex flex-wrap gap-1">
                  {hospital.departments.slice(0, 3).map((d, idx) => (
                    <span key={`${d}-${idx}`} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">
                      {d}
                    </span>
                  ))}
                  {hospital.departments.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-400">
                      +{hospital.departments.length - 3}
                    </span>
                  )}
                </div>

                {/* Doctors */}
                <div className="col-span-1 text-xs font-bold text-slate-700">{hospital.doctorsCount}</div>

                {/* Status */}
                <div className="col-span-1">
                  <StatusBadge status={hospital.status} />
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end items-center gap-1">
                  {hospital.status === "PENDING" && (
                    <button
                      onClick={() => verifyHospital(hospital._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                      title="Verify"
                    >
                      <CheckCircle2 size={15} strokeWidth={2.5} />
                    </button>
                  )}
                  <button
                    onClick={() => setView(hospital)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0057d9] hover:bg-blue-50 transition-colors"
                    title="View"
                  >
                    <Eye size={15} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setEdit(hospital)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0057d9] hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => deleteHospital(hospital._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} strokeWidth={2.5} />
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
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()} facilities
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 h-7 flex items-center gap-1 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} /> Previous
              </button>

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
                className="px-2.5 h-7 flex items-center gap-1 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewHospital && <ViewModal hospital={viewHospital} onClose={() => setView(null)} />}
      {editHospital && <EditHospitalModal hospital={editHospital} token={token} onClose={() => setEdit(null)} onSuccess={fetchHospitals} />}
      {showAdd && <AddHospitalModal token={token} onClose={() => setShowAdd(false)} onSuccess={fetchHospitals} />}
    </div>
  );
}
