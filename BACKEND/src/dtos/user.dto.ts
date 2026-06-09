import type { UserRole } from "../types/user.type";

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
  };
}
