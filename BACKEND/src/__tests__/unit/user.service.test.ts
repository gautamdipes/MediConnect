import { UserService } from "../../services/user.service";
import { UserRepository } from "../../repositories/user.repository";
import { UserModel } from "../../models/user.model";
import { clearDatabase } from "../test-utils";

jest.mock("../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

import { sendEmail } from "../../config/email";

describe("UserService Unit Tests", () => {
  const service = new UserService();
  const repo = new UserRepository();

  beforeEach(async () => {
    await clearDatabase();
    (sendEmail as jest.Mock).mockClear();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe("register", () => {
    test("success creates a user", async () => {
      const res = await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      expect(res.message).toBe("Registration successful");
      const user = await UserModel.findOne({ email: "john@example.com" });
      expect(user).toBeDefined();
      expect(user!.password).not.toBe("Password123!");
    });

    test("duplicate email throws", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      await expect(service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" })).rejects.toThrow("Email already registered");
    });
  });

  describe("login", () => {
    test("success returns a token", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      const res = await service.login({ email: "john@example.com", password: "Password123!" });
      expect(res.token).toBeDefined();
      expect(res.user.email).toBe("john@example.com");
    });

    test("wrong password throws", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      await expect(service.login({ email: "john@example.com", password: "nope" })).rejects.toThrow("Invalid email or password");
    });

    test("google-only account throws", async () => {
      await UserModel.create({ fullName: "G", email: "g@example.com", authProvider: "google" });
      await expect(service.login({ email: "g@example.com", password: "x" })).rejects.toThrow("Google sign-in");
    });
  });

  describe("updatePassword", () => {
    test("success changes password", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      const user = await UserModel.findOne({ email: "john@example.com" });
      await service.updatePassword(String(user!._id), "Password123!", "NewPassword123!");
      const login = await service.login({ email: "john@example.com", password: "NewPassword123!" });
      expect(login.token).toBeDefined();
    });

    test("wrong current password throws", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      const user = await UserModel.findOne({ email: "john@example.com" });
      await expect(service.updatePassword(String(user!._id), "wrong", "NewPassword123!")).rejects.toThrow("Current password is incorrect");
    });
  });

  describe("password reset", () => {
    test("requestPasswordReset sends a code and verify/reset works", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      await service.requestPasswordReset("john@example.com");
      expect(sendEmail as jest.Mock).toHaveBeenCalledTimes(1);

      const user = await repo.findByEmailWithPasswordResetFields("john@example.com");
      const code = extractCode((sendEmail as jest.Mock).mock.calls[0][2]);
      await service.verifyPasswordResetCode("john@example.com", code);
      await service.resetPassword("john@example.com", code, "BrandNew123!");
      const login = await service.login({ email: "john@example.com", password: "BrandNew123!" });
      expect(login.token).toBeDefined();
    });

    test("requestPasswordReset does not leak for unknown email", async () => {
      await service.requestPasswordReset("nobody@example.com");
      expect(sendEmail as jest.Mock).not.toHaveBeenCalled();
    });

    test("resetPassword rejects short passwords", async () => {
      await expect(service.resetPassword("x@example.com", "123456", "short")).rejects.toThrow("at least 8 characters");
    });
  });

  describe("getUserById / updateUser", () => {
    test("getUserById returns the user", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      const created = await UserModel.findOne({ email: "john@example.com" });
      const fetched = await service.getUserById(String(created!._id));
      expect(fetched!.email).toBe("john@example.com");
    });

    test("updateUser updates fields", async () => {
      await service.register({ fullName: "John", email: "john@example.com", password: "Password123!", phoneNumber: "123" });
      const created = await UserModel.findOne({ email: "john@example.com" });
      const res = await service.updateUser(String(created!._id), { fullName: "Johnny" });
      expect(res.user!.fullName).toBe("Johnny");
    });
  });
});

function extractCode(html: string): string {
  const match = html.match(/letter-spacing:6px">(\d{6})</);
  if (!match) throw new Error("Reset code not found in email body");
  return match[1];
}
