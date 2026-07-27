import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "mediconnect";

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("Connected to MongoDB:", DB_NAME);

  const users = await mongoose.connection.db!
    .collection("users")
    .find({}, { projection: { email: 1, role: 1, password: 1, fullName: 1, hospitalId: 1, _id: 0 } })
    .toArray();

  if (users.length === 0) {
    console.log("\n⚠️  NO USERS FOUND in the database!\n");
    console.log("This is why login fails — there are no accounts to log into.");
    console.log("Run the create-admin script or register a new account first.\n");
  } else {
    console.log(`\n✅ Found ${users.length} user(s):\n`);
    users.forEach((u: any) => {
      console.log({
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        hasPassword: !!u.password,
        hospitalId: u.hospitalId ?? null,
      });
    });
  }

  await mongoose.disconnect();
}

main().catch(console.error);
