export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  googleId?: string;
  authProvider?: "local" | "google";
  profileImage?: string;
  adminProfileImage?: string;
  dob?: string;
  address?: string;
  gender?: string;
  role?: "user" | "admin" | "hospital";
  hospitalId?: string;
  resetPasswordCodeHash?: string;
  resetPasswordCodeExpiresAt?: Date;
  resetPasswordCodeAttempts?: number;
  resetPasswordRequestCount?: number;
  resetPasswordRequestWindowStartedAt?: Date;
}
