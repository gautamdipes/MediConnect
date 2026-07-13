"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Bell, Upload, Filter, FileText, Eye, Download,
  Trash2, ChevronLeft, ChevronRight, ShieldCheck, FilePlus2,
  Plus, X, Pencil, Loader2, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/app/dashboard/context/AuthContext";
import { UserNotificationsDropdown } from "../components/UserNotificationsDropdown";

// ── Types ─────────────────────────────────────────────────────────────────────

type RecordStatus = "VERIFIED" | "REVIEW" | "ARCHIVED";
type RecordFormat = "PDF" | "DICOM" | "JPG" | "PNG" | "OTHER";
type TabKey = "All Inventory" | "Prescriptions" | "Lab Reports" | "Diagnostic Scans" | "Immunization";

interface MedicalRecord {
  _id: string;
  recordName: string;
  dept: string;
  doctor: string;
  format: RecordFormat;
  status: RecordStatus;
  notes?: string;
  fileUrl?: string;
  createdAt: string;
}

interface FormState {
  recordName: string;
  dept: string;
  doctor: string;
  format: RecordFormat;
  status: RecordStatus;
  notes: string;
  fileUrl: string;
}

const EMPTY_FORM: FormState = {
  recordName: "", dept: "Laboratory", doctor: "",
  format: "PDF", status: "REVIEW", notes: "", fileUrl: "",
};

const DEPTS = ["Internal Med", "Radiology", "Laboratory", "Immunization", "Cardiology", "Surgery", "Dental", "Other"];
const FORMATS: RecordFormat[] = ["PDF", "DICOM", "JPG", "PNG", "OTHER"];
const STATUSES: RecordStatus[] = ["VERIFIED", "REVIEW", "ARCHIVED"];
const PAGE_SIZE = 9;
const BASE = "http://localhost:5000/api/medical-records";

const TAB_FILTERS: Record<TabKey, (r: MedicalRecord) => boolean> = {
  "All Inventory": () => true,
  "Prescriptions": (r) => r.dept === "Internal Med",
  "Lab Reports": (r) => r.dept === "Laboratory",
  "Diagnostic Scans": (r) => r.dept === "Radiology" || r.format === "DICOM" || r.format === "JPG",
  "Immunization": (r) => r.dept === "Immunization",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RecordStatus }) {
  const map: Record<RecordStatus, string> = {
    VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    REVIEW: "bg-amber-50  text-amber-700  border border-amber-200",
    ARCHIVED: "bg-gray-100  text-gray-500   border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${map[status]}`}>
      {status === "VERIFIED" && <ShieldCheck size={10} strokeWidth={2.5} />}
      {status}
    </span>
  );
}

