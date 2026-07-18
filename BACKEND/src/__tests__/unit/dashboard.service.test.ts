import { HospitalDashboardService } from "../../services/hospital/dashboard.service";
import { HospitalModel } from "../../models/hospital.model";
import { AppointmentModel } from "../../models/appointment.model";
import { DoctorModel } from "../../models/doctor.model";
import { clearDatabase } from "../test-utils";
import mongoose from "mongoose";

describe("HospitalDashboardService Unit Tests", () => {
  const service = new HospitalDashboardService();
  let hospitalId: string;

  beforeEach(async () => {
    await clearDatabase();
    const hospital = await HospitalModel.create({
      hospitalName: "Test Hospital",
      email: "hospital@example.com",
      phoneNumber: "1234567890",
      city: "Test City",
      state: "Test State",
      departments: ["General"],
      status: "VERIFIED",
    });
    hospitalId = String(hospital._id);
  });

  afterAll(async () => {
    await clearDatabase();
  });

  function todayISO() {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }

  test("getOverview – 404 when hospital missing", async () => {
    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.getOverview(bogusId)).rejects.toMatchObject({ status: 404 });
  });

  test("getOverview – returns hospital info and empty stats", async () => {
    const overview = await service.getOverview(hospitalId);
    expect(overview.hospital.hospitalName).toBe("Test Hospital");
    expect(overview.stats.todayAppointments).toBe(0);
    expect(overview.stats.totalPatients).toBe(0);
    expect(overview.appointments.today).toEqual([]);
  });

  test("getOverview – counts today's appointments and patients", async () => {
    const patientId = new mongoose.Types.ObjectId();
    await AppointmentModel.create({ hospitalId, patientId, patientName: "P1", date: todayISO(), time: "09:00", reason: "R", status: "PENDING" });
    await AppointmentModel.create({ hospitalId, patientId, patientName: "P1", date: todayISO(), time: "10:00", reason: "R", status: "CONFIRMED" });
    await AppointmentModel.create({ hospitalId, patientId: new mongoose.Types.ObjectId(), patientName: "P2", date: todayISO(), time: "11:00", reason: "R", status: "CANCELLED" });

    const overview = await service.getOverview(hospitalId);
    expect(overview.stats.todayAppointments).toBe(3);
    expect(overview.stats.patientsScheduledToday).toBe(1);
    expect(overview.stats.totalPatients).toBe(1);
  });

  test("getOverview – monthly status counts", async () => {
    const patientId = new mongoose.Types.ObjectId();
    await AppointmentModel.create({ hospitalId, patientId, date: todayISO(), time: "09:00", reason: "R", status: "EMERGENCY" });
    await AppointmentModel.create({ hospitalId, patientId, date: todayISO(), time: "10:00", reason: "R", status: "CONFIRMED" });

    const overview = await service.getOverview(hospitalId);
    expect(overview.appointments.thisMonth.byStatus.EMERGENCY).toBe(1);
    expect(overview.appointments.thisMonth.byStatus.CONFIRMED).toBe(1);
  });

  test("getOverview – doctor department aggregation", async () => {
    await DoctorModel.create({
      fullName: "Dr. A",
      email: "a@example.com",
      phone: "1",
      specialization: "Cardiology",
      department: "Cardiology",
      hospitalId: new mongoose.Types.ObjectId(hospitalId),
      status: "ACTIVE",
    });
    await DoctorModel.create({
      fullName: "Dr. B",
      email: "b@example.com",
      phone: "1",
      specialization: "Neurology",
      department: "Neurology",
      hospitalId: new mongoose.Types.ObjectId(hospitalId),
      status: "ON_LEAVE",
    });

    const overview = await service.getOverview(hospitalId);
    expect(overview.doctors.total).toBe(2);
    expect(overview.doctors.active).toBe(1);
    expect(overview.doctors.departments).toHaveLength(2);
  });
});
