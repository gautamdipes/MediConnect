/**
 * Creates a demo hospital login account linked to the first hospital in the DB.
 * Usage: npx tsx src/scripts/seed-hospital-user.ts
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../database/mongodb";
import { HospitalModel } from "../models/hospital.model";
import { UserModel } from "../models/user.model";

const DEMO_EMAIL = "bir123@gmail.com";
const DEMO_PASSWORD = "bir123@";

async function seed() {
  await connectDB();

  let hospital = await HospitalModel.findOne().sort({ createdAt: 1 });
  if (!hospital) {
    hospital = await HospitalModel.create({
      hospitalName: "Demo City Hospital",
      email: "demo-hospital@mediconnect.local",
      phoneNumber: "9800000000",
      city: "Kathmandu",
      state: "Bagmati",
      departments: ["General"],
      status: "VERIFIED",
    });
    console.log("Created demo hospital:", hospital.hospitalName, hospital._id);
  } else {
    console.log("Using hospital:", hospital.hospitalName, hospital._id);
  }

  // Reuse the account already assigned to this hospital, so changing the demo
  // credentials does not leave an older hospital login active.
  const existing =
    (await UserModel.findOne({ email: DEMO_EMAIL })) ||
    (await UserModel.findOne({ role: "hospital", hospitalId: hospital._id } as any));
  if (existing) {
    existing.email = DEMO_EMAIL;
    existing.role = "hospital";
    existing.hospitalId = hospital._id as any;
    existing.password = await bcrypt.hash(DEMO_PASSWORD, 10);
    existing.fullName = existing.fullName || `${hospital.hospitalName} Admin`;
    await existing.save();
    console.log("Updated existing hospital user:", DEMO_EMAIL);
  } else {
    await UserModel.create({
      fullName: `${hospital.hospitalName} Admin`,
      email: DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      phoneNumber: hospital.phoneNumber || "9800000000",
      role: "hospital",
      hospitalId: hospital._id as any,
      authProvider: "local",
    });
    console.log("Created hospital user:", DEMO_EMAIL);
  }

  console.log("\nLogin with:");
  console.log("  Email:   ", DEMO_EMAIL);
  console.log("  Password:", DEMO_PASSWORD);
  console.log("  Portal:  Hospital");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
