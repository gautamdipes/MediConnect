import * as userModel from "../models/user.model";

export class UserRepository {
  async findByEmail(email: string) {
    return userModel.UserModel.findOne({ email });
  }

  // New method to retrieve a user by its MongoDB _id
  async findById(id: string) {
    return userModel.UserModel.findById(id).exec();
  }

  async createUser(data: any) {
    return userModel.UserModel.create(data);
  }

  async updateUser(userId: string, data: any) {
    return userModel.UserModel.findByIdAndUpdate(userId, data, { new: true });
  }
}