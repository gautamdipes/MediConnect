import mongoose, { Document } from "mongoose";

export type DoctorStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "EMERGENCY";

export interface IDoctor {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  hospitalId?: mongoose.Types.ObjectId;
  hospitalName?: string;
  experience: number;
  rating: number;
  status: DoctorStatus;
  gender?: string;
  profileImage?: string;
  qualifications?: string[];
  availableDays?: string[];
}

export interface IDoctorDocument extends IDoctor, Document {}

const doctorSchema = new mongoose.Schema<IDoctorDocument>(
  {
    fullName:       { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    phone:          { type: String, required: true },
    specialization: { type: String, required: true },
    department:     { type: String, required: true },
    hospitalId:     { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    hospitalName:   { type: String },
    experience:     { type: Number, default: 0 },
    rating:         { type: Number, default: 0, min: 0, max: 5 },
    status:         { type: String, enum: ["ACTIVE", "ON_LEAVE", "INACTIVE", "EMERGENCY"], default: "ACTIVE" },
    gender:         { type: String },
    profileImage:   { type: String },
    qualifications: { type: [String], default: [] },
    availableDays:  { type: [String], default: [] },
  },
  { timestamps: true }
);

export const DoctorModel = mongoose.model<IDoctorDocument>("Doctor", doctorSchema);