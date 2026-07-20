export type HospitalStatus = "VERIFIED" | "PENDING" | "SUSPENDED" | "INACTIVE";

export interface IHospital {
  hospitalName: string;
  type: string; // e.g. "Multi-specialty Center", "Trauma Level 1", "Trauma Level 2"
  email: string;
  password: string;
  phoneNumber: string;
  city: string;
  state: string;
  departments: string[];
  doctorsCount: number;
  status: HospitalStatus;
  rating?: number;
  emergency: boolean;
  image?: string;
}