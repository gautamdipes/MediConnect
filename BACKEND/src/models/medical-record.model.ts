import mongoose, { Document } from "mongoose";

export interface IMedicalRecord {
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  diagnosis: string;
  prescription: string;
  attachments?: string[];
  date: Date;
  recordName?: string;
  dept?: string;
  status?: string;
  format?: string;
}

export interface IMedicalRecordDocument extends IMedicalRecord, Document {}

const medicalRecordSchema = new mongoose.Schema<IMedicalRecordDocument>(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    diagnosis: { type: String, required: true },
    prescription: { type: String, required: true },
    attachments: { type: [String], default: [] },
    date: { type: Date, default: Date.now },
    recordName: { type: String },
    dept: { type: String, default: "Internal Med" },
    status: { type: String, enum: ["VERIFIED", "REVIEW", "ARCHIVED"], default: "VERIFIED" },
    format: { type: String, enum: ["PDF", "DICOM", "JPG", "PNG"], default: "PDF" },
  },
  { timestamps: true }
);

export const MedicalRecordModel = mongoose.model<IMedicalRecordDocument>(
  "MedicalRecord",
  medicalRecordSchema
);
