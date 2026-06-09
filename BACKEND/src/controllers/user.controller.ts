import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/user.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed"
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed"
    });
  }
};
