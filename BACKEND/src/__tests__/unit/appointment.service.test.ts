import { HospitalAppointmentService } from "../../services/hospital/appointment.service";
import { HospitalNotificationModel } from "../../models/hospital-notification.model";
import { AppointmentModel } from "../../models/appointment.model";
import { HospitalModel } from "../../models/hospital.model";
import { clearDatabase } from "../test-utils";
import mongoose from "mongoose";

describe("HospitalAppointmentService Unit Tests", () => {
  let service: HospitalAppointmentService;
  let hospitalId: string;

  beforeAll(() => {
    service = new HospitalAppointmentService();
  });

  beforeEach(async () => {
    await clearDatabase();
    const hospital = await HospitalModel.create({
      hospitalName: "Test Hospital",
      email: "hospital@example.com",
      phoneNumber: "1234567890",
      city: "Test City",
      state: "Test State",
      departments: ["General"],
    });
    hospitalId = String(hospital._id);
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("create - successfully creates an appointment and generates a notification", async () => {
    const payload = {
      patientName: "John Smith",
      doctorName: "Dr. Gregory House",
      time: "10:30 AM",
      reason: "Leg pain checkup",
      date: "2026-08-15"
    };

    const res = await service.create(hospitalId, payload);
    expect(res.appointment).toBeDefined();
    expect(res.appointment._id).toBeDefined();
    expect(res.appointment.patientName).toBe("John Smith");
    expect(res.appointment.doctorName).toBe("Dr. Gregory House");
    expect(res.appointment.time).toBe("10:30 AM");
    expect(res.appointment.status).toBe("PENDING");

    // Check notification
    const notification = await HospitalNotificationModel.findOne({ hospitalId });
    expect(notification).toBeDefined();
    expect(notification?.title).toBe("New appointment booked");
    expect(notification?.detail).toContain("John Smith");
  });

  test("create - throws 400 when missing required fields", async () => {
    // Missing doctorName
    await expect(
      service.create(hospitalId, {
        patientName: "John Smith",
        time: "10:30 AM"
      })
    ).rejects.toMatchObject({ status: 400, message: "Patient, doctor, and time are required" });

    // Missing patientName
    await expect(
      service.create(hospitalId, {
        doctorName: "Dr. Gregory House",
        time: "10:30 AM"
      })
    ).rejects.toMatchObject({ status: 400, message: "Patient, doctor, and time are required" });

    // Missing time
    await expect(
      service.create(hospitalId, {
        patientName: "John Smith",
        doctorName: "Dr. Gregory House"
      })
    ).rejects.toMatchObject({ status: 400, message: "Patient, doctor, and time are required" });
  });

  test("list - returns all appointments for a hospital", async () => {
    await service.create(hospitalId, {
      patientName: "John Smith",
      doctorName: "Dr. Gregory House",
      time: "10:30 AM"
    });
    await service.create(hospitalId, {
      patientName: "Jane Doe",
      doctorName: "Dr. John Watson",
      time: "11:00 AM"
    });
    // Create one for a different hospital
    const otherHospitalId = new mongoose.Types.ObjectId().toHexString();
    await service.create(otherHospitalId, {
      patientName: "Molly Hooper",
      doctorName: "Dr. John Watson",
      time: "11:30 AM"
    });

    const res = await service.list(hospitalId, {});
    expect(res.appointments).toHaveLength(2);
    const names = res.appointments.map((a: any) => a.patientName);
    expect(names).toContain("John Smith");
    expect(names).toContain("Jane Doe");
    expect(names).not.toContain("Molly Hooper");
  });

  test("list - filters by status parameter", async () => {
    const app1 = await service.create(hospitalId, {
      patientName: "John Smith",
      doctorName: "Dr. Gregory House",
      time: "10:30 AM"
    });
    const app2 = await service.create(hospitalId, {
      patientName: "Jane Doe",
      doctorName: "Dr. John Watson",
      time: "11:00 AM"
    });

    await service.updateStatus(hospitalId, app2.appointment._id.toString(), "CONFIRMED");

    const pendingRes = await service.list(hospitalId, { status: "PENDING" });
    expect(pendingRes.appointments).toHaveLength(1);
    expect(pendingRes.appointments[0].patientName).toBe("John Smith");

    const confirmedRes = await service.list(hospitalId, { status: "CONFIRMED" });
    expect(confirmedRes.appointments).toHaveLength(1);
    expect(confirmedRes.appointments[0].patientName).toBe("Jane Doe");
  });

  test("list - filters by search query matching patientName, doctorName, or reason", async () => {
    await service.create(hospitalId, {
      patientName: "Sherlock Holmes",
      doctorName: "Dr. Gregory House",
      time: "10:00 AM",
      reason: "Consultation"
    });
    await service.create(hospitalId, {
      patientName: "Jane Doe",
      doctorName: "Dr. John Watson",
      time: "11:00 AM",
      reason: "Headache"
    });

    // Search by patient name
    const searchPatient = await service.list(hospitalId, { search: "Sherlock" });
    expect(searchPatient.appointments).toHaveLength(1);
    expect(searchPatient.appointments[0].patientName).toBe("Sherlock Holmes");

    // Search by doctor name
    const searchDoctor = await service.list(hospitalId, { search: "Watson" });
    expect(searchDoctor.appointments).toHaveLength(1);
    expect(searchDoctor.appointments[0].patientName).toBe("Jane Doe");

    // Search by reason
    const searchReason = await service.list(hospitalId, { search: "Headache" });
    expect(searchReason.appointments).toHaveLength(1);
    expect(searchReason.appointments[0].patientName).toBe("Jane Doe");
  });

  test("updateStatus - updates status and generates check-in notification for COMPLETED status", async () => {
    const created = await service.create(hospitalId, {
      patientName: "Jane Doe",
      doctorName: "Dr. John Watson",
      time: "11:00 AM"
    });

    const updated = await service.updateStatus(hospitalId, created.appointment._id.toString(), "COMPLETED");
    expect(updated.appointment.status).toBe("COMPLETED");

    // Verify check-in notification is generated
    const checkinNotification = await HospitalNotificationModel.findOne({
      hospitalId,
      type: "check-in"
    });
    expect(checkinNotification).toBeDefined();
    expect(checkinNotification?.title).toBe("Patient checked in");
    expect(checkinNotification?.detail).toContain("Jane Doe");
  });

  test("updateStatus - throws 400 for invalid status", async () => {
    const created = await service.create(hospitalId, {
      patientName: "Jane Doe",
      doctorName: "Dr. John Watson",
      time: "11:00 AM"
    });

    await expect(
      service.updateStatus(hospitalId, created.appointment._id.toString(), "BOGUS_STATUS")
    ).rejects.toMatchObject({ status: 400, message: "Invalid appointment status" });
  });

  test("updateStatus - throws 404 for non-existent appointment", async () => {
    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(
      service.updateStatus(hospitalId, bogusId, "CONFIRMED")
    ).rejects.toMatchObject({ status: 404, message: "Appointment not found" });
  });
});
