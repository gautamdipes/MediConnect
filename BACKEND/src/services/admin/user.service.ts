import { UserRepository } from "../../repositories/user.repository";
import { IUser } from "../../types/user.type";
import { HttpException } from "../../exceptions/http-exception";
import bcrypt from "bcryptjs";

const userRepository = new UserRepository();

export class AdminUserService {
  // List users with pagination and optional search (by fullName or email)
  async listUsers(params: { page?: number; limit?: number; search?: string }) {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 10;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (params.search) {
      const regex = new RegExp(params.search, "i");
      filter.$or = [{ fullName: regex }, { email: regex }];
    }
    const [total, users] = await Promise.all([
      userRepository.count(filter),
      userRepository.findMany(filter, { skip, limit }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      data: users,
      meta: { page, limit, total, totalPages },
    };
  }

  async getUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpException("User not found", 404);
    return user;
  }

  async createUser(data: Partial<IUser>) {
    // hash password if present
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await userRepository.createUser(data);
    return user;
  }

  async updateUser(id: string, data: Partial<IUser>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await userRepository.updateUser(id, data);
    if (!user) throw new HttpException("User not found", 404);
    return user;
  }

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpException("User not found", 404);
    await userRepository.deleteUser(id);
    return { message: "User deleted" };
  }
}
