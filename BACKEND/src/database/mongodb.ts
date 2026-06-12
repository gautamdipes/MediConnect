import mongoose from "mongoose";
import { DB_NAME } from "../config/constant";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI as string, {
    dbName: DB_NAME,
  });

  console.log("MongoDB connected");
};