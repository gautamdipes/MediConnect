import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
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
    role: {
      type: String,
      enum: ["user", "admin", "hospital"],
      default: "user",
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
  },
  { timestamps: true }
);

// Keep credential storage safe regardless of which service creates a user.
// Existing services may already provide a bcrypt hash, so only hash raw values.
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  if (!/^\$2[aby]\$\d{2}\$/.test(this.password)) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as { password?: string; $set?: { password?: string } } | null;
  if (!update) return;

  const password = update.password ?? update.$set?.password;
  if (!password || /^\$2[aby]\$\d{2}\$/.test(password)) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  if (update.$set?.password !== undefined) {
    update.$set.password = hashedPassword;
  } else {
    update.password = hashedPassword;
  }
});

export const UserModel = mongoose.model<IUserDocument>("User", userSchema);
