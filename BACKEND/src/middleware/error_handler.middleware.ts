import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();
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

// Global error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
};