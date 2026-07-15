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
    // ✅ Fixed — send response directly instead of throwing
    return res.status(401).json({ message: err.message || "Invalid email or password" });
  }
};

export const googleLoginUser = async (req: Request, res: Response) => {
  const idToken = req.body?.idToken || req.body?.credential;
  if (!idToken) {
    return res.status(400).json({ message: "Google ID token is required" });
  }
  try {
    const result = await userService.loginWithGoogle(idToken);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(401).json({ message: err.message || "Google sign-in failed" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.adminProfileImage = `/uploads/${req.file.filename}`;
    }
    delete updateData.profileImage;

    const result = await userService.updateUser(userId, updateData);
    const user = result.user as any;

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        adminProfileImage: user.adminProfileImage,
      },
      message: result.message,
    });
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
    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;
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