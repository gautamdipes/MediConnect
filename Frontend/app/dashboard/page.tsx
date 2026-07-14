"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/proxy";
import {
  Bell,
  Search,
  Calendar as CalendarIcon,
  MapPin,
  Star,
  Clock,
  FileText,
  Download,
  Eye,
  HeartPulse,
  Activity,
  BotMessageSquare,
  Stethoscope,
  CalendarCheck,
  PlusSquare,
  Cross,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Building2,
  UserRound,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { UserNotificationsDropdown } from "./components/UserNotificationsDropdown";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Appointment {
  _id: string;
  doctorId?: { fullName: string; specialization: string; profileImage?: string };
  hospitalId?: { hospitalName: string; city: string };
  doctorName?: string;
  hospitalName?: string;
  date: string;
  time: string;
  reason: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "EMERGENCY";
}

interface DashboardStats {
  totalAppointments: number;
  upcomingCount: number;
  totalRecords: number;
  activeDoctors: number;
}

interface DashboardData {
  stats: DashboardStats;
  upcomingAppointments: Appointment[];
}

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  department: string;
  rating: number;
  experience: number;
  profileImage?: string;
  status: string;
  hospitalId?: string;
}

interface Hospital {
  _id: string;
  hospitalName: string;
  city: string;
  state: string;
  rating: number;
  type?: string;
  departments: string[];
  emergency: boolean;
  image?: string;
}

