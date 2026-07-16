import mongoose, { Document } from "mongoose";

export interface IHospital {
  hospitalName: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  departments: string[];
  doctorsCount: number;
  status: "PENDING" | "VERIFIED" | "SUSPENDED" | "INACTIVE" | "REJECTED";
  type?: string;
  rating?: number;
  emergency?: boolean;
  image?: string;
  address?: string;
  notificationPreferences: {
    appointmentAlerts: boolean;
    checkInAlerts: boolean;
    recordAlerts: boolean;
  };
}

export interface IHospitalDocument extends IHospital, Document {}

const hospitalSchema = new mongoose.Schema<IHospitalDocument>(
  {
    hospitalName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    departments: { type: [String], default: [] },
    doctorsCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["PENDING", "VERIFIED", "SUSPENDED", "INACTIVE", "REJECTED"], 
      default: "PENDING" 
    },
    type: { type: String },
    rating: { type: Number, default: 0 },
    emergency: { type: Boolean, default: false },
    image: { type: String },
    address: { type: String, default: "" },
    notificationPreferences: {
      appointmentAlerts: { type: Boolean, default: true },
      checkInAlerts: { type: Boolean, default: true },
      recordAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const HospitalModel = mongoose.model<IHospitalDocument>("Hospital", hospitalSchema);
