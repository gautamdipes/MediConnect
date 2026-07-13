import { HospitalModel, IHospital } from "../../models/hospital.model";

export class AdminHospitalService {
  async listHospitals(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.search) {
      filter.hospitalName = { $regex: query.search, $options: "i" };
    }
    if (query.status) {
      filter.status = query.status;
    }

    const hospitals = await HospitalModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await HospitalModel.countDocuments(filter);

    return {
      hospitals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHospital(id: string) {
    const hospital = await HospitalModel.findById(id);
    if (!hospital) {
      throw { status: 404, message: "Hospital not found" };
    }
    return hospital;
  }

  async createHospital(data: IHospital) {
    const newHospital = new HospitalModel(data);
    return await newHospital.save();
  }

  async updateHospital(id: string, data: Partial<IHospital>) {
    const hospital = await HospitalModel.findByIdAndUpdate(id, data, { new: true });
    if (!hospital) {
      throw { status: 404, message: "Hospital not found" };
    }
    return hospital;
  }

  async verifyHospital(id: string) {
    const hospital = await HospitalModel.findByIdAndUpdate(
      id,
      { status: "VERIFIED" },
      { new: true }
    );
    if (!hospital) {
      throw { status: 404, message: "Hospital not found" };
    }
    return hospital;
  }

  async deleteHospital(id: string) {
    const hospital = await HospitalModel.findByIdAndDelete(id);
    if (!hospital) {
      throw { status: 404, message: "Hospital not found" };
    }
    return { message: "Hospital deleted successfully" };
  }
}
