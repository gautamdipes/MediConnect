import { Request, Response } from "express";
import { HospitalDashboardService } from "../../services/hospital/dashboard.service";

const hospitalDashboardService = new HospitalDashboardService();

/** GET /api/v1/hospital/dashboard */
export const getHospitalDashboard = async (req: Request, res: Response) => {
  try {
    const hospitalId = (req as any).hospitalId;
    if (!hospitalId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const overview = await hospitalDashboardService.getOverview(String(hospitalId));
    return res.status(200).json(overview);
  } catch (err: any) {
    return res.status(err.status || 500).json({ message: err.message || "Unable to load hospital dashboard" });
  }
};
