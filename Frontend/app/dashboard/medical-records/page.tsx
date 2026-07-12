"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/app/dashboard/context/AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────

type RecordStatus = "VERIFIED" | "REVIEW" | "ARCHIVED";
type RecordFormat = "PDF" | "DICOM" | "JPG";
type TabKey = "All Inventory" | "Prescriptions" | "Lab Reports" | "Diagnostic Scans" | "Immunization";

interface MedicalRecord {
  id: string;
  recordName: string;
  dept: string;
  doctor: string;
  lastModified: string;
  format: RecordFormat;
  status: RecordStatus;
  isNew?: boolean;
  isUpdated?: boolean;
}

// ── Static Data ──────────────────────────────────────────────────────────────

const ALL_RECORDS: MedicalRecord[] = [
  { id: "MR-94234", recordName: "Annual Physical Summary",     dept: "Internal Med",  doctor: "Dr. Alan Grant",    lastModified: "Oct 24, 2023", format: "PDF",   status: "VERIFIED" },
  { id: "MR-89112", recordName: "Chest X-Ray Imaging",        dept: "Radiology",     doctor: "Dr. Sarah Miller",  lastModified: "Oct 18, 2023", format: "DICOM", status: "REVIEW"   },
  { id: "MR-57441", recordName: "Blood Lipid Profile",        dept: "Laboratory",    doctor: "Dr. Electronic Erny",lastModified: "Oct 12, 2023", format: "PDF",   status: "VERIFIED" },
  { id: "MR-86560", recordName: "Influenza Immunization",     dept: "Immunization",  doctor: "Dr. Clinical Staff",lastModified: "Sep 28, 2023", format: "PDF",   status: "VERIFIED" },
  { id: "MR-85221", recordName: "Metabolic Panel",            dept: "Laboratory",    doctor: "Dr. Robert Chen",   lastModified: "Sep 25, 2023", format: "PDF",   status: "REVIEW",   isNew: true  },
  { id: "MR-64110", recordName: "ECG Report",                 dept: "Cardiology",    doctor: "Dr. Stevens",       lastModified: "Sep 20, 2023", format: "PDF",   status: "VERIFIED" },
  { id: "MR-41009", recordName: "Surgical Pre-Op Notes",      dept: "Surgery",       doctor: "Dr. Sarah Miller",  lastModified: "Sep 13, 2023", format: "PDF",   status: "REVIEW"   },
  { id: "MR-21908", recordName: "Pathology Profile",          dept: "Laboratory",    doctor: "Ref Lab",            lastModified: "Sep 10, 2023", format: "PDF",   status: "VERIFIED", isUpdated: true },
  { id: "MR-11203", recordName: "MRI Lumbar Spine",           dept: "Radiology",     doctor: "Dr. Alan Grant",    lastModified: "Aug 30, 2023", format: "DICOM", status: "ARCHIVED" },
  { id: "MR-09987", recordName: "COVID-19 Vaccination",       dept: "Immunization",  doctor: "Dr. Clinical Staff",lastModified: "Aug 12, 2023", format: "PDF",   status: "VERIFIED" },
  { id: "MR-08801", recordName: "Thyroid Function Test",      dept: "Laboratory",    doctor: "Dr. Robert Chen",   lastModified: "Jul 28, 2023", format: "PDF",   status: "VERIFIED" },
  { id: "MR-07654", recordName: "Dental X-Ray Panoramic",     dept: "Dental",        doctor: "Dr. Stevens",       lastModified: "Jul 10, 2023", format: "JPG",   status: "ARCHIVED" },
];

const TAB_FILTERS: Record<TabKey, (r: MedicalRecord) => boolean> = {
  "All Inventory":    () => true,
  "Prescriptions":    (r) => r.dept === "Internal Med" || r.recordName.toLowerCase().includes("prescription"),
  "Lab Reports":      (r) => r.dept === "Laboratory",
  "Diagnostic Scans": (r) => r.dept === "Radiology" || r.format === "DICOM" || r.format === "JPG",
  "Immunization":     (r) => r.dept === "Immunization",
};

const STAT_CARDS = [
  { label: "Total Volume",    value: "1,284", delta: "+13%",  deltaUp: true,  color: "text-[#0052cc]", bg: "bg-blue-50"   },
  { label: "Diagnostics",     value: "452",   delta: "-9%",   deltaUp: false, color: "text-gray-700",  bg: "bg-gray-100"  },
  { label: "Prescriptions",   value: "318",   delta: "Stable",deltaUp: null,  color: "text-gray-700",  bg: "bg-gray-100"  },
  { label: "Imaging Assets",  value: "195",   delta: "+2 New",deltaUp: true,  color: "text-teal-700",  bg: "bg-teal-50"   },
  { label: "Immunizations",   value: "24",    delta: "Updated",deltaUp: null, color: "text-amber-700", bg: "bg-amber-50"  },
];

