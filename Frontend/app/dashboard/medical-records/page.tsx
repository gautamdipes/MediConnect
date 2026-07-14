"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Upload, Filter, FileText, Eye, Download,
  Trash2, ChevronLeft, ChevronRight, ShieldCheck, FilePlus2,
  Plus, X, Pencil, Loader2, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/app/dashboard/context/AuthContext";
import { api } from "@/lib/proxy";
import { DashboardTopBar } from "../components/DashboardTopBar";

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
  file: File | null;
}

const EMPTY_FORM: FormState = {
  recordName: "", dept: "Laboratory", doctor: "",
  format: "PDF", status: "REVIEW", notes: "", fileUrl: "", file: null,
};

const DEPTS = ["Internal Med", "Radiology", "Laboratory", "Immunization", "Cardiology", "Surgery", "Dental", "Other"];
const FORMATS: RecordFormat[] = ["PDF", "DICOM", "JPG", "PNG", "OTHER"];
const STATUSES: RecordStatus[] = ["VERIFIED", "REVIEW", "ARCHIVED"];
const PAGE_SIZE = 9;

function resolveAttachmentUrl(attachment?: string): string | undefined {
  if (!attachment) return undefined;
  if (attachment.startsWith("http")) return attachment;
  return attachment.startsWith("/") ? attachment : `/${attachment}`;
}

function mapRecord(raw: Record<string, unknown>): MedicalRecord {
  const doctorId = raw.doctorId as { fullName?: string } | undefined;
  const attachments = raw.attachments as string[] | undefined;
  const attachment = attachments?.[0];
  const fileUrl = resolveAttachmentUrl(attachment) ?? resolveAttachmentUrl(raw.fileUrl as string | undefined);

  return {
    _id: String(raw._id),
    recordName: String(raw.recordName || raw.diagnosis || "Medical Record"),
    dept: String(raw.dept || "Internal Med"),
    doctor: String(doctorId?.fullName || raw.doctor || "N/A"),
    format: (raw.format as RecordFormat) || "PDF",
    status: (raw.status as RecordStatus) || "REVIEW",
    notes: String(raw.prescription || raw.notes || ""),
    fileUrl,
    createdAt: String(raw.createdAt || raw.date || new Date().toISOString()),
  };
}

function inferFormatFromFile(file: File): RecordFormat {
  const ext = file.name.split(".").pop()?.toUpperCase();
  if (ext === "PDF") return "PDF";
  if (ext === "PNG") return "PNG";
  if (ext === "JPG" || ext === "JPEG") return "JPG";
  if (ext === "DCM" || ext === "DICOM") return "DICOM";
  if (file.type.startsWith("image/")) return "JPG";
  return "OTHER";
}

function isImageAttachment(format: RecordFormat, url?: string): boolean {
  if (format === "JPG" || format === "PNG") return true;
  return Boolean(url && /\.(jpe?g|png|gif|webp)$/i.test(url));
}

function isPdfAttachment(format: RecordFormat, url?: string): boolean {
  if (format === "PDF") return true;
  return Boolean(url && /\.pdf$/i.test(url));
}

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
    file: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (form.file) {
      const url = URL.createObjectURL(form.file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [form.file]);

  const set = (k: keyof FormState, v: string | File | null) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setForm((f) => ({
      ...f,
      file,
      format: inferFormatFromFile(file),
    }));
  };

  const isView = mode === "view";
  const displayUrl = previewUrl || form.fileUrl || null;
  const showImage = displayUrl && (previewUrl ? form.file?.type.startsWith("image/") : isImageAttachment(form.format, form.fileUrl));
  const showPdf = displayUrl && !showImage && (previewUrl ? form.file?.type === "application/pdf" : isPdfAttachment(form.format, form.fileUrl));

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

          {/* Attachment */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5">
              {isView ? "Attachment" : "Upload File (image or PDF)"}
            </label>

            {isView ? (
              displayUrl ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  {showImage && (
                    <img
                      src={displayUrl}
                      alt={form.recordName}
                      className="w-full max-h-72 object-contain bg-white"
                    />
                  )}
                  {showPdf && (
                    <iframe
                      src={displayUrl}
                      title={form.recordName}
                      className="w-full h-72 bg-white"
                    />
                  )}
                  {!showImage && !showPdf && (
                    <div className="p-4 flex items-center gap-3">
                      <FileText size={20} className="text-gray-400 shrink-0" />
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#0052cc] hover:underline truncate"
                      >
                        Open attached file
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-medium px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                  No file attached
                </p>
              )
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#0052cc]/40 cursor-pointer transition-colors">
                  <Upload size={22} className="text-[#0052cc]" />
                  <span className="text-xs font-bold text-gray-600">
                    {form.file ? form.file.name : "Click to choose an image or PDF"}
                  </span>
                  <span className="text-[10px] text-gray-400">JPG, PNG, or PDF</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {(previewUrl || form.fileUrl) && (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    {previewUrl && form.file?.type.startsWith("image/") && (
                      <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain bg-white" />
                    )}
                    {previewUrl && form.file?.type === "application/pdf" && (
                      <div className="p-4 flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <FileText size={16} className="text-red-500" />
                        PDF ready to upload: {form.file.name}
                      </div>
                    )}
                    {!previewUrl && form.fileUrl && isImageAttachment(form.format, form.fileUrl) && (
                      <img src={form.fileUrl} alt="Current file" className="w-full max-h-48 object-contain bg-white" />
                    )}
                    {!previewUrl && form.fileUrl && !isImageAttachment(form.format, form.fileUrl) && (
                      <div className="p-4 flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <FileText size={16} className="text-red-500" />
                        Current file attached
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
  const { isInitialized } = useAuth();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("All Inventory");
  const [page, setPage] = useState(1);

  // Modal state
  const [modal, setModal] = useState<{
    mode: "create" | "edit" | "view";
    record: Partial<MedicalRecord>;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/v1/users/medical-records");
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.records ?? data?.data ?? [];
      setRecords(
        list.map((item: Record<string, unknown>) => {
          try {
            return mapRecord(item);
          } catch {
            return null;
          }
        }).filter(Boolean) as MedicalRecord[]
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 401) {
        setError("Session expired. Please sign in again.");
      } else {
        setError(msg || "Failed to fetch records");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    fetchRecords();
  }, [isInitialized, fetchRecords]);

  const handleSave = async (form: FormState) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("recordName", form.recordName);
      formData.append("dept", form.dept);
      formData.append("format", form.format);
      formData.append("status", form.status);
      formData.append("diagnosis", form.recordName);
      formData.append("prescription", form.notes || "—");
      if (form.file) {
        formData.append("file", form.file);
      }

      if (modal?.mode === "edit" && modal.record._id) {
        await api.put(`/v1/medical-records/${modal.record._id}`, formData);
      } else {
        await api.post("/v1/medical-records", formData);
      }
      await fetchRecords();
      setModal(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/v1/medical-records/${deleteTarget._id}`);
      await fetchRecords();
      setDeleteTarget(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || "Delete failed");
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
    <div className="flex min-h-screen flex-col">
      <DashboardTopBar
        placeholder="Search EHR, physician, or facility..."
        searchValue={search}
        onSearchChange={handleSearch}
      />

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 py-6 md:px-8 space-y-6">

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