import mongoose, { Document } from "mongoose";

export interface IHospitalNotification {
  hospitalId: mongoose.Types.ObjectId;
  title: string;
  detail: string;
  type: "appointment" | "check-in" | "record";
  read: boolean;
}

export interface IHospitalNotificationDocument extends IHospitalNotification, Document {}

const hospitalNotificationSchema = new mongoose.Schema<IHospitalNotificationDocument>(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
    title: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },
    type: { type: String, enum: ["appointment", "check-in", "record"], required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const HospitalNotificationModel = mongoose.model<IHospitalNotificationDocument>("HospitalNotification", hospitalNotificationSchema);
