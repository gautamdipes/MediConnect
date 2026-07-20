import * as hospitalModel from "../models/hospital.model";

export class HospitalRepository {
  async findByEmail(email: string) {
    return hospitalModel.HospitalModel.findOne({ email });
  }

  async findById(id: string) {
    return hospitalModel.HospitalModel.findById(id).exec();
  }

  async createHospital(data: any) {
    return hospitalModel.HospitalModel.create(data);
  }

  async updateHospital(hospitalId: string, data: any) {
    return hospitalModel.HospitalModel.findByIdAndUpdate(hospitalId, data, { new: true });
  }

  async deleteHospital(id: string) {
    return hospitalModel.HospitalModel.findByIdAndDelete(id).exec();
  }

  async count(filter: any) {
    return hospitalModel.HospitalModel.countDocuments(filter);
  }

  async findMany(filter: any, options: { skip: number; limit: number }) {
    return hospitalModel.HospitalModel.find(filter)
      .skip(options.skip)
      .limit(options.limit)
      .exec();
  }
}