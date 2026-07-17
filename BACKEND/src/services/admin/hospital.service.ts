import { HospitalModel, IHospital } from "../../models/hospital.model";

export class AdminHospitalService {
  async listHospitals(query: { page?: number; limit?: number; search?: string; status?: string }) {
    try {
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
    } catch (err: any) {
      if (err.code === 11000) {
        // Duplicate key error (e.g., email already exists)
        throw { status: 400, message: 'Hospital with this email already exists' };
      }
      throw err;
    }
  }

  // Create a new hospital
  async createHospital(data: IHospital) {
    try {
      // Check for duplicate email before creation
      const existing = await HospitalModel.findOne({ email: data.email });
      if (existing) {
        throw { status: 400, message: 'Hospital with this email already exists' };
      }
      const hospital = await HospitalModel.create(data);
      return hospital;
    } catch (err: any) {
      if (err.code === 11000) {
        // Duplicate key error (e.g., email already exists)
        throw { status: 400, message: 'Hospital with this email already exists' };
      }
      throw err;
    }
  }

  async getHospital(id: string) {
    const hospital = await HospitalModel.findById(id);
    if (!hospital) {
      throw { status: 404, message: "Hospital not found" };
    }
    return hospital;
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
