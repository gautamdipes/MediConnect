import { AdminOverviewService } from "../../services/admin/overview.service";
import { UserModel } from "../../models/user.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";
import { AppointmentModel } from "../../models/appointment.model";
import { clearDatabase } from "../test-utils";

describe("AdminOverviewService Unit Tests", () => {
  const service = new AdminOverviewService();

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("getOverviewStats – returns counts and recent activities", async () => {
    await UserModel.create({ fullName: "U1", email: "u1@example.com", role: "user", password: "x" });
    await UserModel.create({ fullName: "Admin", email: "a@example.com", role: "admin", password: "x" });
    await DoctorModel.create({
      fullName: "Dr. X",
      email: "dx@example.com",
      phone: "1",
      specialization: "Cardiology",
      department: "Cardiology",
      status: "ACTIVE",
    });
    await HospitalModel.create({ hospitalName: "H1", email: "h1@example.com", phoneNumber: "123", city: "C", state: "S", departments: ["General"] });
    await AppointmentModel.create({ patientId: new (require("mongoose").Types.ObjectId)(), date: new Date(), time: "10:00", reason: "R", status: "PENDING" });

    const result = await service.getOverviewStats();
    expect(result.stats.totalUsers).toBe(1);
    expect(result.stats.totalDoctors).toBe(1);
    expect(result.stats.totalHospitals).toBe(1);
    expect(result.stats.totalAppointments).toBe(1);
    expect(result.recentActivities).toHaveLength(1);
  });

  test("getOverviewStats – zeroes when empty", async () => {
    const result = await service.getOverviewStats();
    expect(result.stats).toEqual({
      totalUsers: 0,
      totalDoctors: 0,
      totalHospitals: 0,
      totalAppointments: 0,
    });
    expect(result.recentActivities).toEqual([]);
  });
});
