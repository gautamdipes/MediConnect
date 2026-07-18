import { ChatService } from "../../services/user/chat.service";
import { UserModel } from "../../models/user.model";
import { AppointmentModel } from "../../models/appointment.model";
import { MedicalRecordModel } from "../../models/medical-record.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";
import { clearDatabase } from "../test-utils";
import mongoose from "mongoose";

jest.mock("../../services/gemini.client", () => ({
  generateGeminiText: jest.fn().mockResolvedValue("AI reply"),
}));

describe("ChatService Unit Tests", () => {
  const service = new ChatService();
  let userId: string;

  beforeEach(async () => {
    await clearDatabase();
    const user = await UserModel.create({ fullName: "Pat", email: "pat@example.com", password: "Password123!" });
    userId = String(user._id);
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe("buildPatientContext", () => {
    test("returns profile and empty arrays when no data", async () => {
      const ctx = await service.buildPatientContext(userId);
      expect(ctx.profile.fullName).toBe("Pat");
      expect(ctx.profile.email).toBe("pat@example.com");
      expect(ctx.appointments).toEqual([]);
      expect(ctx.medicalRecords).toEqual([]);
    });

    test("404 when user missing", async () => {
      const bogusId = new mongoose.Types.ObjectId().toHexString();
      await expect(service.buildPatientContext(bogusId)).rejects.toMatchObject({ status: 404 });
    });

    test("includes appointments, records, doctors, hospitals", async () => {
      const doctor = await DoctorModel.create({
        fullName: "Dr. X",
        email: "dx@example.com",
        phone: "1",
        specialization: "Cardiology",
        department: "Cardiology",
        status: "ACTIVE",
      });
      const hospital = await HospitalModel.create({ hospitalName: "H1", email: "h1@example.com", phoneNumber: "123", city: "C", state: "S", departments: ["General"], status: "VERIFIED" });
      await AppointmentModel.create({ patientId: new mongoose.Types.ObjectId(userId), doctorId: doctor._id, hospitalId: hospital._id, date: new Date(), time: "10:00", reason: "R", status: "PENDING" });
      await MedicalRecordModel.create({ patientId: new mongoose.Types.ObjectId(userId), recordName: "X-Ray", diagnosis: "None", prescription: "None", dept: "Radiology", status: "VERIFIED" });

      const ctx = await service.buildPatientContext(userId);
      expect(ctx.appointments).toHaveLength(1);
      expect(ctx.medicalRecords).toHaveLength(1);
      expect(ctx.doctors.length).toBeGreaterThan(0);
      expect(ctx.hospitals.length).toBeGreaterThan(0);
    });
  });

  describe("scopeContext", () => {
    const baseContext = {
      profile: { fullName: "Pat", email: "pat@example.com" },
      appointments: [{ id: "a1" }],
      medicalRecords: [{ id: "r1" }],
      doctors: [{ fullName: "Dr. Heart", specialization: "Cardiology" }],
      hospitals: [{ hospitalName: "City Hospital", city: "Metropolis" }],
    };

    test("list_my_appointments scopes to my appointments", () => {
      const scoped = service.scopeContext(baseContext as any, "list_my_appointments", "show my appointments");
      expect((scoped as any).myAppointments).toHaveLength(1);
    });

    test("medical_records scopes to my records", () => {
      const scoped = service.scopeContext(baseContext as any, "medical_records", "show my records");
      expect((scoped as any).myMedicalRecords).toHaveLength(1);
    });

    test("find_doctor matches by specialty hint", () => {
      const scoped = service.scopeContext(baseContext as any, "find_doctor", "find cardiology doctor");
      expect((scoped as any).availableDoctors[0].specialization).toBe("Cardiology");
    });

    test("find_hospital matches by city hint", () => {
      const scoped = service.scopeContext(baseContext as any, "find_hospital", "hospital in Metropolis");
      expect((scoped as any).availableHospitals[0].hospitalName).toBe("City Hospital");
    });

    test("book_appointment scopes available doctors and hospitals", () => {
      const scoped = service.scopeContext(baseContext as any, "book_appointment", "book an appointment");
      expect((scoped as any).availableDoctors).toBeDefined();
      expect((scoped as any).availableHospitals).toBeDefined();
    });
  });
});
