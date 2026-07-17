import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { JWT_SECRET } from "../config/constant";
import { sendEmail } from "../config/email";

export class UserService {
  private readonly resetCodeLifetimeMs = 15 * 60 * 1000;
  private readonly resetRequestWindowMs = 60 * 60 * 1000;
  private readonly maxResetRequestsPerWindow = 3;
  private readonly maxResetCodeAttempts = 5;
  private readonly userRepository: UserRepository;
  private readonly googleClient: OAuth2Client;

  constructor(userRepository?: UserRepository) {
    this.userRepository = userRepository ?? new UserRepository();
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private clearResetCode(user: any) {
    user.resetPasswordCodeHash = undefined;
    user.resetPasswordCodeExpiresAt = undefined;
    user.resetPasswordCodeAttempts = 0;
  }

  async requestPasswordReset(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    const user = await this.userRepository.findByEmailWithPasswordResetFields(email);

    // Do not reveal whether an account exists or accepts password sign-in.
    if (!user || !user.password) return;

    const now = new Date();
    const windowStarted = user.resetPasswordRequestWindowStartedAt;
    if (!windowStarted || now.getTime() - windowStarted.getTime() >= this.resetRequestWindowMs) {
      user.resetPasswordRequestWindowStartedAt = now;
      user.resetPasswordRequestCount = 0;
    }
    if ((user.resetPasswordRequestCount || 0) >= this.maxResetRequestsPerWindow) return;

    const code = crypto.randomInt(100000, 1000000).toString();
    user.resetPasswordCodeHash = await bcrypt.hash(code, 10);
    user.resetPasswordCodeExpiresAt = new Date(now.getTime() + this.resetCodeLifetimeMs);
    user.resetPasswordCodeAttempts = 0;
    user.resetPasswordRequestCount = (user.resetPasswordRequestCount || 0) + 1;
    if (typeof (user as any).save === 'function') {
      await user.save();
    }

    try {
      await sendEmail(
        user.email,
        "Your MediConnect password reset code",
        `<p>Use this verification code to reset your MediConnect password:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>This code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>`
      );
    } catch (error) {
      this.clearResetCode(user);
      await user.save();
      throw error;
    }
  }

  async verifyPasswordResetCode(rawEmail: string, code: string) {
    const user = await this.getValidResetUser(rawEmail, code);
    return { email: user.email };
  }

  async resetPassword(rawEmail: string, code: string, newPassword: string) {
    if (newPassword.length < 8) throw new Error("New password must be at least 8 characters long");
    const user = await this.getValidResetUser(rawEmail, code);
    user.password = await bcrypt.hash(newPassword, 10);
    this.clearResetCode(user);
    await user.save();
  }

  private async getValidResetUser(rawEmail: string, code: string) {
    const user = await this.userRepository.findByEmailWithPasswordResetFields(rawEmail.trim().toLowerCase());
    if (!user || !user.password || !user.resetPasswordCodeHash || !user.resetPasswordCodeExpiresAt || user.resetPasswordCodeExpiresAt.getTime() < Date.now()) {
      throw new Error("The verification code is invalid or has expired");
    }
    if ((user.resetPasswordCodeAttempts || 0) >= this.maxResetCodeAttempts) {
      this.clearResetCode(user);
      await user.save();
      throw new Error("Too many incorrect codes. Please request a new code");
    }
    const valid = await bcrypt.compare(code, user.resetPasswordCodeHash);
    if (!valid) {
      user.resetPasswordCodeAttempts = (user.resetPasswordCodeAttempts || 0) + 1;
      if (user.resetPasswordCodeAttempts >= this.maxResetCodeAttempts) this.clearResetCode(user);
      await user.save();
      throw new Error("The verification code is invalid or has expired");
    }
    return user;
  }

  // ---------------------------------------------------------------
  // Remove a user's profile image (file system + DB cleanup)
  // ---------------------------------------------------------------
  async removeProfileImage(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const storedPath = user.profileImage as string | undefined;
    if (storedPath) {
      const absolutePath = path.resolve(__dirname, "../../uploads", path.basename(storedPath));
      try {
        await fs.unlink(absolutePath);
        console.log(`Deleted profile image: ${absolutePath}`);
      } catch (e: any) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }
    }
    await this.userRepository.updateUser(userId, { profileImage: undefined });
  }

  // ---------------------------------------------------------------
  // Register a new user
  // ---------------------------------------------------------------
  async register(data: { fullName: string; email: string; password: string; phoneNumber: string }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("Email already registered");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.createUser({
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
  async login(data: { email: string; password: string }) {
    // Normalize email for case‑insensitive lookup
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error("Invalid email or password");
    }
    if (!user.password) {
      throw new Error("This account uses Google sign-in. Please continue with Google.");
    }
    // Detect if stored password is a bcrypt hash
    const isLegacy = !/^\$2[aby]\$\d{2}\$/.test(user.password);
    if (isLegacy) {
      // Plain‑text legacy password comparison
      if (user.password !== data.password) {
        throw new Error("Invalid email or password");
      }
      // Upgrade to bcrypt hash for future logins
      user.password = await bcrypt.hash(data.password, 10);
      await this.userRepository.updateUser(user._id.toString(), { password: user.password });
    } else {
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }
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
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("Token used too early") || msg.includes("Token used too late")) {
        throw new Error(
          "Your computer clock is out of sync with Google. Turn on automatic time in Windows Settings → Time & language → Date & time, click Sync now, then try again."
        );
      }
      throw new Error(msg || "Invalid Google token");
    }
    if (!payload?.email || !payload.sub) {
      throw new Error("Invalid Google token");
    }
    if (payload.email_verified === false) {
      throw new Error("Google email is not verified");
    }
    let user = (await this.userRepository.findByGoogleId(payload.sub)) || (await this.userRepository.findByEmail(payload.email));
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
        user = (await this.userRepository.updateUser(String(user._id), updates))!;
      }
    } else {
      user = await this.userRepository.createUser({
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
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
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
  async updateUser(userId: string, data: any) {
    const result = await this.userRepository.updateUser(userId, data);
    return { user: result, message: "User updated successfully" };
  }

  // ---------------------------------------------------------------
  // Update Password
  // ---------------------------------------------------------------
  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.password) {
      throw new Error("This account uses Google sign-in and has no password set");
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateUser(userId, { password: hashedPassword });
    return { message: "Password updated successfully" };
  }

  // ---------------------------------------------------------------
  // Get user by ID
  // ---------------------------------------------------------------
  async getUserById(userId: string) {
    const user = await this.userRepository.findById(userId);
    return user;
  }
}
