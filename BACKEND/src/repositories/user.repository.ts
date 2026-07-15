import * as userModel from "../models/user.model";

export class UserRepository {
  async findByEmail(email: string) {
    return userModel.UserModel.findOne({ email });
  }

  async findByGoogleId(googleId: string) {
    return userModel.UserModel.findOne({ googleId });
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
    async deleteUser(id: string) {
      return userModel.UserModel.findByIdAndDelete(id).exec();
    }

    async count(filter: any) {
      return userModel.UserModel.countDocuments(filter);
    }

    async findMany(filter: any, options: { skip: number; limit: number }) {
      return userModel.UserModel.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .exec();
    }
  }