interface MedicalRecord {
  _id: string;
  recordName: string;
  dept?: string;
  status?: string;
  format?: string;
  fileUrl?: string;
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-teal-50 text-teal-700",
  CANCELLED: "bg-red-50 text-red-500",
  EMERGENCY: "bg-purple-50 text-purple-700",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

const greetingOf = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const nowDateStr = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

// ─── Book Appointment Modal ──────────────────────────────────────────────────
function BookModal({
  doctors,
  hospitals,
  onClose,
  onBooked,
}: {
  doctors: Doctor[];
  hospitals: Hospital[];
  onClose: () => void;
  onBooked: () => void;
}) {
  const [form, setForm] = useState({
    doctorId: "",
    hospitalId: "",
    date: "",
    time: "",
    reason: "General Checkup",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) return setError("Date and time are required");
    if (!form.doctorId) return setError("Please select a doctor");
    setLoading(true);
    setError("");
    try {
      const selected = doctors.find((d) => d._id === form.doctorId);
      const selectedHosp = hospitals.find((h) => h._id === form.hospitalId);
      await api.post("/v1/users/appointments", {
        date: form.date,
        time: form.time,
        reason: form.reason,
        doctorId: form.doctorId,
        doctorName: selected?.fullName,
        ...(form.hospitalId
          ? { hospitalId: form.hospitalId, hospitalName: selectedHosp?.hospitalName }
          : {}),
      });
      onBooked();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg">Book Appointment</h2>
            <p className="text-blue-100 text-xs mt-0.5">Schedule your next visit</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2.5 rounded-xl text-sm font-medium">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Doctor select */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Doctor</label>
            <div className="relative">
              <Stethoscope size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none"
              >
                <option value="">Select a doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.fullName} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospital select */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hospital (optional)</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={form.hospitalId}
                onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none"
              >
                <option value="">Select a hospital</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.hospitalName} — {h.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date *</label>
              <div className="relative">
                <CalendarIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Time *</label>
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason</label>
            <textarea
              rows={2}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              placeholder="Describe reason for visit..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Appointment Card ────────────────────────────────────────────────────────
function AppointmentCard({ appt, onCancel }: { appt: Appointment; onCancel: (id: string) => void }) {
  const doctorName = appt.doctorId?.fullName || appt.doctorName || "Unknown Doctor";
  const specialty = appt.doctorId?.specialization || "General";
  const hospName = appt.hospitalId?.hospitalName || appt.hospitalName || "—";
  const pic = appt.doctorId?.profileImage
    ? `http://localhost:5000${appt.doctorId.profileImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=e0e7ff&color=4f46e5&bold=true`;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start hover:shadow-md transition-shadow">
      <img src={pic} alt={doctorName} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">{doctorName}</p>
            <p className="text-gray-400 text-xs font-semibold mt-0.5">{specialty}</p>
          </div>
          <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full shrink-0 ${statusColors[appt.status] || "bg-gray-100 text-gray-500"}`}>
            {appt.status}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
            <CalendarIcon size={11} /> {formatDate(appt.date)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
            <Clock size={11} /> {appt.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold truncate">
            <Building2 size={11} /> {hospName}
          </span>
        </div>
        {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
          <button
            onClick={() => onCancel(appt._id)}
            className="mt-3 text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <X size={11} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [apptFilter, setApptFilter] = useState("ALL");
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, apptRes, docRes, hospRes, recRes] = await Promise.all([
        api.get("/v1/users/dashboard"),
        api.get("/v1/users/appointments?limit=20"),
        api.get("/v1/users/doctors?limit=50&status=ACTIVE"),
        api.get("/v1/users/hospitals?limit=50"),
        api.get("/v1/users/medical-records?limit=4"),
      ]);
      setDashData(dashRes.data);
      setAppointments(apptRes.data?.appointments || []);
      setDoctors(docRes.data?.data || []);
      setHospitals(hospRes.data?.hospitals || []);
      setRecentRecords(recRes.data?.records || []);
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await api.patch(`/v1/users/appointments/${id}/cancel`);
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const profilePicSrc = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=dbeafe&color=1d4ed8&bold=true&size=80`;

  const firstName = user?.fullName?.split(" ")[0] || "there";

  const filteredAppointments =
    apptFilter === "ALL" ? appointments : appointments.filter((a) => a.status === apptFilter);

  const stats = dashData?.stats;

  const statCards = [
    { label: "Total Appointments", value: stats?.totalAppointments ?? "—", icon: CalendarCheck, color: "bg-blue-50 text-blue-600" },
    { label: "Upcoming", value: stats?.upcomingCount ?? "—", icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Medical Records", value: stats?.totalRecords ?? "—", icon: ClipboardList, color: "bg-teal-50 text-teal-600" },
    { label: "Active Doctors", value: stats?.activeDoctors ?? "—", icon: UserRound, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="h-20 bg-white px-6 md:px-8 flex items-center justify-between shrink-0 border-b border-gray-100 shadow-sm">
        <div className="relative w-80 max-w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search doctors, hospitals, records..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium outline-none text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-600">
            <CalendarIcon size={13} className="text-gray-400" />
            <span>{nowDateStr()}</span>
          </div>
          <button
            onClick={fetchAll}
            className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 border rounded-full transition-colors ${showNotifications ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"}`}
            >
              <Bell size={17} strokeWidth={2.5} />
            </button>
            <UserNotificationsDropdown
              open={showNotifications}
              onClose={() => setShowNotifications(false)}
              anchorRef={bellRef}
            />
          </div>
          <img src={profilePicSrc} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm" />
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="px-6 md:px-8 max-w-[1400px] w-full mx-auto space-y-6 py-6 pb-20">

        {/* Greeting + Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {greetingOf()}, {firstName} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Your health dashboard — all in one place</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm shadow-blue-500/30 transition-all"
            >
              <CalendarCheck size={15} /> Book Appointment
            </button>
            <Link
              href="/dashboard/medical-records"
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border border-gray-200 transition-all"
            >
              <FileText size={15} /> My Records
            </Link>
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 leading-none">
                  {loading ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" /> : s.value}
                </p>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Appointments list */}
          <div className="lg:col-span-2 space-y-6">

            {/* Appointments Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-base font-black text-gray-900">My Appointments</h2>
                <div className="flex items-center gap-1.5">
                  {["ALL", "UPCOMING", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"].map((f) => (
                    f === "UPCOMING"
                      ? null
                      : (
                        <button
                          key={f}
                          onClick={() => setApptFilter(f)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${apptFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                          {f}
                        </button>
                      )
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <CalendarIcon size={40} className="mb-3 opacity-40" />
                    <p className="font-bold text-sm">No appointments found</p>
                    <p className="text-xs mt-1">Book one to get started</p>
                    <button
                      onClick={() => setShowBookModal(true)}
                      className="mt-4 px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all"
                    >
                      + Book Appointment
                    </button>
                  </div>
                ) : (
                  filteredAppointments.map((a) => (
                    <AppointmentCard key={a._id} appt={a} onCancel={handleCancel} />
                  ))
                )}
              </div>
            </section>

            {/* Recent Medical Records */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-gray-900">Recent Medical Records</h2>
                <Link href="/dashboard/medical-records" className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : recentRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <FileText size={36} className="mb-2 opacity-40" />
                    <p className="text-sm font-bold">No records yet</p>
                    <Link href="/dashboard/medical-records" className="mt-3 text-xs text-blue-600 font-bold hover:underline">
                      Upload your first record →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <div className="col-span-5">Record</div>
                      <div className="col-span-3">Date</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>
                    {recentRecords.map((rec, i) => (
                      <div
                        key={rec._id}
                        className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50/40 transition-colors ${i < recentRecords.length - 1 ? "border-b border-gray-50" : ""}`}
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <FileText size={15} />
                          </div>
                          <span className="font-bold text-gray-800 text-sm truncate">{rec.recordName}</span>
                        </div>
                        <div className="col-span-3 text-gray-500 text-xs font-semibold">{formatDate(rec.createdAt)}</div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${rec.status === "COMPLETED" ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"}`}>
                            {rec.status || "Active"}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-end gap-1">
                          {rec.fileUrl && (
                            <a
                              href={`http://localhost:5000${rec.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 border border-gray-100 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Download size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-6">

            {/* Upcoming Appointment Banner */}
            <section>
              <h2 className="text-base font-black text-gray-900 mb-3">Next Appointment</h2>
              {loading ? (
                <div className="h-52 bg-blue-100 rounded-2xl animate-pulse" />
              ) : dashData?.upcomingAppointments?.[0] ? (
                (() => {
                  const next = dashData.upcomingAppointments[0];
                  const docName = next.doctorId?.fullName || next.doctorName || "Doctor";
                  const spec = next.doctorId?.specialization || "Specialist";
                  const pic = next.doctorId?.profileImage
                    ? `http://localhost:5000${next.doctorId.profileImage}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=bfdbfe&color=1e40af&bold=true&size=80`;
                  return (
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 space-y-4">
                      <div className="flex items-center gap-3">
                        <img src={pic} alt={docName} className="w-12 h-12 rounded-xl object-cover border-2 border-blue-400 shrink-0" />
                        <div>
                          <h3 className="font-bold text-base leading-tight">{docName}</h3>
                          <p className="text-blue-200 text-xs font-semibold mt-0.5">{spec}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-3">
                          <CalendarIcon className="text-blue-200" size={15} />
                          <div>
                            <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">Date</p>
                            <p className="font-bold text-sm">{formatDate(next.date)}</p>
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-3">
                          <Clock className="text-blue-200" size={15} />
                          <div>
                            <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">Time</p>
                            <p className="font-bold text-sm">{next.time}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${next.status === "CONFIRMED" ? "bg-white/20 text-white" : "bg-white/10 text-blue-100"}`}>
                        <CheckCircle2 size={10} /> {next.status}
                      </span>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center text-gray-400">
                  <CalendarCheck size={36} className="mb-3 opacity-40" />
                  <p className="text-sm font-bold">No upcoming appointments</p>
                  <button
                    onClick={() => setShowBookModal(true)}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              )}
            </section>

            {/* Find a Doctor */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-gray-900">Available Doctors</h2>
              </div>
              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />)
                  : doctors.slice(0, 4).map((doc) => {
                    const pic = doc.profileImage
                      ? `http://localhost:5000${doc.profileImage}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.fullName)}&background=e0e7ff&color=4f46e5&bold=true&size=80`;
                    return (
                      <div key={doc._id} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                        <img src={pic} alt={doc.fullName} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm leading-tight truncate">{doc.fullName}</p>
                          <p className="text-gray-400 text-xs font-semibold truncate">{doc.specialization}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-bold text-gray-500">{doc.rating?.toFixed(1) || "0.0"}</span>
                            <span className="text-[10px] text-gray-300 mx-0.5">·</span>
                            <span className="text-[10px] font-semibold text-gray-400">{doc.experience}yr exp</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowBookModal(true)}
                          className="shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          Book
                        </button>
                      </div>
                    );
                  })}
                {!loading && doctors.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm">No doctors found</div>
                )}
              </div>
            </section>

            {/* Nearby Hospitals */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-gray-900">Nearby Hospitals</h2>
              </div>
              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />)
                  : hospitals.slice(0, 3).map((h) => (
                    <div key={h._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm leading-tight">{h.hospitalName}</p>
                            <p className="text-gray-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {h.city}, {h.state}
                            </p>
                          </div>
                        </div>
                        {h.rating > 0 && (
                          <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Star size={10} className="text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black text-gray-700">{h.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {h.emergency && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-full">
                          <Cross size={9} strokeWidth={3} /> Emergency Available
                        </span>
                      )}
                    </div>
                  ))}
                {!loading && hospitals.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm">No hospitals found</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <BookModal
          doctors={doctors}
          hospitals={hospitals}
          onClose={() => setShowBookModal(false)}
          onBooked={fetchAll}
        />
      )}

      {/* Floating AI Chat Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-colors z-50">
        <BotMessageSquare size={26} />
      </button>
    </div>
  );
}