import { AppointmentModel } from "../../models/appointment.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";

export class UserOverviewService {
  /**
   * Get overview stats for a specific patient.
   * Returns total appointment count and upcoming appointments.
   */
  async getOverview(userId: string) {
    const totalAppointments = await AppointmentModel.countDocuments({ patientId: userId });
    const upcomingAppointments = await AppointmentModel.find({
      patientId: userId,
      date: { $gte: new Date() },
      status: { $ne: "CANCELLED" },
    })
      .sort({ date: 1 })
      .limit(5)
      .populate("doctorId", "fullName")
      .populate("hospitalId", "hospitalName");

    return {
      stats: { totalAppointments },
      upcoming: upcomingAppointments,
    };
  }
}
