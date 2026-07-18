import { AdminDoctorService } from "../../services/admin/doctor.service";
import { DoctorModel } from "../../models/doctor.model";
import { clearDatabase } from "../test-utils";
import { HttpException } from "../../exceptions/http-exception";
import mongoose from "mongoose";

describe("AdminDoctorService Unit Tests", () => {
  const service = new AdminDoctorService();
  const baseDoctor = {
    fullName: "Dr. Alice",
    email: "alice@example.com",
    phone: "1234567890",
    specialization: "Cardiology",
    department: "Cardiology",
    experience: 5,
    rating: 4.5,
    status: "ACTIVE" as const,
  };

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("createDoctor – success", async () => {
    const created = await service.createDoctor(baseDoctor);
    expect(created._id).toBeDefined();
    expect(created.fullName).toBe(baseDoctor.fullName);
  });

  test("createDoctor – missing required fields throws 400", async () => {
    await expect(service.createDoctor({ email: "x@example.com" } as any)).rejects.toBeInstanceOf(HttpException);
    await expect(service.createDoctor({ email: "x@example.com" } as any)).rejects.toMatchObject({ status: 400 });
  });

  test("createDoctor – duplicate email throws 400", async () => {
    await service.createDoctor(baseDoctor);
    await expect(service.createDoctor(baseDoctor)).rejects.toMatchObject({ status: 400 });
  });

  test("listDoctors – pagination works", async () => {
    for (let i = 0; i < 15; i++) {
      await service.createDoctor({ ...baseDoctor, email: `doc${i}@example.com`, fullName: `Doc ${i}` });
    }
    const result = await service.listDoctors({ page: 2, limit: 5 });
    expect(result.meta.page).toBe(2);
    expect(result.meta.total).toBe(15);
    expect(result.meta.totalPages).toBe(3);
    expect(result.data).toHaveLength(5);
  });

  test("listDoctors – search filters by name", async () => {
    await service.createDoctor(baseDoctor);
    await service.createDoctor({ ...baseDoctor, email: "bob@example.com", fullName: "Dr. Bob", specialization: "Neurology" });
    const result = await service.listDoctors({ search: "Alice" });
    expect(result.meta.total).toBe(1);
    expect(result.data[0].fullName).toBe("Dr. Alice");
  });

  test("getStats – aggregates counts and average rating", async () => {
    await service.createDoctor({ ...baseDoctor, email: "a@example.com", rating: 4, status: "ACTIVE" });
    await service.createDoctor({ ...baseDoctor, email: "b@example.com", rating: 2, status: "ON_LEAVE" });
    await service.createDoctor({ ...baseDoctor, email: "c@example.com", rating: 5, status: "EMERGENCY" });
    const stats = await service.getStats();
    expect(stats.total).toBe(3);
    expect(stats.active).toBe(1);
    expect(stats.onLeave).toBe(1);
    expect(stats.emergency).toBe(1);
    expect(stats.avgRating).toBe(3.7);
  });

  test("getDoctor – found", async () => {
    const created = await service.createDoctor(baseDoctor);
    const fetched = await service.getDoctor(String(created._id));
    expect(fetched.fullName).toBe(baseDoctor.fullName);
  });

  test("getDoctor – not found throws 404", async () => {
    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.getDoctor(bogusId)).rejects.toBeInstanceOf(HttpException);
    await expect(service.getDoctor(bogusId)).rejects.toMatchObject({ status: 404 });
  });

  test("updateDoctor – updates fields", async () => {
    const created = await service.createDoctor(baseDoctor);
    const updated = await service.updateDoctor(String(created._id), { status: "ON_LEAVE" });
    expect(updated!.status).toBe("ON_LEAVE");
  });

  test("updateDoctor – invalid rating throws 400", async () => {
    const created = await service.createDoctor(baseDoctor);
    await expect(service.updateDoctor(String(created._id), { rating: 9 } as any)).rejects.toMatchObject({ status: 400 });
  });

  test("updateDoctor – not found throws 404", async () => {
    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.updateDoctor(bogusId, { fullName: "X" } as any)).rejects.toMatchObject({ status: 404 });
  });

  test("deleteDoctor – success", async () => {
    const created = await service.createDoctor(baseDoctor);
    const res = await service.deleteDoctor(String(created._id));
    expect(res).toEqual({ message: "Doctor deleted successfully" });
    expect(await DoctorModel.countDocuments()).toBe(0);
  });

  test("deleteDoctor – not found throws 404", async () => {
    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.deleteDoctor(bogusId)).rejects.toMatchObject({ status: 404 });
  });
});
