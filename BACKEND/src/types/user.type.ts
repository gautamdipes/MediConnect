import type { HydratedDocument, Types } from "mongoose";

export type UserRole = "patient" | "doctor" | "admin";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export type SafeUser = Omit<IUser, "password">;
