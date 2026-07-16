import { DoctorRepository } from "../../repositories/doctor.repository";
import { HttpException } from "../../exceptions/http-exception";
import { CreateDoctorDTO, UpdateDoctorDTO } from "../../dtos/doctor.dto";

const repo = new DoctorRepository();

export class AdminDoctorService {
  async listDoctors(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
  }) {
    const page  = Number(params.page)  > 0 ? Number(params.page)  : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 10;
    const skip  = (page - 1) * limit;

    const filter: any = {};

    if (params.search) {
      const regex = new RegExp(params.search, "i");
      filter.$or = [{ fullName: regex }, { email: regex }, { specialization: regex }];
    }

    if (params.status && params.status !== "All") {
      filter.status = params.status;
    }

    if (params.department && params.department !== "All") {
      filter.department = params.department;
    }

    const [total, doctors] = await Promise.all([
      repo.count(filter),
      repo.findAll(filter, { skip, limit }),
    ]);

    return {
      data: doctors,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats() {
    const [total, active, onLeave, emergency, avgRating] = await Promise.all([
      repo.count({}),
      repo.countByStatus("ACTIVE"),
      repo.countByStatus("ON_LEAVE"),
      repo.countByStatus("EMERGENCY"),
      repo.averageRating(),
    ]);

    return {
      total,
      active,
      onLeave,
      emergency,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }

  async getDoctor(id: string) {
    const doctor = await repo.findById(id);
    if (!doctor) throw new HttpException("Doctor not found", 404);
    return doctor;
  }

  async createDoctor(data: CreateDoctorDTO) {
    if (!data.fullName || !data.email || !data.phone || !data.specialization || !data.department) {
      throw new HttpException("fullName, email, phone, specialization and department are required", 400);
    }
    const existing = await repo.findByEmail(data.email);
    if (existing) throw new HttpException("Doctor with this email already exists", 400);
    return repo.create(data);
  }

  async updateDoctor(id: string, data: UpdateDoctorDTO) {
    const doctor = await repo.findById(id);
    if (!doctor) throw new HttpException("Doctor not found", 404);
    if (data.email && data.email !== doctor.email) {
      const existing = await repo.findByEmail(data.email);
      if (existing) throw new HttpException("Doctor with this email already exists", 400);
    }
    if (data.rating !== undefined && (!Number.isFinite(data.rating) || data.rating < 0 || data.rating > 5)) {
      throw new HttpException("Rating must be between 0 and 5", 400);
    }
    if (data.experience !== undefined && (!Number.isFinite(data.experience) || data.experience < 0)) {
      throw new HttpException("Experience must be 0 or greater", 400);
    }
    return repo.update(id, data);
  }

  async deleteDoctor(id: string) {
    const doctor = await repo.findById(id);
    if (!doctor) throw new HttpException("Doctor not found", 404);
    await repo.delete(id);
    return { message: "Doctor deleted successfully" };
  }
}
