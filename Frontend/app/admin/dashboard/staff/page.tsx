"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type DoctorStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "EMERGENCY";

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  hospitalName?: string;
  experience: number;
  rating: number;
  status: DoctorStatus;
  gender?: string;
  qualifications?: string[];
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  onLeave: number;
  emergency: number;
  avgRating: number;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  hospitalName: string;
  experience: string;
  rating: string;
  status: DoctorStatus;
  gender: string;
}

const EMPTY_FORM: FormState = {
  fullName: "", email: "", phone: "", specialization: "",
  department: "", hospitalName: "", experience: "0",
  rating: "0", status: "ACTIVE", gender: "Male",
};

const DEPARTMENTS   = ["Cardiology", "Surgery", "Pediatrics", "Neurology", "Radiology", "Orthopedics", "Dermatology", "General Practice", "Emergency", "Other"];
const STATUSES: DoctorStatus[] = ["ACTIVE", "ON_LEAVE", "INACTIVE", "EMERGENCY"];
const PAGE_SIZE     = 10;
const BASE          = "http://localhost:5000/api/v1/admin/doctors";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    { bg: "#DBEAFE", text: "#2563EB" },
    { bg: "#DCFCE7", text: "#16A34A" },
    { bg: "#FFEDD5", text: "#EA580C" },
    { bg: "#E0E7FF", text: "#4F46E5" },
    { bg: "#FCE7F3", text: "#DB2777" },
    { bg: "#FEF3C7", text: "#D97706" },
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DoctorStatus }) {
  const map: Record<DoctorStatus, { bg: string; color: string }> = {
    ACTIVE:    { bg: "#DCFCE7", color: "#15803D" },
    ON_LEAVE:  { bg: "#F1F5F9", color: "#475569" },
    INACTIVE:  { bg: "#F1F5F9", color: "#94A3B8" },
    EMERGENCY: { bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = map[status];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "999px", fontSize: "11px",
      fontWeight: 700, backgroundColor: s.bg, color: s.color,
    }}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.4)", padding: "16px",
    }}>
      <div style={{
        background: "white", borderRadius: "16px", width: "100%",
        maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>{title}</span>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: "#94A3B8" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Doctor Form ───────────────────────────────────────────────────────────────

function DoctorForm({ form, onChange, onSubmit, onCancel, saving, submitLabel }: {
  form: FormState;
  onChange: (k: keyof FormState, v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", height: "38px", padding: "0 10px",
    border: "1px solid #E2E8F0", borderRadius: "8px",
    fontSize: "13px", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 700, color: "#64748B",
    textTransform: "uppercase", letterSpacing: "0.04em",
    display: "block", marginBottom: "5px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} value={form.fullName} onChange={(e) => onChange("fullName", e.target.value)} placeholder="Dr. John Doe" />
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input style={inputStyle} type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="doctor@hospital.com" />
        </div>
        <div>
          <label style={labelStyle}>Phone *</label>
          <input style={inputStyle} value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select style={inputStyle} value={form.gender} onChange={(e) => onChange("gender", e.target.value)}>
            {["Male", "Female", "Other"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Specialization *</label>
          <input style={inputStyle} value={form.specialization} onChange={(e) => onChange("specialization", e.target.value)} placeholder="e.g. Cardiology" />
        </div>
        <div>
          <label style={labelStyle}>Department *</label>
          <select style={inputStyle} value={form.department} onChange={(e) => onChange("department", e.target.value)}>
            <option value="">Select...</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Hospital</label>
          <input style={inputStyle} value={form.hospitalName} onChange={(e) => onChange("hospitalName", e.target.value)} placeholder="Hospital name" />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle} value={form.status} onChange={(e) => onChange("status", e.target.value as DoctorStatus)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Experience (years)</label>
          <input style={inputStyle} type="number" min="0" value={form.experience} onChange={(e) => onChange("experience", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Rating (0–5)</label>
          <input style={inputStyle} type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => onChange("rating", e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={saving}
          style={{ padding: "8px 18px", border: "none", borderRadius: "8px", background: "#2563EB", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

function ViewDoctorModal({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
  const avatar = getAvatarColor(doctor.fullName);
  const row = (label: string, value: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F8FAFC" }}>
      <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#0F172A", fontWeight: 600 }}>{value || "—"}</span>
    </div>
  );

  return (
    <Modal title="Doctor Details" onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px", padding: "12px", background: "#F8FAFC", borderRadius: "10px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: avatar.bg, color: avatar.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, flexShrink: 0 }}>
          {getInitials(doctor.fullName)}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "15px", color: "#0F172A", margin: 0 }}>{doctor.fullName}</p>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 6px" }}>{doctor.email}</p>
          <StatusBadge status={doctor.status} />
        </div>
      </div>
      {row("Phone",          doctor.phone)}
      {row("Specialization", doctor.specialization)}
      {row("Department",     doctor.department)}
      {row("Hospital",       doctor.hospitalName ?? "")}
      {row("Experience",     `${doctor.experience} years`)}
      {row("Rating",         `${doctor.rating} / 5`)}
      {row("Gender",         doctor.gender ?? "")}
      {row("Joined",         formatDate(doctor.createdAt))}
    </Modal>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteModal({ name, onClose, onConfirm, deleting }: {
  name: string; onClose: () => void; onConfirm: () => void; deleting: boolean;
}) {
  return (
    <Modal title="Delete Doctor" onClose={onClose}>
      <p style={{ fontSize: "13px", color: "#475569", marginBottom: "20px" }}>
        Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#334155" }}>Cancel</button>
        <button onClick={onConfirm} disabled={deleting} style={{ padding: "8px 16px", border: "none", borderRadius: "8px", background: "#DC2626", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, opacity: deleting ? 0.6 : 1 }}>
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DoctorManagementPage() {
  const [doctors, setDoctors]       = useState<Doctor[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [deptFilter, setDept]       = useState("All");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected]     = useState<Set<string>>(new Set());

  // Modal state
  const [viewDoc, setViewDoc]       = useState<Doctor | null>(null);
  const [editDoc, setEditDoc]       = useState<Doctor | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [deleteDoc, setDeleteDoc]   = useState<Doctor | null>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const params = new URLSearchParams({
        page: String(page), limit: String(PAGE_SIZE),
        ...(search       ? { search }             : {}),
        ...(statusFilter !== "All" ? { status: statusFilter } : {}),
        ...(deptFilter   !== "All" ? { department: deptFilter } : {}),
      });
      const res = await fetch(`${BASE}?${params}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch doctors");
      const data = await res.json();
      setDoctors(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, deptFilter, token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/stats`, { headers });
      if (!res.ok) return;
      setStats(await res.json());
    } catch {}
  }, [token]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { fetchStats(); },  [fetchStats]);

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    setSaving(true); setError("");
    try {
      const body = { ...form, experience: Number(form.experience), rating: Number(form.rating) };
      const res  = await fetch(BASE, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setShowAdd(false); setForm(EMPTY_FORM);
      fetchDoctors(); fetchStats();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editDoc) return;
    setSaving(true); setError("");
    try {
      const experience = Number(form.experience);
      const rating = Number(form.rating);
      if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.specialization.trim() || !form.department) {
        throw new Error("Name, email, phone, specialization, and department are required.");
      }
      if (!Number.isFinite(experience) || experience < 0 || !Number.isFinite(rating) || rating < 0 || rating > 5) {
        throw new Error("Experience must be 0 or greater and rating must be between 0 and 5.");
      }
      const body = { ...form, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), specialization: form.specialization.trim(), department: form.department.trim(), hospitalName: form.hospitalName.trim(), experience, rating };
      const res  = await fetch(`${BASE}/${editDoc._id}`, { method: "PUT", headers, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      const { doctor } = await res.json();
      setDoctors((current) => current.map((item) => item._id === doctor._id ? doctor : item));
      setEditDoc(null); setForm(EMPTY_FORM);
      fetchStats();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/${deleteDoc._id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteDoc(null);
      fetchDoctors(); fetchStats();
    } catch (e: any) { setError(e.message); }
    finally { setDeleting(false); }
  };

  const openEdit = (doc: Doctor) => {
    setForm({
      fullName: doc.fullName, email: doc.email, phone: doc.phone,
      specialization: doc.specialization, department: doc.department,
      hospitalName: doc.hospitalName ?? "", experience: String(Number.isFinite(doc.experience) ? doc.experience : 0),
      rating: String(Number.isFinite(doc.rating) ? doc.rating : 0), status: doc.status ?? "ACTIVE", gender: doc.gender ?? "Male",
    });
    setEditDoc(doc);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setShowAdd(true); };
  const setField = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ── Checkbox ────────────────────────────────────────────────────────────────

  const allChecked = doctors.length > 0 && doctors.every((d) => selected.has(d._id));
  const toggleAll  = () => {
    if (allChecked) setSelected((s) => { const n = new Set(s); doctors.forEach((d) => n.delete(d._id)); return n; });
    else            setSelected((s) => { const n = new Set(s); doctors.forEach((d) => n.add(d._id)); return n; });
  };
  const toggleOne = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Export CSV ──────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Phone", "Specialization", "Department", "Hospital", "Experience", "Rating", "Status"],
      ...doctors.map((d) => [d.fullName, d.email, d.phone, d.specialization, d.department, d.hospitalName ?? "", d.experience, d.rating, d.status]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "doctors.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = { border: "none", outline: "none", flex: 1, fontSize: "13px", color: "#334155", background: "transparent" };

  return (
    <div style={{ padding: "24px", fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: "#F8FAFC" }}>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "#DC2626", fontSize: "13px", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#DC2626" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Doctor Management</h1>
          <p style={{ color: "#64748B", margin: "4px 0 0", fontSize: "14px" }}>Manage and monitor hospital medical staff across the network.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={fetchDoctors} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #CBD5E1", borderRadius: "8px", background: "white", cursor: "pointer", color: "#475569" }}>↻</button>
          <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", border: "1px solid #CBD5E1", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#334155" }}>
            ↑ Export
          </button>
          <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", backgroundColor: "#2563EB", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
            + Add Doctor
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "18px" }}>
        {[
          { label: "Total Staff",      value: stats?.total     ?? 0, bg: "#DBEAFE", color: "#2563EB" },
          { label: "Active",           value: stats?.active    ?? 0, bg: "#DCFCE7", color: "#16A34A" },
          { label: "On Leave",         value: stats?.onLeave   ?? 0, bg: "#F1F5F9", color: "#475569" },
          { label: "Emergency",        value: stats?.emergency ?? 0, bg: "#FEE2E2", color: "#DC2626" },
          { label: "Avg Rating",       value: stats?.avgRating ?? 0, bg: "#FEF3C7", color: "#D97706" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", backgroundColor: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", fontSize: "14px", fontWeight: 700 }}>
              {String(s.value)[0]}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "5px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "10px" }}>
          <span style={{ color: "#94A3B8" }}>🔍</span>
          <input
            placeholder="Search by name, email, or specialty..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={inputStyle}
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ height: "38px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#334155", background: "white", cursor: "pointer" }}>
          {["All", ...STATUSES].map((s) => <option key={s}>{s === "All" ? "Status: All" : s}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => { setDept(e.target.value); setPage(1); }}
          style={{ height: "38px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#334155", background: "white", cursor: "pointer" }}>
          {["All", ...DEPARTMENTS].map((d) => <option key={d}>{d === "All" ? "Dept: All" : d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "860px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                {["", "ID", "Doctor Info", "Department", "Hospital", "Phone", "Exp", "Rating", "Status", "Actions"].map((h, i) => (
                  <th key={i} style={{ padding: "11px 14px", color: "#475569", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap", textAlign: h === "Actions" ? "right" : "left" }}>
                    {h === "" ? <input type="checkbox" checked={allChecked} onChange={toggleAll} /> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#94A3B8", fontSize: "14px" }}>Loading doctors...</td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#94A3B8", fontSize: "14px" }}>No doctors found</td></tr>
              ) : doctors.map((doc) => {
                const avatar = getAvatarColor(doc.fullName);
                return (
                  <tr key={doc._id} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: selected.has(doc._id) ? "#EFF6FF" : "white" }}>
                    <td style={{ padding: "12px 14px" }}><input type="checkbox" checked={selected.has(doc._id)} onChange={() => toggleOne(doc._id)} /></td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#64748B", fontSize: "12px" }}>#{doc._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: avatar.bg, color: avatar.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                          {getInitials(doc.fullName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0F172A", fontSize: "14px" }}>{doc.fullName}</div>
                          <div style={{ fontSize: "12px", color: "#64748B" }}>{doc.specialization}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#334155" }}>{doc.department}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#334155" }}>{doc.hospitalName ?? "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#334155" }}>{doc.phone}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#334155" }}>{doc.experience}yr</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#D97706", fontWeight: 700 }}>★ {doc.rating}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={doc.status} /></td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button onClick={() => setViewDoc(doc)} title="View doctor" aria-label={`View ${doc.fullName}`} style={{ border: "none", borderRadius: "6px", background: "none", cursor: "pointer", color: "#2563EB", padding: "5px", display: "inline-flex" }}><Eye size={16} strokeWidth={2.25} /></button>
                        <button onClick={() => openEdit(doc)} title="Edit doctor" aria-label={`Edit ${doc.fullName}`} style={{ border: "none", borderRadius: "6px", background: "none", cursor: "pointer", color: "#475569", padding: "5px", display: "inline-flex" }}><Pencil size={16} strokeWidth={2.25} /></button>
                        <button onClick={() => setDeleteDoc(doc)} title="Delete doctor" aria-label={`Delete ${doc.fullName}`} style={{ border: "none", borderRadius: "6px", background: "none", cursor: "pointer", color: "#DC2626", padding: "5px", display: "inline-flex" }}><Trash2 size={16} strokeWidth={2.25} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", backgroundColor: "#FAFAFA", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#64748B" }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} doctors
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <PageBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</PageBtn>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
            ))}
            {totalPages > 5 && <span style={{ fontSize: "13px", color: "#94A3B8" }}>...</span>}
            <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</PageBtn>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewDoc  && <ViewDoctorModal doctor={viewDoc} onClose={() => setViewDoc(null)} />}
      {showAdd  && (
        <Modal title="Add New Doctor" onClose={() => setShowAdd(false)}>
          <DoctorForm form={form} onChange={setField} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} submitLabel="Add Doctor" />
        </Modal>
      )}
      {editDoc  && (
        <Modal title="Edit Doctor" onClose={() => setEditDoc(null)}>
          <DoctorForm form={form} onChange={setField} onSubmit={handleEdit} onCancel={() => setEditDoc(null)} saving={saving} submitLabel="Save Changes" />
        </Modal>
      )}
      {deleteDoc && <DeleteModal name={deleteDoc.fullName} onClose={() => setDeleteDoc(null)} onConfirm={handleDelete} deleting={deleting} />}
    </div>
  );
}

// ── Pagination Button ─────────────────────────────────────────────────────────

function PageBtn({ children, active, disabled, onClick }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px", border: `1px solid ${active ? "#2563EB" : "#CBD5E1"}`,
        borderRadius: "6px", backgroundColor: active ? "#2563EB" : "white",
        color: active ? "white" : "#334155", cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "13px", fontWeight: active ? 600 : 500, opacity: disabled ? 0.4 : 1, minWidth: "34px",
      }}
    >
      {children}
    </button>
  );
}
