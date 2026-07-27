/**
 * Seeds hospitals + hospital user in one shot.
 * Run: npx ts-node --transpile-only src/scripts/seed-hospital.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "mediconnect";

const hospitalsData = [
  {
    hospitalName: "City Heart Institute",
    city: "New York", state: "NY",
    rating: 4.8, type: "Specialist",
    departments: ["Cardiology", "Emergency"],
    emergency: true,
    image: "photo-1519494026892-80bbd2d6fd0d",
    phoneNumber: "555-1001",
    email: "contact@cityheart.com",
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    hospitalName: "Westside Medical",
    city: "New York", state: "NY",
    rating: 4.5, type: "General",
    departments: ["General Medicine", "Pediatrics", "Neurology"],
    emergency: true,
    image: "photo-1586773860418-d37222d8fce3",
    phoneNumber: "555-1002",
    email: "contact@westsidemedical.com",
    createdAt: new Date(), updatedAt: new Date(),
  },
];

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB:", DB_NAME);

  const hospitalsCol = mongoose.connection.db!.collection("hospitals");
  const usersCol = mongoose.connection.db!.collection("users");

  // Seed hospitals if empty
  const count = await hospitalsCol.countDocuments();
  let hospital: any;
  if (count === 0) {
    const result = await hospitalsCol.insertMany(hospitalsData);
    console.log(`✅ Inserted ${hospitalsData.length} hospitals`);
    hospital = await hospitalsCol.findOne({ _id: result.insertedIds[0] });
  } else {
    hospital = await hospitalsCol.findOne({});
    console.log("⚠️  Hospitals already exist, using:", hospital?.hospitalName);
  }

  // Create hospital user linked to first hospital
  const hospitalEmail = "hospital@mediconnect.com";
  const existing = await usersCol.findOne({ email: hospitalEmail });
  if (existing) {
    console.log("⚠️  Hospital user already exists:", hospitalEmail);
  } else {
    await usersCol.insertOne({
      fullName: hospital.hospitalName,
      email: hospitalEmail,
      password: await bcrypt.hash("Hospital@1234", 10),
      phoneNumber: "9800000003",
      role: "hospital",
      authProvider: "local",
      hospitalId: hospital._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Hospital user created:", hospitalEmail, "| password: Hospital@1234");
    console.log("   Linked to hospital:", hospital.hospitalName);
  }

  console.log("\n── All Login credentials ─────────────────────────────");
  console.log("  Admin    → admin@mediconnect.com    / Admin@1234");
  console.log("  User     → user@mediconnect.com     / User@1234");
  console.log("  Hospital → hospital@mediconnect.com / Hospital@1234");
  console.log("──────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
