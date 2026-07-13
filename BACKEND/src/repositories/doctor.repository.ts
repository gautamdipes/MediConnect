import { DoctorModel, DoctorStatus } from "../models/doctor.model";

export class DoctorRepository {
  async findAll(filter: any, options: { skip: number; limit: number }) {
    return DoctorModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .exec();
  }

  async count(filter: any) {
    return DoctorModel.countDocuments(filter);
  }

  async findById(id: string) {
    return DoctorModel.findById(id).exec();
  }

  async findByEmail(email: string) {
    return DoctorModel.findOne({ email }).exec();
  }

  async create(data: any) {
    return DoctorModel.create(data);
  }

  async update(id: string, data: any) {
    return DoctorModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return DoctorModel.findByIdAndDelete(id).exec();
  }

  async countByStatus(status: DoctorStatus) {
    return DoctorModel.countDocuments({ status });
  }

  async averageRating() {
    const result = await DoctorModel.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    return result[0]?.avg ?? 0;
  }
}