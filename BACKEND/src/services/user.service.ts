import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN, JWT_SECRET } from "../config/constant";
import type { AuthResponseDto, LoginUserDto, RegisterUserDto } from "../dtos/user.dto";
import { createUser, findUserByEmail } from "../repositories/user.repository";
import type { UserDocument } from "../types/user.type";

const toAuthResponse = (user: UserDocument): AuthResponseDto => {
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    }
  };
};

export const registerUser = async (payload: RegisterUserDto): Promise<AuthResponseDto> => {
  const existingUser = await findUserByEmail(payload.email);

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
  const user = await createUser({
    ...payload,
    password: hashedPassword
  });

  return toAuthResponse(user);
};

export const loginUser = async (payload: LoginUserDto): Promise<AuthResponseDto> => {
  const user = await findUserByEmail(payload.email, true);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return toAuthResponse(user);
};
