// src/__tests__/test-utils.ts
import mongoose from "mongoose";
import request from "supertest";
import app from "../app"; // assuming app exports the Express instance
import bcrypt from "bcryptjs";

/** Clear the test database between suites */
export async function clearDatabase() {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    await Promise.all(
      collections
        .map((c) => c.name)
        .filter((name) => !name.startsWith("system."))
        .map((name) => mongoose.connection.db!.collection(name).deleteMany({}))
    );
  }
}

/** Register a user (optionally admin) and obtain a JWT */
export async function registerAndLogin(isAdmin = false) {
  const email = `test${Date.now()}@example.com`;
  const password = "Password123!";
  const payload: any = {
    firstname: "Test",
    lastname: "User",
    email,
    password,
    confirmPassword: password,
  };
  if (isAdmin) payload.role = "admin"; // assuming role can be set directly

  // Register
  await request(app).post("/api/v1/users/register").send(payload).expect(201);

  if (isAdmin) {
    const { UserModel } = require("../models/user.model");
    await UserModel.updateOne({ email }, { role: "admin" });
  }

  // Login
  const loginRes = await request(app)
    .post("/api/v1/users/login")
    .send({ email, password })
    .expect(200);

  const token = loginRes.body.token;
  return { token, email, password, userId: loginRes.body.user._id };
}

/** Helper to attach auth header */
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
