import mongoose from "mongoose";
import { MONGO_URI } from "../config/constant";

export const connectMongoDB = async (): Promise<void> => {
  if (!MONGO_URI || MONGO_URI === "your_mongodb_url") {
    throw new Error("MONGO_URI is missing. Add a valid MongoDB connection string to .env.");
  }

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  });
  console.log("MongoDB connected");
};
