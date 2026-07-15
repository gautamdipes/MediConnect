import { AppointmentModel } from "../../models/appointment.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";

const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "EMERGENCY"] as const;

function dateRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function monthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function formatAppointment(appointment: any) {
  return {
    _id: appointment._id,
    patient: {
      _id: appointment.patientId?._id || null,
      fullName: appointment.patientId?.fullName || appointment.patientName || "Unknown patient",
    },
    doctor: {
      _id: appointment.doctorId?._id || null,
      fullName: appointment.doctorId?.fullName || appointment.doctorName || "Unassigned doctor",
      specialization: appointment.doctorId?.specialization || null,
    },
    date: appointment.date,
    time: appointment.time,
    reason: appointment.reason,
    status: appointment.status,
  };
}

export class HospitalDashboardService {
  async getOverview(hospitalId: string) {
    const now = new Date();
    const today = dateRange(now);
    const month = monthRange(now);
    const appointmentFilter = { hospitalId };
    const activeAppointmentFilter = { ...appointmentFilter, status: { $ne: "CANCELLED" as const } };

    const [
      hospital,
      todayAppointments,
      upcomingAppointments,
      recentAppointments,
      hospitalDoctors,
      totalPatientIds,
      monthlyAppointmentCount,
      monthlyStatusCounts,
    ] = await Promise.all([
      HospitalModel.findById(hospitalId).select("hospitalName email phoneNumber city state departments status emergency"),
      AppointmentModel.find({
        ...appointmentFilter,
        date: { $gte: today.start, $lt: today.end },
      })
        .sort({ time: 1 })
        .populate("patientId", "fullName")
        .populate("doctorId", "fullName specialization"),
      AppointmentModel.find({
        ...activeAppointmentFilter,
        date: { $gte: today.end },
      })
        .sort({ date: 1, time: 1 })
        .limit(5)
        .populate("patientId", "fullName")
        .populate("doctorId", "fullName specialization"),
      AppointmentModel.find(appointmentFilter)
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("patientId", "fullName")
        .populate("doctorId", "fullName specialization"),
      DoctorModel.find({ hospitalId }).select("department status"),
      AppointmentModel.distinct("patientId", activeAppointmentFilter),
      AppointmentModel.countDocuments({
        ...appointmentFilter,
        date: { $gte: month.start, $lt: month.end },
      }),
      Promise.all(
        APPOINTMENT_STATUSES.map(async (status): Promise<[string, number]> => [
          status,
          await AppointmentModel.countDocuments({
            ...appointmentFilter,
            date: { $gte: month.start, $lt: month.end },
            status,
          }),
        ])
      ),
    ]);

    if (!hospital) {
      throw { status: 404, message: "Hospital not found" };
    }

    const todayPatientCount = new Set(
      todayAppointments
        .filter((appointment) => appointment.status !== "CANCELLED")
        .map((appointment: any) => String(appointment.patientId?._id || appointment.patientId || appointment.patientName || appointment._id))
    ).size;

    const statusCounts = Object.fromEntries(monthlyStatusCounts) as Record<string, number>;
    const activeDoctors = hospitalDoctors.filter((doctor) => doctor.status === "ACTIVE").length;
    const departmentMap = new Map<string, { totalDoctors: number; availableDoctors: number }>();
    hospitalDoctors.forEach((doctor) => {
      const department = doctor.department || "Unassigned";
      const current = departmentMap.get(department) || { totalDoctors: 0, availableDoctors: 0 };
      current.totalDoctors += 1;
      if (doctor.status === "ACTIVE") current.availableDoctors += 1;
      departmentMap.set(department, current);
    });
    const emergencyRequests = todayAppointments
      .filter((appointment) => appointment.status === "EMERGENCY")
      .map(formatAppointment);

    return {
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email,
        phoneNumber: hospital.phoneNumber,
        city: hospital.city,
        state: hospital.state,
        departments: hospital.departments,
        status: hospital.status,
        emergency: hospital.emergency,
      },
      stats: {
        todayAppointments: todayAppointments.length,
        patientsScheduledToday: todayPatientCount,
        availableDoctors: activeDoctors,
        totalDoctors: hospitalDoctors.length,
        totalPatients: totalPatientIds.length,
        bedOccupancy: null,
        availableBeds: null,
      },
      appointments: {
        today: todayAppointments.map(formatAppointment),
        upcoming: upcomingAppointments.map(formatAppointment),
        thisMonth: {
          total: monthlyAppointmentCount,
          byStatus: statusCounts,
        },
      },
      doctors: {
        active: activeDoctors,
        total: hospitalDoctors.length,
        departments: Array.from(departmentMap, ([department, values]) => ({ department, ...values })),
      },
      emergency: {
        requests: emergencyRequests,
        ambulanceRequests: [],
      },
      recentActivity: recentAppointments.map((appointment: any) => ({
        type: "appointment",
        occurredAt: appointment.updatedAt || appointment.createdAt,
        appointment: formatAppointment(appointment),
      })),
      unavailableMetrics: ["admissionsThisMonth", "bedOccupancy", "availableBeds", "ambulanceRequests"],
    };
  }
}
