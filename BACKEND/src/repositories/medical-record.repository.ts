import { MedicalRecordModel } from "../models/medical-record.model";

export class MedicalRecordRepository {
  async findAllByUser(userId: string) {
    return MedicalRecordModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    return MedicalRecordModel.findById(id).exec();
  }

  async create(data: any) {
    return MedicalRecordModel.create(data);
  }

  async update(id: string, data: any) {
    return MedicalRecordModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return MedicalRecordModel.findByIdAndDelete(id).exec();
  }

  async count(userId: string) {
    return MedicalRecordModel.countDocuments({ userId });
  }
}