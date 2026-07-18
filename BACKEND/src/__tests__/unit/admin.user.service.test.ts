import { AdminUserService } from "../../services/admin/user.service";
import { UserModel } from "../../models/user.model";
import { clearDatabase } from "../test-utils";
import { HttpException } from "../../exceptions/http-exception";
import mongoose from "mongoose";

describe("AdminUserService Unit Tests", () => {
  const service = new AdminUserService();

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("listUsers – pagination and search", async () => {
    await UserModel.create({ fullName: "Alice", email: "alice@example.com", password: "Password123!" });
    await UserModel.create({ fullName: "Bob", email: "bob@example.com", password: "Password123!" });
    await UserModel.create({ fullName: "Carol", email: "carol@example.com", password: "Password123!" });

    const all = await service.listUsers({ page: 1, limit: 2 });
    expect(all.meta.total).toBe(3);
    expect(all.meta.totalPages).toBe(2);
    expect(all.data).toHaveLength(2);

    const search = await service.listUsers({ search: "Alice" });
    expect(search.meta.total).toBe(1);
    expect(search.data[0].fullName).toBe("Alice");
  });

  test("createUser – hashes password", async () => {
    const user = await service.createUser({ fullName: "Dave", email: "dave@example.com", password: "Password123!" } as any);
    const dbUser = await UserModel.findById(user._id);
    expect(dbUser!.password).not.toBe("Password123!");
    expect(dbUser!.password).toMatch(/^\$2[aby]\$/);
  });

  test("getUser – found and 404", async () => {
    const user = await service.createUser({ fullName: "Dave", email: "dave@example.com", password: "Password123!" } as any);
    const fetched = await service.getUser(String(user._id));
    expect(fetched.fullName).toBe("Dave");

    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.getUser(bogusId)).rejects.toBeInstanceOf(HttpException);
    await expect(service.getUser(bogusId)).rejects.toMatchObject({ status: 404 });
  });

  test("updateUser – updates and hashes password", async () => {
    const user = await service.createUser({ fullName: "Dave", email: "dave@example.com", password: "Password123!" } as any);
    const updated = await service.updateUser(String(user._id), { fullName: "David", password: "NewPassword123!" } as any);
    expect(updated.fullName).toBe("David");
    const dbUser = await UserModel.findById(user._id);
    expect(dbUser!.password).toMatch(/^\$2[aby]\$/);

    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.updateUser(bogusId, { fullName: "X" } as any)).rejects.toMatchObject({ status: 404 });
  });

  test("deleteUser – success and 404", async () => {
    const user = await service.createUser({ fullName: "Dave", email: "dave@example.com", password: "Password123!" } as any);
    const res = await service.deleteUser(String(user._id));
    expect(res).toEqual({ message: "User deleted" });
    expect(await UserModel.countDocuments()).toBe(0);

    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.deleteUser(bogusId)).rejects.toMatchObject({ status: 404 });
  });
});
