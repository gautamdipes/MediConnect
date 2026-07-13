import { AppointmentModel } from "../../models/appointment.model";

export class AdminAppointmentService {
  async listAppointments(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }

    const appointments = await AppointmentModel.find(filter)
      .populate("patientId", "fullName email")
      .populate("doctorId", "fullName specialization")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AppointmentModel.countDocuments(filter);

    return {
      appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAppointment(id: string) {
    const appointment = await AppointmentModel.findById(id)
      .populate("patientId", "fullName email phone")
      .populate("doctorId", "fullName specialization");
    
    if (!appointment) {
      throw { status: 404, message: "Appointment not found" };
    }
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: string) {
    const appointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!appointment) {
      throw { status: 404, message: "Appointment not found" };
    }
    return appointment;
  }

  async deleteAppointment(id: string) {
    const appointment = await AppointmentModel.findByIdAndDelete(id);
    if (!appointment) {
      throw { status: 404, message: "Appointment not found" };
    }
    return { message: "Appointment deleted successfully" };
  }
}
