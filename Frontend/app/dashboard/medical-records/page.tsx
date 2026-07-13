"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Upload,
  Filter,
  FileText,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FilePlus2,
  Edit,
  X,
  Stethoscope,
  Activity,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/app/dashboard/context/AuthContext";
import { api } from "@/lib/proxy";

// ── Types ────────────────────────────────────────────────────────────────────

type RecordStatus = "VERIFIED" | "REVIEW" | "ARCHIVED";
type RecordFormat = "PDF" | "DICOM" | "JPG";
type TabKey = "All Inventory" | "Prescriptions" | "Lab Reports" | "Diagnostic Scans" | "Immunization";

interface MedicalRecord {
  _id: string;
  recordName?: string;
  diagnosis: string;
  prescription: string;
  dept?: string;
  doctorId?: {
    _id: string;
    fullName: string;
    email: string;
  } | any;
  attachments?: string[];
  date: string;
  format?: RecordFormat;
  status?: RecordStatus;
  createdAt?: string;
}

const TAB_FILTERS: Record<TabKey, (r: MedicalRecord) => boolean> = {
  "All Inventory":    () => true,
  "Prescriptions":    (r) => {
    const dept = r.dept || "Internal Med";
    const name = r.recordName || r.diagnosis || "";
    return dept === "Internal Med" || name.toLowerCase().includes("prescription");
  },
  "Lab Reports":      (r) => (r.dept || "") === "Laboratory",
  "Diagnostic Scans": (r) => {
    const dept = r.dept || "";
    const format = r.format || "PDF";
    return dept === "Radiology" || format === "DICOM" || format === "JPG";
  },
  "Immunization":     (r) => (r.dept || "") === "Immunization",
};

const PAGE_SIZE = 9;

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RecordStatus }) {
  const map: Record<RecordStatus, string> = {
    VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-500/5",
    REVIEW:   "bg-amber-50  text-amber-700  border border-amber-200 shadow-sm shadow-amber-500/5",
    ARCHIVED: "bg-gray-100  text-gray-500   border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${map[status] || map.VERIFIED}`}>
      {status === "VERIFIED" && <ShieldCheck size={11} strokeWidth={3} />}
      {status === "REVIEW" && <AlertCircle size={11} strokeWidth={3} />}
      {status || "VERIFIED"}
    </span>
  );
}

