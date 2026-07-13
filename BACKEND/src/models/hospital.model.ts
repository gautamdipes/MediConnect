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
  },
  { timestamps: true }
);

export const HospitalModel = mongoose.model<IHospitalDocument>("Hospital", hospitalSchema);