function FormatIcon({ format }: { format: RecordFormat }) {
  const color =
    format === "PDF" ? "text-red-500 bg-red-50" :
      format === "DICOM" ? "text-blue-500 bg-blue-50" :
        format === "JPG" ? "text-teal-500 bg-teal-50" :
          format === "PNG" ? "text-purple-500 bg-purple-50" :
            "text-gray-500 bg-gray-100";
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-black ${color}`}>
      {format}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function RecordModal({
  mode, initial, onClose, onSave, saving,
}: {
  mode: "create" | "edit" | "view";
  initial: Partial<MedicalRecord>;
  onClose: () => void;
  onSave: (data: FormState) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    recordName: initial.recordName ?? "",
    dept: initial.dept ?? "Laboratory",
    doctor: initial.doctor ?? "",
    format: initial.format ?? "PDF",
    status: initial.status ?? "REVIEW",
    notes: initial.notes ?? "",
    fileUrl: initial.fileUrl ?? "",
  });

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isView = mode === "view";

  const fieldCls = `w-full h-10 px-3 border rounded-xl text-sm outline-none transition-all font-medium
    ${isView ? "bg-gray-50 text-gray-600 border-gray-100 cursor-default" : "bg-white border-gray-200 focus:border-[#0052cc]"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900">
            {mode === "create" ? "Add New Record" : mode === "edit" ? "Edit Record" : "View Record"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Record Name */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5">Record Name *</label>
            <input
              className={fieldCls}
              value={form.recordName}
              readOnly={isView}
              onChange={(e) => set("recordName", e.target.value)}
              placeholder="e.g. Blood Lipid Profile"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dept */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Department *</label>
              {isView ? (
                <input className={fieldCls} value={form.dept} readOnly />
              ) : (
                <select className={fieldCls} value={form.dept} onChange={(e) => set("dept", e.target.value)}>
                  {DEPTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              )}
            </div>

            {/* Format */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Format</label>
              {isView ? (
                <input className={fieldCls} value={form.format} readOnly />
              ) : (
                <select className={fieldCls} value={form.format} onChange={(e) => set("format", e.target.value as RecordFormat)}>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Doctor */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Doctor *</label>
              <input
                className={fieldCls}
                value={form.doctor}
                readOnly={isView}
                onChange={(e) => set("doctor", e.target.value)}
                placeholder="Dr. Name"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Status</label>
              {isView ? (
                <input className={fieldCls} value={form.status} readOnly />
              ) : (
                <select className={fieldCls} value={form.status} onChange={(e) => set("status", e.target.value as RecordStatus)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* File URL */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5">File URL (optional)</label>
            <input
              className={fieldCls}
              value={form.fileUrl}
              readOnly={isView}
              onChange={(e) => set("fileUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5">Notes</label>
            <textarea
              className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition-all font-medium resize-none h-20
                ${isView ? "bg-gray-50 text-gray-600 border-gray-100 cursor-default" : "bg-white border-gray-200 focus:border-[#0052cc]"}`}
              value={form.notes}
              readOnly={isView}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Footer */}
        {!isView && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={saving || !form.recordName || !form.doctor}
              className="px-5 py-2 rounded-xl bg-[#0052cc] text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {mode === "create" ? "Create Record" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteModal({ name, onClose, onConfirm, deleting }: {
  name: string; onClose: () => void; onConfirm: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Delete Record</p>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 font-medium">
          Are you sure you want to delete <span className="font-bold text-gray-900">"{name}"</span>?
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {deleting && <Loader2 size={12} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MedicalRecordsPage() {
  const { user, token } = useAuth();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("All Inventory");
  const [page, setPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = React.useRef<HTMLButtonElement>(null);

  // Modal state
  const [modal, setModal] = useState<{
    mode: "create" | "edit" | "view";
    record: Partial<MedicalRecord>;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const profilePicSrc = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop";

  // ── API helpers ─────────────────────────────────────────────────────────────

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(BASE, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSave = async (form: FormState) => {
    setSaving(true);
    try {
      const isEdit = modal?.mode === "edit";
      const url = isEdit ? `${BASE}/${modal?.record._id}` : BASE;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed");
      await fetchRecords();
      setModal(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE}/${deleteTarget._id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("Delete failed");
      await fetchRecords();
      setDeleteTarget(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter + paginate ───────────────────────────────────────────────────────

  const filtered = records
    .filter(TAB_FILTERS[activeTab])
    .filter((r) =>
      search === "" ||
      r.recordName.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab: TabKey) => { setActiveTab(tab); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const tabs: TabKey[] = ["All Inventory", "Prescriptions", "Lab Reports", "Diagnostic Scans", "Immunization"];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="h-20 bg-[#f3f4f6] px-6 md:px-8 flex items-center justify-between shrink-0 border-b border-gray-200/60">
        <div className="relative w-80 max-w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search EHR, physician, or facility..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200/80 rounded-full text-xs font-medium outline-none text-gray-700 shadow-sm placeholder-gray-400 focus:border-gray-300 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 border rounded-full transition-colors shadow-sm ${showNotifications ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-white border-gray-100 hover:bg-gray-50 text-gray-600"}`}
            >
              <Bell size={18} strokeWidth={2.5} />
            </button>
            <UserNotificationsDropdown
              open={showNotifications}
              onClose={() => setShowNotifications(false)}
              anchorRef={bellRef}
            />
          </div>
          <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-full pl-1 pr-4 py-1 shadow-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-100 shrink-0">
              <img src={profilePicSrc} alt="Profile" className="object-cover w-full h-full" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-tight">{user?.fullName ?? "User"}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Patient</p>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 md:px-8 py-6 space-y-6">

        {/* Title row */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Clinical Assets &rsaquo; EHR Central
          </p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Medical Records</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Securely access and manage your personal health history.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <Filter size={13} strokeWidth={2.5} />
                Advanced Filters
              </button>
              <button
                onClick={() => setModal({ mode: "create", record: {} })}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0052cc] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add New Record
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">
            <AlertTriangle size={14} />
            {error}
            <button onClick={() => setError("")} className="ml-auto"><X size={13} /></button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Total Records", value: records.length, color: "text-[#0052cc]", bg: "bg-blue-50" },
            { label: "Lab Reports", value: records.filter(r => r.dept === "Laboratory").length, color: "text-gray-700", bg: "bg-gray-100" },
            { label: "Verified", value: records.filter(r => r.status === "VERIFIED").length, color: "text-teal-700", bg: "bg-teal-50" },
            { label: "Under Review", value: records.filter(r => r.status === "REVIEW").length, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Archived", value: records.filter(r => r.status === "ARCHIVED").length, color: "text-gray-500", bg: "bg-gray-100" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <FileText size={15} className={s.color} />
              </div>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? "bg-[#0052cc] text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50/60 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <div className="col-span-3">Record Name</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Doctor</div>
            <div className="col-span-2">Date Added</div>
            <div className="col-span-1">Format</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 size={20} className="animate-spin text-[#0052cc]" />
              <span className="text-sm font-semibold">Loading records...</span>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FilePlus2 size={32} className="mb-2 text-gray-300" />
              <p className="text-sm font-bold">No records found</p>
              <p className="text-xs mt-1">
                {search ? "Try adjusting your search" : "Click \"Add New Record\" to get started"}
              </p>
            </div>
          ) : (
            paginated.map((record, i) => (
              <div
                key={record._id}
                className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${i === paginated.length - 1 ? "border-b-0" : ""
                  }`}
              >
                <div className="col-span-3 font-bold text-gray-800 text-xs leading-tight truncate pr-2">
                  {record.recordName}
                </div>
                <div className="col-span-2 text-xs text-gray-500 font-semibold truncate">{record.dept}</div>
                <div className="col-span-2 text-xs text-gray-600 font-semibold truncate">{record.doctor}</div>
                <div className="col-span-2 text-[10px] text-gray-400 font-semibold">{formatDate(record.createdAt)}</div>
                <div className="col-span-1"><FormatIcon format={record.format} /></div>
                <div className="col-span-1"><StatusBadge status={record.status} /></div>
                <div className="col-span-1 flex items-center justify-end gap-0.5">
                  {/* View */}
                  <button
                    onClick={() => setModal({ mode: "view", record })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View"
                  >
                    <Eye size={13} strokeWidth={2.5} />
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => setModal({ mode: "edit", record })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={13} strokeWidth={2.5} />
                  </button>
                  {/* Download */}
                  {record.fileUrl && (
                    <a
                      href={record.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      title="Download"
                    >
                      <Download size={13} strokeWidth={2.5} />
                    </a>
                  )}
                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(record)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
              <p className="text-[10px] font-bold text-gray-400">
                Entries {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${p === page ? "bg-[#0052cc] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <RecordModal
          mode={modal.mode}
          initial={modal.record}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.recordName}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}