function FormatIcon({ format }: { format: RecordFormat }) {
  const color = format === "PDF" ? "text-red-600 bg-red-50 border border-red-100" : format === "DICOM" ? "text-blue-600 bg-blue-50 border border-blue-100" : "text-teal-600 bg-teal-50 border border-teal-100";
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-[10px] font-black tracking-wider shadow-sm ${color}`}>
      {format || "PDF"}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("All Inventory");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Form States
  const [recordName, setRecordName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [dept, setDept] = useState("Internal Med");
  const [status, setStatus] = useState<RecordStatus>("VERIFIED");
  const [file, setFile] = useState<File | null>(null);

  // Ref for File Upload inputs
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const profilePicSrc = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop";

  // Fetch records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get("/v1/medical-records");
      setRecords(res.data || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch medical records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter
  const filtered = records
    .filter(TAB_FILTERS[activeTab])
    .filter((r) => {
      const name = r.recordName || r.diagnosis || "";
      const docName = typeof r.doctorId === 'object' && r.doctorId ? r.doctorId.fullName : "Self Uploaded";
      const department = r.dept || "";
      return (
        search === "" ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        docName.toLowerCase().includes(search.toLowerCase()) ||
        department.toLowerCase().includes(search.toLowerCase())
      );
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab: TabKey) => { setActiveTab(tab); setPage(1); };
  const handleSearch    = (v: string)  => { setSearch(v);       setPage(1); };

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("recordName", recordName || diagnosis);
      formData.append("diagnosis", diagnosis);
      formData.append("prescription", prescription);
      formData.append("dept", dept);
      formData.append("status", status);
      if (file) {
        formData.append("file", file);
      }

      await api.post("/v1/medical-records", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowCreateModal(false);
      resetForm();
      fetchRecords();
    } catch (err: any) {
      console.error(err);
      alert("Failed to create medical record.");
    }
  };

  // Edit Initiator
  const openEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setRecordName(record.recordName || record.diagnosis || "");
    setDiagnosis(record.diagnosis || "");
    setPrescription(record.prescription || "");
    setDept(record.dept || "Internal Med");
    setStatus(record.status || "VERIFIED");
    setFile(null);
    setShowEditModal(true);
  };

  // Edit Submission
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      const formData = new FormData();
      formData.append("recordName", recordName);
      formData.append("diagnosis", diagnosis);
      formData.append("prescription", prescription);
      formData.append("dept", dept);
      formData.append("status", status);
      if (file) {
        formData.append("file", file);
      }

      await api.put(`/v1/medical-records/${selectedRecord._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowEditModal(false);
      resetForm();
      fetchRecords();
    } catch (err: any) {
      console.error(err);
      alert("Failed to update medical record.");
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this medical record?")) return;
    try {
      await api.delete(`/v1/medical-records/${id}`);
      fetchRecords();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete medical record.");
    }
  };

  const resetForm = () => {
    setRecordName("");
    setDiagnosis("");
    setPrescription("");
    setDept("Internal Med");
    setStatus("VERIFIED");
    setFile(null);
    setSelectedRecord(null);
  };

  // Dynamic Statistics
  const totalVolume = records.length;
  const diagnosticsCount = records.filter(r => (r.dept || "") === "Radiology" || r.format === "DICOM" || r.format === "JPG").length;
  const prescriptionsCount = records.filter(r => (r.dept || "") === "Internal Med" || (r.recordName || r.diagnosis || "").toLowerCase().includes("prescription")).length;
  const imagingCount = records.filter(r => r.format === "DICOM" || r.format === "JPG").length;
  const immunizationCount = records.filter(r => (r.dept || "") === "Immunization").length;

  const stats = [
    { label: "Total Volume",    value: totalVolume,       delta: "Live",  color: "text-[#0052cc]", bg: "bg-blue-50"   },
    { label: "Diagnostics",     value: diagnosticsCount,  delta: "Sync",  color: "text-gray-700",  bg: "bg-gray-100"  },
    { label: "Prescriptions",   value: prescriptionsCount,delta: "Sync",  color: "text-gray-700",  bg: "bg-gray-100"  },
    { label: "Imaging Assets",  value: imagingCount,      delta: "Sync",  color: "text-teal-700",  bg: "bg-teal-50"   },
    { label: "Immunizations",   value: immunizationCount, delta: "Sync",  color: "text-amber-700", bg: "bg-amber-50"  },
  ];

  const tabs: TabKey[] = ["All Inventory", "Prescriptions", "Lab Reports", "Diagnostic Scans", "Immunization"];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
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
          <button className="relative p-2 bg-white border border-gray-100 rounded-full hover:bg-gray-50 text-gray-600 transition-colors shadow-sm">
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-full pl-1 pr-4 py-1 shadow-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-100 shrink-0">
              <img src={profilePicSrc} alt="Profile" className="object-cover w-full h-full" />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-tight">{user?.fullName ?? "Sarah Jenkins"}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Patient</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Body ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-0 overflow-hidden">

        {/* ── Left: Main content ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto px-6 md:px-8 py-6 space-y-6">

          {/* Breadcrumb + Title */}
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
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 duration-200"
                >
                  <Upload size={14} strokeWidth={2.5} />
                  Upload New Record
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <FileText size={15} className={s.color} />
                  </div>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                    {s.delta}
                  </span>
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#0052cc] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Head */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50/60 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Record Name / Diagnosis</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-2">Doctor</div>
              <div className="col-span-1">Format</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-xs font-bold">Loading records...</p>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FilePlus2 size={32} className="mb-2 text-gray-300" />
                <p className="text-sm font-bold">No records found</p>
                <p className="text-xs mt-1">Try adjusting your search or tab filter</p>
              </div>
            ) : (
              paginated.map((record, i) => {
                const docName = typeof record.doctorId === 'object' && record.doctorId ? record.doctorId.fullName : "Self Uploaded";
                const displayDate = new Date(record.date || record.createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });
                const directAttachmentUrl = record.attachments && record.attachments.length > 0 
                  ? `http://localhost:5000${record.attachments[0]}`
                  : undefined;
                return (
                  <div
                    key={record._id}
                    className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${
                      i === paginated.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    {/* Date */}
                    <div className="col-span-2 text-xs text-gray-500 font-semibold">{displayDate}</div>

                    {/* Record Name */}
                    <div className="col-span-3 flex flex-col justify-center">
                      <span className="font-bold text-gray-800 text-xs leading-tight">
                        {record.recordName || record.diagnosis}
                      </span>
                    </div>

                    {/* Dept */}
                    <div className="col-span-2 text-xs text-gray-500 font-semibold">{record.dept || "Internal Med"}</div>

                    {/* Doctor */}
                    <div className="col-span-2 text-xs text-gray-600 font-semibold">{docName}</div>

                    {/* Format */}
                    <div className="col-span-1">
                      <FormatIcon format={record.format || "PDF"} />
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <StatusBadge status={record.status || "VERIFIED"} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedRecord(record); setShowViewModal(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Record"
                      >
                        <Eye size={13} strokeWidth={2.5} />
                      </button>
                      {directAttachmentUrl && (
                        <a
                          href={directAttachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Download File"
                        >
                          <Download size={13} strokeWidth={2.5} />
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(record)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Record"
                      >
                        <Edit size={13} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
              <p className="text-[10px] font-bold text-gray-400">
                Entries {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
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
                    className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${
                      p === page
                        ? "bg-[#0052cc] text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-100"
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
          </div>
        </div>

        {/* ── Right Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden xl:flex flex-col w-[280px] shrink-0 border-l border-gray-200/60 bg-white overflow-auto px-5 py-6 space-y-6">

          {/* Integrity Portal */}
          <div className="rounded-2xl border border-[#0052cc]/20 bg-[#0052cc]/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#0052cc]" strokeWidth={2.5} />
              <p className="text-xs font-black text-[#0052cc]">Integrity Portal</p>
            </div>
            <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
              AES-256 encryption active for all PHI data transfers
            </p>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Security Index</p>
                <p className="text-[10px] font-black text-emerald-600">98.2%</p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98.2%" }} />
              </div>
            </div>
          </div>

          {/* System Info */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recently Added Files</p>
            <div className="space-y-2">
              {records.slice(0, 2).map((f) => (
                <div key={f._id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{f.recordName || f.diagnosis}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{f.dept || "EHR"}</p>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <p className="text-xs text-gray-400 italic">No files uploaded yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── CREATE RECORD MODAL ────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white/95 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Upload New Medical Record
              </h2>
              <button 
                onClick={() => { setShowCreateModal(false); resetForm(); }} 
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-bold text-gray-700">
              
              {/* Record Name */}
              <div className="space-y-1">
                <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Record Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FileText size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Blood Panel, Diagnostic scan, Clinic Prescription"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-gray-800 transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Department & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Stethoscope size={14} />
                    </div>
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-black text-gray-800 transition-all duration-200 shadow-sm appearance-none"
                    >
                      <option value="Internal Med">Internal Med</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Immunization">Immunization</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Dental">Dental</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Status</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Activity size={14} />
                    </div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as RecordStatus)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-black text-gray-800 transition-all duration-200 shadow-sm appearance-none"
                    >
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diagnosis Summary */}
              <div className="space-y-1">
                <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Diagnosis Summary</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Key observations, diagnostic findings, or reason..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-gray-800 transition-all duration-200 shadow-sm resize-none"
                />
              </div>

              {/* Prescription Details */}
              <div className="space-y-1">
                <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Prescribed Action / Drugs</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Prescribed medicine details, dosage guidelines, doctor recommendations..."
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-gray-800 transition-all duration-200 shadow-sm resize-none"
                />
              </div>

              {/* Drag & Drop Upload Zone */}
              <div className="space-y-1.5">
                <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Attach Document</label>
                <div 
                  onClick={() => createFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-250 shadow-sm bg-gray-50/30 group"
                >
                  <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:animate-bounce duration-300" />
                  <span className="text-xs text-gray-700 font-bold group-hover:text-blue-600 transition-colors">
                    {file ? file.name : "Click to upload a document"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "PDF, DICOM, JPG, PNG files up to 10MB"}
                  </span>
                  <input
                    type="file"
                    ref={createFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xs font-black text-gray-600 shadow-sm hover:shadow active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all text-xs font-black shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                >
                  Create & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT RECORD MODAL ──────────────────────────────────────────────── */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white/95 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Edit Medical Record
              </h2>
              <button 
                onClick={() => { setShowEditModal(false); resetForm(); }} 
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 text-xs font-bold text-gray-700">
              
              {/* Record Name */}
              <div className="space-y-1">
                <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Record Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FileText size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Blood Panel"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-gray-800 transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Department & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Stethoscope size={14} />
                    </div>
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-black text-gray-800 transition-all duration-200 shadow-sm appearance-none"
                    >
                      <option value="Internal Med">Internal Med</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Immunization">Immunization</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Dental">Dental</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Status</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Activity size={14} />
                    </div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as RecordStatus)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-black text-gray-800 transition-all duration-200 shadow-sm appearance-none"
                    >
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="space-y-1">
                <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Diagnosis Summary</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Clinical observations..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-gray-800 transition-all duration-200 shadow-sm resize-none"
                />
              </div>

              {/* Prescription Details */}
              <div className="space-y-1">
                <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Prescribed Action / Drugs</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Dosage, medicine details..."
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-gray-800 transition-all duration-200 shadow-sm resize-none"
                />
              </div>

              {/* Replace Document Upload Zone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-500 uppercase tracking-wider text-[10px]">Replace Document (Optional)</label>
                  {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                    <span className="text-[9px] text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded font-black">HAS CURRENT DOCUMENT</span>
                  )}
                </div>
                <div 
                  onClick={() => editFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-amber-500 hover:bg-amber-50/5 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-250 shadow-sm bg-gray-50/30 group"
                >
                  <Upload className="w-8 h-8 text-amber-500 mb-2 group-hover:animate-bounce duration-300" />
                  <span className="text-xs text-gray-700 font-bold group-hover:text-amber-600 transition-colors">
                    {file ? file.name : "Click to upload replacement document"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "PDF, DICOM, JPG, PNG files up to 10MB"}
                  </span>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xs font-black text-gray-600 shadow-sm hover:shadow active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all text-xs font-black shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW RECORD MODAL ──────────────────────────────────────────────── */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white/95 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FileCheck className="text-blue-500 w-5 h-5" />
                Medical Record Summary
              </h2>
              <button 
                onClick={() => { setShowViewModal(false); resetForm(); }} 
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-gray-700">
              
              {/* Record Info Blocks */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Record Title</p>
                  <p className="text-xs font-black text-gray-800 mt-1 leading-tight">
                    {selectedRecord.recordName || selectedRecord.diagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Department</p>
                  <p className="text-xs font-black text-gray-800 mt-1">{selectedRecord.dept || "Internal Med"}</p>
                </div>
                <div className="pt-2 border-t border-gray-200/50">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Attending Source</p>
                  <p className="text-xs font-black text-blue-600 mt-1">
                    {typeof selectedRecord.doctorId === 'object' && selectedRecord.doctorId
                      ? selectedRecord.doctorId.fullName
                      : "Self Uploaded"}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-200/50">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Verify Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedRecord.status || "VERIFIED"} />
                  </div>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="space-y-1">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Diagnosis & Observations</p>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-150 font-medium leading-relaxed shadow-sm">
                  {selectedRecord.diagnosis}
                </p>
              </div>

              {/* Prescription Details */}
              <div className="space-y-1">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Prescribed Action & Recommendations</p>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-150 font-medium leading-relaxed shadow-sm">
                  {selectedRecord.prescription}
                </p>
              </div>

              {/* Attachment Download Box */}
              {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-800">EHR Attached Asset</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        Format: {selectedRecord.format || "PDF"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:5000${selectedRecord.attachments[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-extrabold text-[11px] shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Download size={13} strokeWidth={2.5} />
                    Open file
                  </a>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => { setShowViewModal(false); resetForm(); }}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-black text-center text-xs shadow-sm hover:shadow cursor-pointer active:scale-98"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}