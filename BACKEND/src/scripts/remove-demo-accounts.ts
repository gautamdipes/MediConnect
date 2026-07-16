/** Removes only the explicitly named local demo user accounts. */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../database/mongodb";
import { UserModel } from "../models/user.model";

async function removeDemoAccounts() {
  await connectDB();
  const result = await UserModel.deleteMany({
    email: { $in: ["hospital@mediconnect.local", "patient@mediconnect.local"] },
  });
  console.log(`Removed ${result.deletedCount} demo account(s).`);
  await mongoose.disconnect();
}

removeDemoAccounts().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
