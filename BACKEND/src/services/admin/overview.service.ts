import { UserModel } from "../../models/user.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";
import { AppointmentModel } from "../../models/appointment.model";

export class AdminOverviewService {
  async getOverviewStats() {
    const totalUsers = await UserModel.countDocuments({ role: "user" });
    const totalDoctors = await DoctorModel.countDocuments();
    const totalHospitals = await HospitalModel.countDocuments();
    const totalAppointments = await AppointmentModel.countDocuments();

    // Fetch some recent activities (e.g., last 5 appointments)
    const recentAppointments = await AppointmentModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patientId", "fullName")
      .populate("doctorId", "fullName specialization");

    return {
      stats: {
        totalUsers,
        totalDoctors,
        totalHospitals,
        totalAppointments,
      },
      recentActivities: recentAppointments,
    };
  }
}
