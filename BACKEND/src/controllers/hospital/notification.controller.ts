import { Request, Response } from "express";
import { HospitalNotificationService } from "../../services/hospital/notification.service";

const hospitalNotificationService = new HospitalNotificationService();

export const listHospitalNotifications = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await hospitalNotificationService.list(String((req as any).hospitalId)));
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to load notifications" });
  }
};

export const markHospitalNotificationRead = async (req: Request<{ notificationId: string }>, res: Response) => {
  try {
    return res.status(200).json(await hospitalNotificationService.markRead(String((req as any).hospitalId), req.params.notificationId));
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to update notification" });
  }
};

export const markAllHospitalNotificationsRead = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await hospitalNotificationService.markAllRead(String((req as any).hospitalId)));
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Unable to update notifications" });
  }
};
