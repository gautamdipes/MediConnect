import { Request, Response } from "express";
import { AdminOverviewService } from "../../services/admin/overview.service";

const service = new AdminOverviewService();

export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const stats = await service.getOverviewStats();
    res.status(200).json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
