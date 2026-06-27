import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export const whoami = async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await userService.getUserById(authUser.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        dob: user.dob,
        address: (user as any).address,
        gender: (user as any).gender,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = user.userId;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;
  const updateData: any = { ...req.body };
  if (profileImage) {
    updateData.profileImage = profileImage;
  }
  try {
    const result = await userService.updateUser(userId, updateData);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Accept both "currentPassword" and "oldPassword" for compatibility
  const currentPassword = req.body.currentPassword || req.body.oldPassword;
  const { newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword are required" });
  }
  try {
    const result = await userService.updatePassword(user.userId, currentPassword, newPassword);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};