import { AppointmentModel } from "../../models/appointment.model";
import { HospitalNotificationService } from "./notification.service";

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "EMERGENCY"] as const;

function serialize(appointment: any) {
  return {
    _id: appointment._id,
    patientName: appointment.patientId?.fullName || appointment.patientName || "Unknown patient",
    doctorName: appointment.doctorId?.fullName || appointment.doctorName || "Unassigned doctor",
    department: appointment.doctorId?.department || "General Care",
    date: appointment.date,
    time: appointment.time,
    reason: appointment.reason,
    status: appointment.status,
  };
}

export class HospitalAppointmentService {
  private notificationService = new HospitalNotificationService();
  async list(hospitalId: string, query: { status?: string; search?: string }) {
    const filter: any = { hospitalId };
    if (query.status && STATUSES.includes(query.status as any)) filter.status = query.status;
    if (query.search?.trim()) {
      const pattern = new RegExp(query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ patientName: pattern }, { doctorName: pattern }, { reason: pattern }];
    }
    const appointments = await AppointmentModel.find(filter).sort({ date: 1, time: 1 }).populate("patientId", "fullName").populate("doctorId", "fullName department");
    return { appointments: appointments.map(serialize) };
  }

  async create(hospitalId: string, payload: { patientName?: string; doctorName?: string; department?: string; date?: string; time?: string; reason?: string }) {
    if (!payload.patientName?.trim() || !payload.doctorName?.trim() || !payload.time) throw { status: 400, message: "Patient, doctor, and time are required" };
    const appointment = await AppointmentModel.create({ hospitalId, patientName: payload.patientName.trim(), doctorName: payload.doctorName.trim(), date: payload.date ? new Date(payload.date) : new Date(), time: payload.time, reason: payload.reason?.trim() || payload.department?.trim() || "General Checkup", status: "PENDING" });
    await this.notificationService.create(hospitalId, { title: "New appointment booked", detail: `${appointment.patientName} · ${appointment.time}`, type: "appointment" });
    return { appointment: serialize(appointment) };
  }

  async updateStatus(hospitalId: string, id: string, status: string) {
    if (!STATUSES.includes(status as any)) throw { status: 400, message: "Invalid appointment status" };
    const appointment = await AppointmentModel.findOneAndUpdate({ _id: id, hospitalId }, { status }, { new: true }).populate("patientId", "fullName").populate("doctorId", "fullName department");
    if (!appointment) throw { status: 404, message: "Appointment not found" };
    if (status === "COMPLETED") {
      await this.notificationService.create(hospitalId, { title: "Patient checked in", detail: `${(appointment.patientId as any)?.fullName || appointment.patientName || "Patient"} · ${appointment.time}`, type: "check-in" });
    }
    return { appointment: serialize(appointment) };
  }
}
