export interface CreateDoctorDTO {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  hospitalId?: string;
  hospitalName?: string;
  experience?: number;
  rating?: number;
  status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "EMERGENCY";
  gender?: string;
  profileImage?: string;
  qualifications?: string[];
  availableDays?: string[];
}

export interface UpdateDoctorDTO extends Partial<CreateDoctorDTO> {}