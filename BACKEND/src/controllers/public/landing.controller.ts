import { Request, Response } from "express";
import { PublicLandingService } from "../../services/public/landing.service";

const svc = new PublicLandingService();

/** GET /api/v1/public/landing */
export const getLanding = async (_req: Request, res: Response) => {
  try {
    const data = await svc.getLandingData();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to load landing data" });
  }
};