const RECENTLY_ADDED = [
  { name: "Lab_Results.pdf",  size: "3.4 MB",  time: "2h ago" },
  { name: "MRI_Lumbar.dcm",   size: "18.8 MB", time: "Yesterday" },
];

const HEALTH_HISTORY = [
  { date: "OCT 20", title: "Cardiology Consult", doctor: "Dr. Stevens" },
  { date: "SEP 15", title: "Pathology Screening", doctor: "Ref Lab"     },
];

const PAGE_SIZE = 9;

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RecordStatus }) {
  const map: Record<RecordStatus, string> = {
    VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    REVIEW:   "bg-amber-50  text-amber-700  border border-amber-200",
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
  const color = format === "PDF" ? "text-red-500 bg-red-50" : format === "DICOM" ? "text-blue-500 bg-blue-50" : "text-teal-500 bg-teal-50";
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-black ${color}`}>
      {format}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]     = useState<TabKey>("All Inventory");
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);

  const profilePicSrc = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop";

  // Filter
  const filtered = ALL_RECORDS
    .filter(TAB_FILTERS[activeTab])
    .filter((r) =>
      search === "" ||
      r.recordName.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab: TabKey) => { setActiveTab(tab); setPage(1); };
  const handleSearch    = (v: string)  => { setSearch(v);       setPage(1); };

  const tabs: TabKey[] = ["All Inventory", "Prescriptions", "Lab Reports", "Diagnostic Scans", "Immunization"];

  return (
    <div className="flex flex-col min-h-screen">

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
              <p className="text-xs font-bold text-gray-800 leading-tight">{user?.fullName ?? "Dr. Sarah Jenkins"}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Admin Staff</p>
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
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <Filter size={13} strokeWidth={2.5} />
                  Advanced Filters
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0052cc] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                  <Upload size={13} strokeWidth={2.5} />
                  Upload New Record
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <FileText size={15} className={s.color} />
                  </div>
                  {s.delta && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      s.deltaUp === true  ? "bg-emerald-50 text-emerald-600" :
                      s.deltaUp === false ? "bg-red-50 text-red-500"         :
                                           "bg-gray-100 text-gray-500"
                    }`}>
                      {s.delta}
                    </span>
                  )}
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

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Head */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50/60 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="col-span-1">Serial ID</div>
              <div className="col-span-3">Record Name</div>
              <div className="col-span-2">Dept</div>
              <div className="col-span-2">Doctor</div>
              <div className="col-span-1">Modified</div>
              <div className="col-span-1">Format</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Utility</div>
            </div>

            {/* Table Rows */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FilePlus2 size={32} className="mb-2 text-gray-300" />
                <p className="text-sm font-bold">No records found</p>
                <p className="text-xs mt-1">Try adjusting your search or tab filter</p>
              </div>
            ) : (
              paginated.map((record, i) => (
                <div
                  key={record.id}
                  className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${
                    i === paginated.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Serial ID */}
                  <div className="col-span-1">
                    <span className="text-[10px] font-black text-[#0052cc] hover:underline cursor-pointer">
                      {record.id}
                    </span>
                  </div>

                  {/* Record Name */}
                  <div className="col-span-3 flex items-center gap-1.5">
                    <span className="font-bold text-gray-800 text-xs leading-tight">{record.recordName}</span>
                    {record.isNew && (
                      <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">NEW</span>
                    )}
                  </div>

                  {/* Dept */}
                  <div className="col-span-2 text-xs text-gray-500 font-semibold">{record.dept}</div>

                  {/* Doctor */}
                  <div className="col-span-2 text-xs text-gray-600 font-semibold">{record.doctor}</div>

                  {/* Last Modified */}
                  <div className="col-span-1 text-[10px] text-gray-400 font-semibold">{record.lastModified}</div>

                  {/* Format */}
                  <div className="col-span-1">
                    <FormatIcon format={record.format} />
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <StatusBadge status={record.status} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Eye size={13} strokeWidth={2.5} />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                      <Download size={13} strokeWidth={2.5} />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))
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
                <p className="text-[10px] font-black text-emerald-600">93.4%</p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "93.4%" }} />
              </div>
            </div>
          </div>

          {/* Recently Added */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recently Added</p>
            <div className="space-y-2">
              {RECENTLY_ADDED.map((f) => (
                <div key={f.name} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{f.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{f.time} · {f.size}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full py-2 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Full Log
            </button>
          </div>

          {/* Health History */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Health History</p>
            <div className="space-y-3">
              {HEALTH_HISTORY.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0052cc] mt-0.5" />
                    {i < HEALTH_HISTORY.length - 1 && <div className="w-px h-8 bg-gray-200" />}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{h.date}</p>
                    <p className="text-xs font-bold text-gray-800">{h.title}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{h.doctor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}