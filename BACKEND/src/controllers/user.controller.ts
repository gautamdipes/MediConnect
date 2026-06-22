import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

/**
 * Register a new user
 */
export const registerUser = async (req: Request, res: Response) => {
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Login user – returns JWT token
 */
export const loginUser = async (req: Request, res: Response) => {
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const result = await userService.login(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    // Return unauthorized for invalid credentials
    return res.status(401).json({ message: err.message || "Invalid email or password" });
  }
};

/**
 * Update user profile (including optional file upload)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const profileImage = req.file?.path || undefined;
    const updateData = { ...req.body, profileImage };
    const result = await userService.updateUser(userId, updateData);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Upload profile image (separate endpoint)
 */
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const profileImage = req.file?.path;
    if (!profileImage) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await userService.updateUser(userId, { profileImage });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await userService.removeProfileImage(userId);
    return res.status(200).json({ message: "Profile image deleted" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
