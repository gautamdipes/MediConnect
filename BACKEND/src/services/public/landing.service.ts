import { HospitalModel } from "../../models/hospital.model";
import { DoctorModel } from "../../models/doctor.model";
import { AppointmentModel } from "../../models/appointment.model";

export class PublicLandingService {
  async getLandingData() {
    const [
      hospitalTotal,
      verifiedHospitals,
      doctorTotal,
      activeDoctors,
      appointmentTotal,
      hospitals,
      doctors,
    ] = await Promise.all([
      HospitalModel.countDocuments({}),
      HospitalModel.countDocuments({ status: "VERIFIED" }),
      DoctorModel.countDocuments({}),
      DoctorModel.countDocuments({ status: "ACTIVE" }),
      AppointmentModel.countDocuments({}),
      HospitalModel.find({ status: { $in: ["VERIFIED", "PENDING"] } })
        .sort({ rating: -1, doctorsCount: -1 })
        .limit(6)
        .select("hospitalName city state departments doctorsCount rating emergency type image status"),
      DoctorModel.find({ status: "ACTIVE" })
        .sort({ rating: -1, experience: -1 })
        .limit(6)
        .select("fullName specialization department hospitalName experience rating profileImage"),
    ]);

    return {
      stats: {
        hospitals: hospitalTotal,
        verifiedHospitals,
        doctors: doctorTotal,
        activeDoctors,
        appointments: appointmentTotal,
      },
      hospitals,
      doctors,
    };
  }
}
