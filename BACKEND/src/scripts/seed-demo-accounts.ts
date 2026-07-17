/**
 * Creates predictable local-development credentials for each portal.
 * Usage: npm run seed:demo-accounts
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../database/mongodb";
import { HospitalModel } from "../models/hospital.model";
import { UserModel } from "../models/user.model";

type Account = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "admin" | "hospital" | "user";
};

const credentials = {
  admin: {
    fullName: "MediConnect Administrator",
    email: "admin123@gmail.com",
    password: "admin123",
    phoneNumber: "9800000001",
    role: "admin" as const,
  },
  hospital: {
    fullName: "Demo City Hospital Admin",
    email: "bir123@gmail.com",
    password: "bir123@",
    phoneNumber: "9800000000",
    role: "hospital" as const,
  },
  patient: {
    fullName: "Demo Patient",
    email: "gau1@gmail.com",
    password: "gautam111",
    phoneNumber: "9800000002",
    role: "user" as const,
  },
};

async function upsertUser(account: Account, hospitalId?: string) {
  const existing = await UserModel.findOne({ email: account.email });
  const user = existing || new UserModel({ email: account.email });

  // Hash password for secure storage (seed script runs only in dev)
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(account.password, 10);

  user.fullName = account.fullName;
  user.email = account.email;
  user.password = hashedPassword;
  user.phoneNumber = account.phoneNumber;
  user.role = account.role;
  user.authProvider = "local";
  user.hospitalId = hospitalId;
  await user.save();
}

async function seed() {
  await connectDB();

  let hospital = await HospitalModel.findOne().sort({ createdAt: 1 });
  if (!hospital) {
    hospital = await HospitalModel.create({
      hospitalName: "Demo City Hospital",
      email: "demo-hospital@mediconnect.local",
      phoneNumber: credentials.hospital.phoneNumber,
      city: "Kathmandu",
      state: "Bagmati",
      departments: ["General"],
      status: "VERIFIED",
    });
  }

  // Ensure admin account exists and is properly hashed
  await upsertUser(credentials.admin);

  await upsertUser(credentials.hospital, hospital._id.toString());
  await upsertUser(credentials.patient);

  console.log("Demo portal accounts are ready.");
  for (const [portal, account] of Object.entries(credentials)) {
    console.log(`${portal}: ${account.email} / ${account.password}`);
  }

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
