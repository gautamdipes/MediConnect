import mongoose, { Document } from "mongoose";

export interface IHospitalPatient {
  hospitalId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  age?: number;
  gender?: string;
  department?: string;
  notes?: string;
}

export interface IHospitalPatientDocument extends IHospitalPatient, Document {}

const hospitalPatientSchema = new mongoose.Schema<IHospitalPatientDocument>(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String },
    department: { type: String, default: "General Care" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const HospitalPatientModel = mongoose.model<IHospitalPatientDocument>("HospitalPatient", hospitalPatientSchema);
