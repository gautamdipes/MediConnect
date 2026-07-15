import mongoose, { Document } from "mongoose";
import { IUser } from "../types/user.type";

export interface IUserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function (this: IUserDocument) {
        return this.authProvider !== "google";
      },
    },
    phoneNumber: {
      type: String,
      required: function (this: IUserDocument) {
        return this.authProvider !== "google";
      },
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    profileImage: { type: String },
    adminProfileImage: { type: String },
    dob: { type: String },
    address: { type: String },
    gender: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>("User", userSchema);
