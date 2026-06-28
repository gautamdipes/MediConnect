import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};