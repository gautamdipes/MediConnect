import { Request, Response } from "express";
import { UserOverviewService } from "../../services/user/overview.service";

const userOverviewService = new UserOverviewService();

export const getUserOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const overview = await userOverviewService.getOverview(userId);
    return res.status(200).json(overview);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
