import { PublicLandingService } from "../../services/public/landing.service";
import { HospitalModel } from "../../models/hospital.model";
import { DoctorModel } from "../../models/doctor.model";
import { AppointmentModel } from "../../models/appointment.model";
import { clearDatabase } from "../test-utils";

describe("PublicLandingService Unit Tests", () => {
  const service = new PublicLandingService();

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("getLandingData – returns aggregated stats", async () => {
    await HospitalModel.create({ hospitalName: "H1", email: "h1@example.com", phoneNumber: "123", city: "C", state: "S", departments: ["General"], status: "VERIFIED" });
    await HospitalModel.create({ hospitalName: "H2", email: "h2@example.com", phoneNumber: "123", city: "C", state: "S", departments: ["General"], status: "PENDING" });
    await DoctorModel.create({
      fullName: "Dr. X",
      email: "dx@example.com",
      phone: "1",
      specialization: "Cardiology",
      department: "Cardiology",
      status: "ACTIVE",
    });
    await AppointmentModel.create({ patientId: new (require("mongoose").Types.ObjectId)(), date: new Date(), time: "10:00", reason: "R", status: "PENDING" });

    const data = await service.getLandingData();
    expect(data.stats.hospitals).toBe(2);
    expect(data.stats.verifiedHospitals).toBe(1);
    expect(data.stats.doctors).toBe(1);
    expect(data.stats.activeDoctors).toBe(1);
    expect(data.stats.appointments).toBe(1);
    expect(data.hospitals.length).toBeGreaterThan(0);
    expect(data.doctors.length).toBeGreaterThan(0);
  });

  test("getLandingData – zeros when empty", async () => {
    const data = await service.getLandingData();
    expect(data.stats.hospitals).toBe(0);
    expect(data.hospitals).toEqual([]);
    expect(data.doctors).toEqual([]);
  });
});
