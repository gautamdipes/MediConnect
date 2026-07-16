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
    email: "admin@mediconnect.local",
    password: "AdminPortal#2026",
    phoneNumber: "9800000001",
    role: "admin" as const,
  },
  hospital: {
    fullName: "Demo City Hospital Admin",
    email: "hospital@mediconnect.local",
    password: "HospitalPortal#2026",
    phoneNumber: "9800000000",
    role: "hospital" as const,
  },
  patient: {
    fullName: "Demo Patient",
    email: "patient@mediconnect.local",
    password: "PatientPortal#2026",
    phoneNumber: "9800000002",
    role: "user" as const,
  },
};

async function upsertUser(account: Account, hospitalId?: string) {
  const existing = await UserModel.findOne({ email: account.email });
  const user = existing || new UserModel({ email: account.email });

  user.fullName = account.fullName;
  user.email = account.email;
  user.password = account.password;
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

  const existingAdmin = await UserModel.findOne({ role: "admin" });
  if (existingAdmin && existingAdmin.email !== credentials.admin.email) {
    const targetExists = await UserModel.exists({ email: credentials.admin.email });
    if (targetExists) throw new Error(`Cannot rename the existing admin: ${credentials.admin.email} is already in use.`);
    existingAdmin.email = credentials.admin.email;
    existingAdmin.fullName = credentials.admin.fullName;
    existingAdmin.password = credentials.admin.password;
    existingAdmin.phoneNumber = credentials.admin.phoneNumber;
    existingAdmin.authProvider = "local";
    await existingAdmin.save();
  } else {
    await upsertUser(credentials.admin);
  }

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
