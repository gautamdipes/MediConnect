import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../repositories/user.repository";
import { JWT_SECRET } from "../../config/constant";

const userRepository = new UserRepository();

export class HospitalAuthService {
  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);

    if (!user || user.role !== "hospital") {
      throw new Error("Invalid email or password");
    }

    if (!user.hospitalId) {
      throw new Error("Hospital account is not linked to a hospital");
    }

    if (!user.password) {
      throw new Error("Invalid email or password");
    }

    const passwordIsBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password);
    const isPasswordValid = passwordIsBcryptHash
      ? await bcrypt.compare(data.password, user.password)
      : data.password === user.password;

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Upgrade legacy plain-text hospital credentials after the first valid login.
    if (!passwordIsBcryptHash) {
      user.password = await bcrypt.hash(data.password, 10);
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        hospitalId: user.hospitalId,
        profileImage: user.profileImage,
      },
    };
  }
}
