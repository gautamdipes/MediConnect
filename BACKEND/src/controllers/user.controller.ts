import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};