import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { OAuth2Client } from "google-auth-library";
import { UserRepository } from "../repositories/user.repository";
import { JWT_SECRET } from "../config/constant";
// import { CLIENT_URL, SECRET_KEY } from "../config/constant";
// import { sendEmail } from "../config/email";

const userRepository = new UserRepository();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class UserService {
  checkPassword(userId: string, currentPassword: any) {
      throw new Error("Method not implemented.");
  }
  deleteUser(userId: string) {
      throw new Error("Method not implemented.");
  }
  // ---------------------------------------------------------------
  // Remove a user's profile image (file system + DB cleanup)
  // ---------------------------------------------------------------
  async removeProfileImage(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const storedPath = user.profileImage as string | undefined;

    if (storedPath) {
      const absolutePath = path.resolve(
        __dirname,
        "../../uploads",
        path.basename(storedPath)
      );

      try {
        await fs.unlink(absolutePath);
        console.log(`Deleted profile image: ${absolutePath}`);
      } catch (e: any) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }
    }

    await userRepository.updateUser(userId, {
      profileImage: undefined,
    });
  }

  // ---------------------------------------------------------------
  // Register a new user
  // ---------------------------------------------------------------
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) {
    const existing = await userRepository.findByEmail(data.email);

    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      10
    );

    const user = await userRepository.createUser({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
    });

    return {
      user: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      message: "Registration successful",
    };
  }

  // ---------------------------------------------------------------
  // User login – returns JWT token
  // ---------------------------------------------------------------
  async login(data: {
    email: string;
    password: string;
  }) {
    const user = await userRepository.findByEmail(
      data.email
    );

    if (!user) {
      throw new Error(
        "Invalid email or password"
      );
    }

    if (!user.password) {
      throw new Error(
        "This account uses Google sign-in. Please continue with Google."
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        data.password,
        user.password
      );

    if (!isPasswordValid) {
      throw new Error(
        "Invalid email or password"
      );
    }

    return this.issueAuthResponse(user);
  }

  // ---------------------------------------------------------------
  // Google sign-in – verify ID token, find or create user, return JWT
  // ---------------------------------------------------------------
  async loginWithGoogle(idToken: string) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("Google sign-in is not configured on the server");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new Error("Invalid Google token");
    }

    if (payload.email_verified === false) {
      throw new Error("Google email is not verified");
    }

    let user =
      (await userRepository.findByGoogleId(payload.sub)) ||
      (await userRepository.findByEmail(payload.email));

    if (user) {
      const updates: Record<string, string> = {};
      if (!user.googleId) updates.googleId = payload.sub;
      if (user.authProvider !== "google" && !user.password) {
        updates.authProvider = "google";
      }
      if (payload.picture && !user.profileImage) {
        updates.profileImage = payload.picture;
      }
      if (Object.keys(updates).length > 0) {
        user = (await userRepository.updateUser(String(user._id), updates))!;
      }
    } else {
      user = await userRepository.createUser({
        fullName: payload.name || payload.email.split("@")[0],
        email: payload.email,
        googleId: payload.sub,
        authProvider: "google",
        phoneNumber: "",
        profileImage: payload.picture,
        role: "user",
      });
    }

    return this.issueAuthResponse(user);
  }

  private issueAuthResponse(user: any) {
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return {
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        role: user.role,
      },
    };
  }

  // ---------------------------------------------------------------
  // Update user profile
  // ---------------------------------------------------------------
  async updateUser(
    userId: string,
    data: any
  ) {
    const result =
      await userRepository.updateUser(
        userId,
        data
      );

    return {
      user: result,
      message:
        "User updated successfully",
    };
  }

  // ---------------------------------------------------------------
  // Update Password
  // ---------------------------------------------------------------
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user =
      await userRepository.findById(
        userId
      );

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error(
        "This account uses Google sign-in and has no password set"
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isPasswordValid) {
      throw new Error(
        "Current password is incorrect"
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    await userRepository.updateUser(
      userId,
      {
        password: hashedPassword,
      }
    );

    return {
      message:
        "Password updated successfully",
    };
  }

  // ---------------------------------------------------------------
  // Get user by ID
  // ---------------------------------------------------------------
  async getUserById(userId: string) {
    const user =
      await userRepository.findById(
        userId
      );

    return user;
  }
}