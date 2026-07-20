export interface CreateHospitalDTO {
  hospitalName: string;
  type: string;
  email: string;
  password: string;
  phoneNumber: string;
  city: string;
  state: string;
  departments?: string[];
  emergency?: boolean;
}

export interface UpdateHospitalDTO {
  hospitalName?: string;
  type?: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  departments?: string[];
  doctorsCount?: number;
  status?: "VERIFIED" | "PENDING" | "SUSPENDED" | "INACTIVE";
  rating?: number;
  emergency?: boolean;
  image?: string;
}