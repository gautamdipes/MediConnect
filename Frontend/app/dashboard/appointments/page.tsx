"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  HeartPulse,
  Video,
} from "lucide-react";
import { api } from "@/lib/proxy";
import { useAuth } from "@/app/dashboard/context/AuthContext";
import { DashboardTopBar } from "../components/DashboardTopBar";

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

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  rating: number;
  profileImage?: string;
  hospitalId?: string;
}

interface Hospital {
  _id: string;
  hospitalName: string;
  city: string;
  image?: string;
}

interface DashboardStats {
  totalAppointments: number;
  upcomingCount: number;
  totalRecords: number;
  activeDoctors: number;
}

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
    if (!form.hospitalId) return setError("Please select a hospital");
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
      setError(err.response?.data?.message || err.message || "Failed to book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl transition-transform">
        <h3 className="mb-4 text-xl font-bold text-gray-800">Book Appointment</h3>
        {error && <p className="mb-3 text-sm font-semibold text-red-500">{error}</p>}
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <label className="text-sm font-semibold text-gray-700">
            Doctor
            <select
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.fullName} ({d.specialization})</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Hospital
            <select
              required
              value={form.hospitalId}
              onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">-- Choose Hospital --</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>{h.hospitalName} - {h.city}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Time
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Booking..." : "Confirm Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const card = "rounded-xl border border-gray-100 bg-white p-4";
const img = (id: string, size = 400) =>
  id?.startsWith("/uploads")
    ? `http://localhost:5000${id}`
    : `https://images.unsplash.com/${id}?w=${size}&h=${size / 1.6}&fit=crop&crop=faces`;

function Card({ title, action, children, onAction }: { title: string; action?: string; children: React.ReactNode; onAction?: () => void }) {
  return (
    <section className={`mb-4 ${card}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{title}</h3>
        {action && (
          <button onClick={onAction} className="text-[12.5px] font-semibold text-blue-600 hover:underline">
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, docRes, hospRes, statsRes] = await Promise.all([
        api.get("/v1/users/appointments?limit=20"),
        api.get("/v1/users/doctors?limit=50&status=ACTIVE"),
        api.get("/v1/users/hospitals?limit=50"),
        api.get("/v1/users/dashboard"),
      ]);
      setAppointments(apptsRes.data?.appointments || []);
      setDoctors(docRes.data?.data || []);
      setHospitals(hospRes.data?.hospitals || []);
      setStats(statsRes.data?.stats || null);
    } catch (error) {
      console.error("Error fetching appointment data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.patch(`/v1/users/appointments/${id}/cancel`);
      fetchData(); // refresh list
    } catch (err) {
      console.error("Failed to cancel", err);
    }
  };

  const upcoming = appointments.filter((a) => a.status !== "CANCELLED" && a.status !== "COMPLETED").slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f8] text-[#171d2d]">
      {showModal && <BookModal doctors={doctors} hospitals={hospitals} onClose={() => setShowModal(false)} onBooked={fetchData} />}

      <DashboardTopBar placeholder="Search appointments, doctors, hospitals..." />

      <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-[23px] font-bold">Appointments</h2>
          <p className="text-[13px] text-gray-400">Manage clinical visits and track patient journey with precision.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus size={15} /> Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-[repeat(4,1fr)_150px] gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Total bookings</p>
          <p className="text-[21px] font-bold">{stats?.totalAppointments || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Upcoming</p>
          <p className="text-[21px] font-bold">{stats?.upcomingCount || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Doctors</p>
          <p className="text-[21px] font-bold text-emerald-600">{stats?.activeDoctors || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Records</p>
          <p className="text-[21px] font-bold text-blue-600">{stats?.totalRecords || 0}</p>
        </div>
        <div className="rounded-xl bg-blue-600 text-white p-4 flex flex-col justify-center shadow-md">
          <p className="mb-1 text-[10px] font-semibold uppercase text-blue-100">Emergency</p>
          <p className="text-[21px] font-bold">Call 911</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_235px] items-start gap-4">
        {/* Left column */}
        <div>
          <Card title="Upcoming visits" action="Book new" onAction={() => setShowModal(true)}>
            {upcoming.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 font-medium">No upcoming visits found.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {upcoming.map((v) => (
                  <div key={v._id} className="rounded-xl border border-gray-100 p-3.5 hover:shadow-sm transition-shadow">
                    <div className="mb-3.5 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <HeartPulse size={18} />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-bold truncate max-w-[150px]">{v.reason}</p>
                        <p className="text-[11.5px] text-gray-400 truncate max-w-[150px]">
                          {v.doctorName || v.doctorId?.fullName || "General Doctor"} • {v.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleCancel(v._id)} className="flex-1 rounded-md border border-gray-200 bg-gray-50 py-2 text-[12.5px] font-semibold hover:bg-gray-100 transition-colors text-red-500">Cancel</button>
                      <button className="flex-1 rounded-md border border-blue-600 py-2 text-[12.5px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors">Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="History">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10.5px] font-semibold uppercase text-gray-400">
                  <th className="py-2">Date</th>
                  <th className="py-2">Hospital</th>
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-sm">No appointment history</td></tr>
                )}
                {appointments.map((r) => (
                  <tr key={r._id} className="border-b border-gray-100 last:border-none">
                    <td className="py-2.5 font-semibold text-gray-700">{r.date}</td>
                    <td className="py-2.5">{r.hospitalName || r.hospitalId?.hospitalName || "N/A"}</td>
                    <td className="py-2.5">{r.doctorName || r.doctorId?.fullName || "N/A"}</td>
                    <td className="py-2.5">
                      <span className={`rounded px-2.5 py-1 text-[10.5px] font-bold 
                        ${r.status === 'COMPLETED' ? 'bg-teal-50 text-teal-600' : 
                          r.status === 'CANCELLED' ? 'bg-red-50 text-red-500' :
                          r.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`
                      }>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Nearby hospitals">
            <div className="grid grid-cols-3 gap-3">
              {hospitals.map((h) => (
                <div key={h._id} className="group cursor-pointer">
                  <img src={img(h.image || 'photo-1519494026892-80bbd2d6fd0d')} alt={h.hospitalName} className="mb-2.5 h-[92px] w-full rounded-lg object-cover transition-transform group-hover:scale-[1.02]" />
                  <p className="text-[13px] font-bold truncate">{h.hospitalName}</p>
                  <p className="mb-2.5 text-[11.5px] text-gray-400 truncate">{h.city}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div>
          <Card title="Available doctors">
            {doctors.map((d) => (
              <div key={d._id} className="flex items-center gap-2.5 py-2.5">
                <img src={img(d.profileImage || 'photo-1559839734-2b71ea197ec2', 100)} alt={d.fullName} className="h-[34px] w-[34px] rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold truncate">{d.fullName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{d.specialization} • {d.rating || 5.0}★</p>
                </div>
              </div>
            ))}
          </Card>

          <section className="mt-4 flex items-center justify-between rounded-xl bg-blue-600 p-4 text-white shadow-lg">
            <div>
              <h3 className="mb-2.5 text-[14px] font-bold">Virtual Care 24/7</h3>
              <button className="rounded-md bg-white px-3.5 py-2 text-[12.5px] font-bold text-blue-600 hover:bg-gray-50 transition-colors">Consult now</button>
            </div>
            <Video size={26} strokeWidth={1.6} />
          </section>
        </div>
      </div>
      </div>
    </div>
  );
}
