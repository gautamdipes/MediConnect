// src/__tests__/test-utils.ts
import mongoose from "mongoose";
import request from "supertest";
import app from "../app"; // assuming app exports the Express instance
import bcrypt from "bcryptjs";

/** Clear the test database between suites */
export async function clearDatabase() {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
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
  await request(app).post("/api/auth/register").send(payload).expect(201);

  // Login
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password })
    .expect(200);

  const token = loginRes.body.token;
  return { token, email, password, userId: loginRes.body.user._id };
}

/** Helper to attach auth header */
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
