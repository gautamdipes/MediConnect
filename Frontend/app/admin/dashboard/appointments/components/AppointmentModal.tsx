"use client";
import React, { useEffect, useState } from "react";

type AppointmentForm = {
  patient: string;
  initials: string;
  doctor: string;
  hospital: string;
  datetime: string;
  status: string;
};

type Props = {
  mode: "create" | "edit";
  initialData?: Partial<AppointmentForm & { id: string }>;
  onSubmit: (data: AppointmentForm) => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function AppointmentModal({ mode, initialData, onSubmit, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<AppointmentForm>({
    patient: "",
    initials: "",
    doctor: "",
    hospital: "",
    datetime: "",
    status: "Pending",
  });
  const [errors, setErrors] = useState<Partial<AppointmentForm>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        patient: initialData.patient || "",
        initials: initialData.initials || "",
        doctor: initialData.doctor || "",
        hospital: initialData.hospital || "",
        datetime: initialData.datetime || "",
        status: initialData.status || "Pending",
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Partial<AppointmentForm> = {};
    if (!form.patient.trim()) newErrors.patient = "Patient name is required";
    if (!form.doctor.trim()) newErrors.doctor = "Doctor is required";
    if (!form.hospital.trim()) newErrors.hospital = "Hospital is required";
    if (!form.datetime.trim()) newErrors.datetime = "Date & time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const initials = form.initials || form.patient.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
      onSubmit({ ...form, initials });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {mode === "create" ? "Book New Appointment" : "Edit Appointment"}
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Patient Name</label>
            <input name="patient" value={form.patient} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" placeholder="Eleanor Vance" />
            {errors.patient && <p className="text-red-500 text-xs mt-1">{errors.patient}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Doctor</label>
            <input name="doctor" value={form.doctor} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" placeholder="Dr. Sarah Jenkins" />
            {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Hospital</label>
            <select name="hospital" value={form.hospital} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]">
              <option value="">Select Hospital</option>
              <option>Central Medical</option>
              <option>Westside Clinic</option>
              <option>Northwest General</option>
              <option>St. Marys Medical Center</option>
            </select>
            {errors.hospital && <p className="text-red-500 text-xs mt-1">{errors.hospital}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Date & Time</label>
            <input name="datetime" type="datetime-local" value={form.datetime} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" />
            {errors.datetime && <p className="text-red-500 text-xs mt-1">{errors.datetime}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]">
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Emergency</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 rounded-xl bg-[#0057d9] text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {isLoading ? "Saving..." : mode === "create" ? "Book Appointment" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
