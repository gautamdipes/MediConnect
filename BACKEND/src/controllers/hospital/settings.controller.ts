import { Request, Response } from "express";
import { HospitalSettingsService } from "../../services/hospital/settings.service";

const hospitalSettingsService = new HospitalSettingsService();

export const getHospitalSettings = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ settings: await hospitalSettingsService.get(String((req as any).hospitalId)) });
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to load hospital settings" });
  }
};

export const updateHospitalSettings = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ settings: await hospitalSettingsService.update(String((req as any).hospitalId), req.body) });
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to update hospital settings" });
  }
};
