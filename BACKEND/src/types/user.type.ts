export interface IUser {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  profileImage?: string;
  adminProfileImage?: string;
  dob?: string;
  address?: string;
  gender?: string;
  role?: "user" | "admin";
}