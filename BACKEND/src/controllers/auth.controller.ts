import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import path from "path";

const userService = new UserService();

/**
 * Return logged‑in user details extracted from JWT payload.
 */
export const whoami = async (req: Request, res: Response) => {
  // authMiddleware attaches decoded token to req.user
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Retrieve full user data from DB (optional, could just return payload)
  try {
    const dbUser = await userService.updateUser(user.userId, {}); // fetch without changes
    if (!dbUser.user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: dbUser.user });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update profile details. Supports JSON body fields and optional image upload.
 * If an image file is uploaded, its path is stored relative to the /uploads route.
 */
export const updateProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { fullName, phoneNumber, phone, dob } = req.body;
  const updateData: any = {};
  if (fullName) updateData.fullName = fullName;
  if (phoneNumber || phone) updateData.phoneNumber = phoneNumber || phone;
  if (dob) updateData.dob = dob;

  // If a file was uploaded via Multer, store its relative URL
  if (req.file) {
    // Multer stores the file on disk; we expose it via /uploads static route
    const relativePath = `/uploads/${path.basename(req.file.filename)}`;
    updateData.profileImage = relativePath;
  }

  try {
    const result = await userService.updateUser(user.userId, updateData);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

/**
 * Update user password. Requires oldPassword and newPassword in body.
 */
export const updatePassword = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old and new passwords are required" });
  }
  try {
    // Verify old password using bcrypt
    const dbUser = await userService.updateUser(user.userId, {}); // fetch current user data
    if (!dbUser.user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await require('bcryptjs').compare(oldPassword, dbUser.user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    // Hash new password and update
    const hashed = await require('bcryptjs').hash(newPassword, 10);
    await userService.updateUser(user.userId, { password: hashed });
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

