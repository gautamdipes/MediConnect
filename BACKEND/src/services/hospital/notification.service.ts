import { HospitalNotificationModel } from "../../models/hospital-notification.model";
import { HospitalModel } from "../../models/hospital.model";

export class HospitalNotificationService {
  async list(hospitalId: string) {
    const notifications = await HospitalNotificationModel.find({ hospitalId }).sort({ createdAt: -1 }).limit(50);
    return { notifications: notifications.map((notification: any) => this.serialize(notification)) };
  }

  async markRead(hospitalId: string, notificationId: string) {
    const notification = await HospitalNotificationModel.findOneAndUpdate({ _id: notificationId, hospitalId }, { read: true }, { new: true });
    if (!notification) throw { status: 404, message: "Notification not found" };
    return { notification: this.serialize(notification) };
  }

  async markAllRead(hospitalId: string) {
    await HospitalNotificationModel.updateMany({ hospitalId, read: false }, { $set: { read: true } });
    return { success: true };
  }

  async create(hospitalId: string, payload: { title: string; detail: string; type: "appointment" | "check-in" | "record" }) {
    const preferenceByType = { appointment: "appointmentAlerts", "check-in": "checkInAlerts", record: "recordAlerts" } as const;
    const hospital = await HospitalModel.findById(hospitalId).select("notificationPreferences");
    if (!hospital || hospital.notificationPreferences?.[preferenceByType[payload.type]] === false) return null;
    return HospitalNotificationModel.create({ hospitalId, ...payload });
  }

  private serialize(notification: any) {
    return { _id: notification._id, title: notification.title, detail: notification.detail, type: notification.type, read: notification.read, createdAt: notification.createdAt };
  }
}
