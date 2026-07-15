import { AppointmentModel } from "../../models/appointment.model";
import { MedicalRecordModel } from "../../models/medical-record.model";
import { UserModel } from "../../models/user.model";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializePatient(patient: any) {
  return {
    _id: patient._id,
    fullName: patient.fullName,
    email: patient.email,
    phoneNumber: patient.phoneNumber || null,
    dob: patient.dob || null,
    address: patient.address || null,
    gender: patient.gender || null,
    profileImage: patient.profileImage || null,
  };
}

export class HospitalPatientService {
  async listPatients(
    hospitalId: string,
    query: { page?: number; limit?: number; search?: string }
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const search = query.search?.trim();

    const patientIds = await AppointmentModel.distinct("patientId", {
      hospitalId,
      patientId: { $ne: null },
      status: { $ne: "CANCELLED" as const },
    });

    const filter: Record<string, unknown> = {
      _id: { $in: patientIds },
      role: "user",
    };

    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ fullName: pattern }, { email: pattern }, { phoneNumber: pattern }];
    }

    const [total, patients] = await Promise.all([
      UserModel.countDocuments(filter),
      UserModel.find(filter)
        .select("fullName email phoneNumber dob address gender profileImage")
        .sort({ fullName: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const pagePatientIds = patients.map((patient) => patient._id);
    const appointments = await AppointmentModel.find({
      hospitalId,
      patientId: { $in: pagePatientIds },
      status: { $ne: "CANCELLED" as const },
    })
      .select("patientId date time reason status doctorId doctorName")
      .sort({ date: -1, time: -1 })
      .populate("doctorId", "fullName specialization");

    const appointmentSummary = new Map<string, { appointmentCount: number; latestAppointment: unknown }>();
    appointments.forEach((appointment: any) => {
      const patientId = String(appointment.patientId);
      const current = appointmentSummary.get(patientId);
      const latestAppointment = {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        doctor: {
          _id: appointment.doctorId?._id || null,
          fullName: appointment.doctorId?.fullName || appointment.doctorName || "Unassigned doctor",
          specialization: appointment.doctorId?.specialization || null,
        },
      };

      appointmentSummary.set(patientId, {
        appointmentCount: (current?.appointmentCount || 0) + 1,
        latestAppointment: current?.latestAppointment || latestAppointment,
      });
    });

    return {
      patients: patients.map((patient) => {
        const summary = appointmentSummary.get(String(patient._id));
        return {
          ...serializePatient(patient),
          appointmentCount: summary?.appointmentCount || 0,
          latestAppointment: summary?.latestAppointment || null,
        };
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPatientDetails(hospitalId: string, patientId: string) {
    const hasHospitalRelationship = await AppointmentModel.exists({
      hospitalId,
      patientId,
      status: { $ne: "CANCELLED" as const },
    });

    if (!hasHospitalRelationship) {
      throw { status: 404, message: "Patient not found for this hospital" };
    }

    const [patient, appointments, medicalRecords] = await Promise.all([
      UserModel.findOne({ _id: patientId, role: "user" })
        .select("fullName email phoneNumber dob address gender profileImage"),
      AppointmentModel.find({ hospitalId, patientId })
        .select("date time reason status doctorId doctorName")
        .sort({ date: -1, time: -1 })
        .populate("doctorId", "fullName specialization"),
      MedicalRecordModel.find({ hospitalId, patientId })
        .select("recordName diagnosis prescription dept status format date doctorId attachments")
        .sort({ date: -1 })
        .populate("doctorId", "fullName specialization"),
    ]);

    if (!patient) {
      throw { status: 404, message: "Patient not found" };
    }

    return {
      patient: serializePatient(patient),
      appointments: appointments.map((appointment: any) => ({
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        doctor: {
          _id: appointment.doctorId?._id || null,
          fullName: appointment.doctorId?.fullName || appointment.doctorName || "Unassigned doctor",
          specialization: appointment.doctorId?.specialization || null,
        },
      })),
      medicalRecords: medicalRecords.map((record: any) => ({
        _id: record._id,
        recordName: record.recordName || "Medical record",
        diagnosis: record.diagnosis,
        prescription: record.prescription,
        department: record.dept,
        status: record.status,
        format: record.format,
        date: record.date,
        attachments: record.attachments,
        doctor: {
          _id: record.doctorId?._id || null,
          fullName: record.doctorId?.fullName || "Unassigned doctor",
          specialization: record.doctorId?.specialization || null,
        },
      })),
    };
  }
}
