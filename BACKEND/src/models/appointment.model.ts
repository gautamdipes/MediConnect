import mongoose, { Document } from "mongoose";

export interface IAppointment {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  reason: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export interface IAppointmentDocument extends IAppointment, Document {}

const appointmentSchema = new mongoose.Schema<IAppointmentDocument>(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], default: "PENDING" },
  },
  { timestamps: true }
);

export const AppointmentModel = mongoose.model<IAppointmentDocument>("Appointment", appointmentSchema);
