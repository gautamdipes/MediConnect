import { AppointmentModel } from "../../models/appointment.model";
import { DoctorModel } from "../../models/doctor.model";
import { MedicalRecordModel } from "../../models/medical-record.model";
import { HospitalNotificationService } from "../hospital/notification.service";

export class UserAppointmentService {
  private notificationService = new HospitalNotificationService();

  /** List all appointments for a patient */
  async listAppointments(userId: string, query: { status?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { patientId: userId };
    if (query.status) filter.status = query.status;

    const appointments = await AppointmentModel.find(filter)
      .populate("doctorId", "fullName specialization profileImage")
      .populate("hospitalId", "hospitalName city")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AppointmentModel.countDocuments(filter);
    return { appointments, total, page, totalPages: Math.ceil(total / limit) };
  }

  /** Book a new appointment */
  async createAppointment(userId: string, data: any) {
    const { doctorId, hospitalId, ...rest } = data;
    if (!doctorId) {
      throw { status: 400, message: "doctorId is required" };
    }

    const doctor = await DoctorModel.findById(doctorId).select("hospitalId hospitalName");
    if (!doctor) {
      throw { status: 404, message: "Doctor not found" };
    }

    const doctorHospitalId = doctor.hospitalId?.toString();
    // Store every user booking against the selected hospital (or the doctor's
    // hospital when a selection is unavailable). Hospital portal queries are
    // scoped by this field, so a Bir Hospital booking is visible only to Bir.
    const appointmentHospitalId = hospitalId || doctorHospitalId;
    if (!appointmentHospitalId) {
      throw { status: 400, message: "Please select a hospital for this appointment" };
    }

    const payload: Record<string, unknown> = {
      ...rest,
      patientId: userId,
      doctorId,
      hospitalId: appointmentHospitalId,
      hospitalName: data.hospitalName || doctor.hospitalName,
    };

    const appointment = await AppointmentModel.create(payload);
    await this.notificationService.create(String(appointmentHospitalId), {
      title: "New appointment booked",
      detail: `${data.patientName || "A patient"} · ${appointment.time}`,
      type: "appointment",
    });
    return appointment;
  }

  /** Cancel an appointment (only if owned by patient) */
  async cancelAppointment(userId: string, appointmentId: string) {
    const appointment = await AppointmentModel.findOneAndUpdate(
      { _id: appointmentId, patientId: userId },
      { status: "CANCELLED" },
      { new: true }
    );
    if (!appointment) throw { status: 404, message: "Appointment not found or unauthorized" };
    return appointment;
  }

  /** Get full dashboard overview stats */
  async getDashboardOverview(userId: string) {
    const now = new Date();

    const [
      totalAppointments,
      upcomingAppointments,
      totalRecords,
      activeDoctors,
    ] = await Promise.all([
      AppointmentModel.countDocuments({ patientId: userId }),
      AppointmentModel.find({ patientId: userId, date: { $gte: now }, status: { $nin: ["CANCELLED"] } })
        .sort({ date: 1 })
        .limit(3)
        .populate("doctorId", "fullName specialization profileImage")
        .populate("hospitalId", "hospitalName city"),
      MedicalRecordModel.countDocuments({ patientId: userId }),
      DoctorModel.countDocuments({ status: "ACTIVE" }),
    ]);

    return {
      stats: {
        totalAppointments,
        upcomingCount: upcomingAppointments.length,
        totalRecords,
        activeDoctors,
      },
      upcomingAppointments,
    };
  }
}
