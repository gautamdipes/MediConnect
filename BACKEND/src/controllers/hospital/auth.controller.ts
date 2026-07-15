import { Request, Response } from "express";
import { HospitalAuthService } from "../../services/hospital/auth.service";

const hospitalAuthService = new HospitalAuthService();

export const hospitalLogin = async (req: Request, res: Response) => {
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await hospitalAuthService.login(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(401).json({ message: err.message || "Login failed" });
  }
};
