"use client";
import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, AlertTriangle, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AppointmentModal from "./components/AppointmentModal";
import DeleteModal from "./components/DeleteModal";

type Appointment = {
  id: string;
  patient: string;
  initials: string;
  doctor: string;
  hospital: string;
  datetime: string;
  status: string;
};

const initialAppointments: Appointment[] = [
  { id: "#APT-9042", patient: "Eleanor Vance", initials: "EV", doctor: "Dr. Sarah Jenkins", hospital: "Central Medical", datetime: "Oct 24, 09:30 AM", status: "Confirmed" },
  { id: "#APT-9045", patient: "Marcus Knight", initials: "MK", doctor: "Dr. Aris Thorne", hospital: "Westside Clinic", datetime: "Oct 24, 11:15 AM", status: "Emergency" },
  { id: "#APT-9048", patient: "Julian Lowe", initials: "JL", doctor: "Dr. Sarah Jenkins", hospital: "Central Medical", datetime: "Oct 24, 02:00 PM", status: "Pending" },
  { id: "#APT-9051", patient: "Anna Smith", initials: "AS", doctor: "Dr. Mark Lee", hospital: "Northwest General", datetime: "Oct 25, 10:00 AM", status: "Confirmed" },
  { id: "#APT-9055", patient: "Robert King", initials: "RK", doctor: "Dr. Aris Thorne", hospital: "Westside Clinic", datetime: "Oct 25, 01:00 PM", status: "Cancelled" },
];

const statusStyle: Record<string, string> = {
  Confirmed: "bg-emerald-50 text-emerald-600",
  Emergency: "bg-red-50 text-red-600",
  Pending: "bg-blue-50 text-blue-600",
  Cancelled: "bg-slate-100 text-slate-500",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [hospital, setHospital] = useState("All Hospitals");
  const [status, setStatus] = useState("All Status");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/v1/admin/appointments?limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.appointments) {
        const mapped = data.appointments.map((apt: any) => {
          const patientName = apt.patientId?.fullName || apt.patientName || "Unknown";
          const initial = patientName.substring(0, 2).toUpperCase();
          const doctorName = apt.doctorId?.fullName || apt.doctorName || "Unknown Doctor";
          const hospitalName = apt.hospitalId?.hospitalName || apt.hospitalName || "Unknown Hospital";

          const rawStatus = apt.status || "PENDING";
          const formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          return {
            id: apt._id,
            patient: patientName,
            initials: initial,
            doctor: doctorName,
            hospital: hospitalName,
            datetime: `${new Date(apt.date || apt.createdAt).toLocaleDateString()} ${apt.time || ''}`,
            status: formattedStatus
          };
        });
        setAppointments(mapped);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All Status" || a.status === status;
    const matchHospital = hospital === "All Hospitals" || a.hospital === hospital;
    return matchSearch && matchStatus && matchHospital;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCreate = async (form: Omit<Appointment, "id" | "initials">) => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await fetch("http://localhost:5000/api/v1/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientName: form.patient,
          doctorName: form.doctor,
          hospitalName: form.hospital,
          date: form.datetime.split("T")[0],
          time: form.datetime.split("T")[1] || "00:00",
          reason: "Admin Booking",
          status: form.status ? form.status.toUpperCase() : "PENDING",
        }),
      });
      await fetchAppointments();
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = async (form: Omit<Appointment, "id" | "initials">) => {
    if (!selected) return;
    setModalLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`http://localhost:5000/api/v1/admin/appointments/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientName: form.patient,
          doctorName: form.doctor,
          hospitalName: form.hospital,
          date: form.datetime ? form.datetime.split("T")[0] : undefined,
          time: form.datetime ? form.datetime.split("T")[1] : undefined,
          status: form.status ? form.status.toUpperCase() : "PENDING",
        }),
      });
      await fetchAppointments();
      setShowEdit(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setModalLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`http://localhost:5000/api/v1/admin/appointments/${selected.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAppointments();
      setShowDelete(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium mb-1">Portal › Appointments</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Management</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-[#0057d9] text-white rounded-xl shadow-sm hover:bg-blue-700 transition">
          + Book New Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Today's Appointments", value: appointments.filter(a => a.status !== "Cancelled").length, badge: "↗ 12%", badgeColor: "text-emerald-600 bg-emerald-50", icon: <Calendar className="w-5 h-5 text-blue-500" /> },
          { label: "Upcoming", value: appointments.length, badge: "Total", badgeColor: "text-slate-500 bg-slate-100", icon: <Calendar className="w-5 h-5 text-slate-400" /> },
          { label: "Completed", value: appointments.filter(a => a.status === "Confirmed").length, badge: "↗ 8%", badgeColor: "text-emerald-600 bg-emerald-50", icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
          { label: "Cancelled", value: appointments.filter(a => a.status === "Cancelled").length, badge: "↘ 3%", badgeColor: "text-red-500 bg-red-50", icon: <XCircle className="w-5 h-5 text-red-400" /> },
          { label: "Emergency Bookings", value: appointments.filter(a => a.status === "Emergency").length, badge: "HIGH PRIO", badgeColor: "text-red-600 bg-red-100 font-black", icon: <AlertTriangle className="w-5 h-5 text-red-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              {stat.icon}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.badgeColor}`}>{stat.badge}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{stat.label}</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800">Find an Appointment</h2>
          <p className="text-sm text-slate-400 mt-1">Enter patient name, ID, or doctor to search the records</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by patient name, ID, or doctor..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" />
          </div>
          <button className="px-6 py-2.5 bg-[#0057d9] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition">Search →</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <select value={hospital} onChange={(e) => { setHospital(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0057d9]">
            <option>All Hospitals</option>
            <option>Central Medical</option>
            <option>Westside Clinic</option>
            <option>Northwest General</option>
          </select>
          <select className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0057d9]">
            <option>All Specialities</option>
            <option>Cardiology</option>
            <option>Neurology</option>
            <option>General Practice</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0057d9]">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Emergency</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Patient</th>
                <th className="px-6 py-4 text-left">Doctor</th>
                <th className="px-6 py-4 text-left">Hospital</th>
                <th className="px-6 py-4 text-left">Date & Time</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No appointments found</td></tr>
              ) : (
                paginated.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{apt.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{apt.initials}</div>
                        <span className="font-medium text-slate-800">{apt.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{apt.doctor}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.hospital}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.datetime}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[apt.status]}`}>{apt.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelected(apt); setShowEdit(true); }} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(apt); setShowDelete(true); }} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-400">Showing {paginated.length} of {filtered.length} entries</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-bold ${p === page ? "bg-[#0057d9] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreate && <AppointmentModal mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={modalLoading} />}
      {showEdit && selected && <AppointmentModal mode="edit" initialData={selected} onSubmit={handleEdit} onCancel={() => { setShowEdit(false); setSelected(null); }} isLoading={modalLoading} />}
      {showDelete && selected && <DeleteModal name={selected.patient} onConfirm={handleDelete} onCancel={() => { setShowDelete(false); setSelected(null); }} isLoading={modalLoading} />}
    </div>
  );
}
