import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export const registerUser = async (req: Request, res: Response) => {
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  try {
    const result = await userService.register(req.body);
    // Respond with success flag and standardized message expected by tests
    return res.status(201).json({ success: true, message: "User Created", user: result.user });
  } catch (err: any) {
    // Duplicate email or other validation errors
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  try {
    const result = await userService.login(req.body);
    // Include success flag for the test suite
    return res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (err: any) {
    // Return failure with success flag false
    return res.status(401).json({ success: false, message: err.message || "Invalid email or password" });
  }
};

export const googleLoginUser = async (req: Request, res: Response) => {
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

export const requestPasswordReset = async (req: Request, res: Response) => {
  if (!req.body?.email) return res.status(400).json({ message: "Email is required" });
  try {
    await userService.requestPasswordReset(req.body.email);
    return res.status(200).json({ message: "If that email has an eligible account, a verification code has been sent." });
  } catch (err: any) {
    return res.status(503).json({ message: err.message || "Unable to send the verification code right now" });
  }
};

export const verifyPasswordResetCode = async (req: Request, res: Response) => {
  if (!req.body?.email || !req.body?.code) return res.status(400).json({ message: "Email and verification code are required" });
  try {
    await userService.verifyPasswordResetCode(req.body.email, String(req.body.code));
    return res.status(200).json({ message: "Verification code confirmed" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Invalid verification code" });
  }
};

export const confirmPasswordReset = async (req: Request, res: Response) => {
  if (!req.body?.email || !req.body?.code || !req.body?.newPassword) return res.status(400).json({ message: "Email, verification code, and new password are required" });
  try {
    await userService.resetPassword(req.body.email, String(req.body.code), req.body.newPassword);
    return res.status(200).json({ message: "Password reset successfully. You can now sign in." });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Unable to reset password" });
  }
};
