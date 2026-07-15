import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

export const hospitalMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "hospital") {
      return res.status(403).json({ message: "Forbidden: Hospital access required" });
    }

    if (!user.hospitalId) {
      return res.status(403).json({ message: "Hospital account is not linked to a hospital" });
    }

    (req as any).hospitalUser = user;
    (req as any).hospitalId = user.hospitalId;
    next();
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
