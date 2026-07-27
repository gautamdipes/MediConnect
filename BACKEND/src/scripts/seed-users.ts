import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "mediconnect";

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB:", DB_NAME);

  const usersCol = mongoose.connection.db!.collection("users");
  const hospitalsCol = mongoose.connection.db!.collection("hospitals");

  // ── Helper: upsert a user ────────────────────────────────────────
  const upsert = async (data: any) => {
    const existing = await usersCol.findOne({ email: data.email });
    if (existing) {
      await usersCol.updateOne({ email: data.email }, { $set: data });
      console.log(`🔄 Updated: ${data.email}`);
    } else {
      await usersCol.insertOne({ ...data, createdAt: new Date(), updatedAt: new Date() });
      console.log(`✅ Created: ${data.email}`);
    }
  };

  // ── 1. Regular User ──────────────────────────────────────────────
  await upsert({
    fullName: "Gautam",
    email: "gau1@gmail.com",
    password: await bcrypt.hash("gautam111", 10),
    phoneNumber: "9800000010",
    role: "user",
    authProvider: "local",
  });

  // ── 2. Admin User ────────────────────────────────────────────────
  await upsert({
    fullName: "Admin",
    email: "admin123@gmail.com",
    password: await bcrypt.hash("admin123", 10),
    phoneNumber: "9800000011",
    role: "admin",
    authProvider: "local",
  });

  // ── 3. Hospital User (Bir Hospital) ──────────────────────────────
  // Find or create "Bir Hospital"
  let birHospital = await hospitalsCol.findOne({ hospitalName: "Bir Hospital" });
  if (!birHospital) {
    const result = await hospitalsCol.insertOne({
      hospitalName: "Bir Hospital",
      city: "Kathmandu",
      state: "Bagmati",
      rating: 4.5,
      type: "General",
      departments: ["General Medicine", "Emergency", "Pediatrics"],
      emergency: true,
      image: "photo-1586773860418-d37222d8fce3",
      phoneNumber: "01-4221119",
      email: "bir123@gmail.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    birHospital = await hospitalsCol.findOne({ _id: result.insertedId });
    console.log("✅ Created hospital: Bir Hospital");
  } else {
    console.log("⚠️  Bir Hospital already exists, reusing it");
  }

  await upsert({
    fullName: "Bir Hospital Admin",
    email: "bir123@gmail.com",
    password: await bcrypt.hash("bir123@", 10),
    phoneNumber: "9800000012",
    role: "hospital",
    authProvider: "local",
    hospitalId: birHospital!._id,
  });

  console.log("\n── Your Login Credentials ────────────────────────────");
  console.log("  User     → gau1@gmail.com     / gautam111");
  console.log("  Admin    → admin123@gmail.com  / admin123");
  console.log("  Hospital → bir123@gmail.com    / bir123@");
  console.log("──────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
