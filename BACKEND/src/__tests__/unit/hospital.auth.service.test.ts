import { HospitalAuthService } from "../../services/hospital/auth.service";
import { UserModel } from "../../models/user.model";
import { clearDatabase } from "../test-utils";
import mongoose from "mongoose";

describe("HospitalAuthService Unit Tests", () => {
  const service = new HospitalAuthService();

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  async function seedHospitalUser(password = "Password123!", role: "hospital" | "user" = "hospital") {
    return UserModel.create({
      fullName: "Hospital Admin",
      email: "hospital@example.com",
      password,
      role,
      hospitalId: String(new mongoose.Types.ObjectId()),
    });
  }

  test("login – success returns token and user", async () => {
    await seedHospitalUser();
    const res = await service.login({ email: "hospital@example.com", password: "Password123!" });
    expect(res.token).toBeDefined();
    expect(res.user.email).toBe("hospital@example.com");
    expect(res.user.role).toBe("hospital");
    expect(res.user.hospitalId).toBeDefined();
  });

  test("login – upgrades legacy plain password to bcrypt", async () => {
    await seedHospitalUser("plainpass", "hospital");
    const res = await service.login({ email: "hospital@example.com", password: "plainpass" });
    expect(res.token).toBeDefined();
    const updated = await UserModel.findById(res.user._id);
    expect(/^\$2[aby]\$/.test(updated!.password || "")).toBe(true);
  });

  test("login – invalid email throws", async () => {
    await expect(service.login({ email: "missing@example.com", password: "x" })).rejects.toThrow("Invalid email or password");
  });

  test("login – wrong password throws", async () => {
    await seedHospitalUser();
    await expect(service.login({ email: "hospital@example.com", password: "wrongpass" })).rejects.toThrow("Invalid email or password");
  });

  test("login – non-hospital role throws", async () => {
    await seedHospitalUser("Password123!", "user");
    await expect(service.login({ email: "hospital@example.com", password: "Password123!" })).rejects.toThrow("Invalid email or password");
  });

  test("login – hospital without hospitalId throws", async () => {
    await UserModel.create({ fullName: "X", email: "nohosp@example.com", password: "Password123!", role: "hospital" });
    await expect(service.login({ email: "nohosp@example.com", password: "Password123!" })).rejects.toThrow("Hospital account is not linked to a hospital");
  });

  test("login – google-only account throws", async () => {
    await UserModel.create({ fullName: "G", email: "google@example.com", authProvider: "google", role: "hospital", hospitalId: String(new mongoose.Types.ObjectId()) });
    await expect(service.login({ email: "google@example.com", password: "Password123!" })).rejects.toThrow("Google sign-in");
  });
});
