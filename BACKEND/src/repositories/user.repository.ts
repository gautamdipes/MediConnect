import * as userModel from "../models/user.model";

export class UserRepository {
  async findByEmail(email: string) {
    return userModel.UserModel.findOne({ email });
  }

  async createUser(data: any) {
    return userModel.UserModel.create(data);
  }
}