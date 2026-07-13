import { MedicalRecordModel, IMedicalRecord } from "../models/medical-record.model";
import mongoose from "mongoose";

export class MedicalRecordService {
  async getMedicalRecords(query: { patientId?: string; doctorId?: string }) {
    const filter: any = {};
    if (query.patientId) {
      filter.patientId = new mongoose.Types.ObjectId(query.patientId);
    }
    if (query.doctorId) {
      filter.doctorId = new mongoose.Types.ObjectId(query.doctorId);
    }

    const records = await MedicalRecordModel.find(filter)
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName email")
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });

    return records;
  }

  async getMedicalRecordById(id: string) {
    const record = await MedicalRecordModel.findById(id)
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName email")
      .populate("hospitalId", "name");
    
    if (!record) {
      throw { status: 404, message: "Medical record not found" };
    }
    return record;
  }

  async createMedicalRecord(data: Partial<IMedicalRecord>) {
    const newRecord = new MedicalRecordModel(data);
    return await newRecord.save();
  }

  async updateMedicalRecord(id: string, data: Partial<IMedicalRecord>) {
    const record = await MedicalRecordModel.findByIdAndUpdate(id, data, { new: true });
    if (!record) {
      throw { status: 404, message: "Medical record not found" };
    }
    return record;
  }

  async deleteMedicalRecord(id: string) {
    const record = await MedicalRecordModel.findByIdAndDelete(id);
    if (!record) {
      throw { status: 404, message: "Medical record not found" };
    }
    return { message: "Medical record deleted successfully" };
  }
}
