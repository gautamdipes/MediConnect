import UserModel from "../models/user.model";
import type { RegisterUserDto } from "../dtos/user.dto";
import type { UserDocument } from "../types/user.type";

export const findUserByEmail = async (
  email: string,
  includePassword = false
): Promise<UserDocument | null> => {
  const query = UserModel.findOne({ email: email.toLowerCase().trim() });
  return includePassword ? query.select("+password").exec() : query.exec();
};

export const createUser = async (payload: RegisterUserDto): Promise<UserDocument> => {
  return UserModel.create({
    ...payload,
    email: payload.email.toLowerCase().trim()
  });
};
