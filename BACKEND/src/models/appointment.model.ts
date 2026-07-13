import mongoose, { Document } from "mongoose";

export interface IAppointment {
  patientId?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  patientName?: string;
  doctorName?: string;
  hospitalName?: string;
  date: Date;
  time: string;
  reason: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "EMERGENCY";
}

export interface IAppointmentDocument extends IAppointment, Document {}

  const appointmentSchema = new mongoose.Schema<IAppointmentDocument>(
    {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      patientName: { type: String },
      doctorName: { type: String },
      hospitalName: { type: String },
      date: { type: Date, required: true },
      time: { type: String, required: true },
      reason: { type: String, default: "General Checkup" },
      status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "EMERGENCY"], default: "PENDING" },
    },
  { timestamps: true }
);

export const AppointmentModel = mongoose.model<IAppointmentDocument>("Appointment", appointmentSchema);
