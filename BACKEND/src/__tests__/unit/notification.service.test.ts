import { HospitalNotificationService } from "../../services/hospital/notification.service";
import { HospitalNotificationModel } from "../../models/hospital-notification.model";
import { HospitalModel } from "../../models/hospital.model";
import { clearDatabase } from "../test-utils";
import mongoose from "mongoose";

describe("HospitalNotificationService Unit Tests", () => {
  let service: HospitalNotificationService;
  let hospitalId: string;

  beforeAll(() => {
    service = new HospitalNotificationService();
  });

  beforeEach(async () => {
    await clearDatabase();
    const hospital = await HospitalModel.create({
      hospitalName: "Test Hospital",
      email: "hospital@example.com",
      phoneNumber: "1234567890",
      city: "Test City",
      state: "Test State",
      departments: ["General"],
      notificationPreferences: {
        appointmentAlerts: true,
        checkInAlerts: true,
        recordAlerts: true
      }
    });
    hospitalId = String(hospital._id);
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("create - creates notification if preference is enabled", async () => {
    const res = await service.create(hospitalId, {
      title: "Appointment Alert",
      detail: "Details here",
      type: "appointment"
    });
    expect(res).toBeDefined();
    expect(res?.title).toBe("Appointment Alert");

    // Check DB
    const dbNotif = await HospitalNotificationModel.findOne({ hospitalId });
    expect(dbNotif).toBeDefined();
    expect(dbNotif?.title).toBe("Appointment Alert");
  });

  test("create - does not create notification if preference is disabled", async () => {
    // Disable check-in alerts
    await HospitalModel.findByIdAndUpdate(hospitalId, {
      "notificationPreferences.checkInAlerts": false
    });

    const res = await service.create(hospitalId, {
      title: "Check-in Alert",
      detail: "Details here",
      type: "check-in"
    });
    expect(res).toBeNull();

    // Check DB
    const dbNotif = await HospitalNotificationModel.findOne({ hospitalId, type: "check-in" });
    expect(dbNotif).toBeNull();
  });

  test("list - returns all notifications for a hospital sorted by newest", async () => {
    await service.create(hospitalId, {
      title: "Alert 1",
      detail: "Detail 1",
      type: "appointment"
    });
    await service.create(hospitalId, {
      title: "Alert 2",
      detail: "Detail 2",
      type: "appointment"
    });

    const res = await service.list(hospitalId);
    expect(res.notifications).toHaveLength(2);
    expect(res.notifications[0].title).toBe("Alert 2"); // Sorted by newest (createdAt: -1)
    expect(res.notifications[1].title).toBe("Alert 1");
  });

  test("markRead - marks a single notification as read", async () => {
    const notif = await service.create(hospitalId, {
      title: "Alert",
      detail: "Detail",
      type: "appointment"
    });

    const res = await service.markRead(hospitalId, notif?._id.toString() || "");
    expect(res.notification.read).toBe(true);

    // Verify DB
    const dbNotif = await HospitalNotificationModel.findById(notif?._id);
    expect(dbNotif?.read).toBe(true);
  });

  test("markRead - throws 404 if notification is not found", async () => {
    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.markRead(hospitalId, bogusId)).rejects.toMatchObject({
      status: 404,
      message: "Notification not found"
    });
  });

  test("markAllRead - marks all notifications as read", async () => {
    await service.create(hospitalId, {
      title: "Alert 1",
      detail: "Detail 1",
      type: "appointment"
    });
    await service.create(hospitalId, {
      title: "Alert 2",
      detail: "Detail 2",
      type: "appointment"
    });

    const res = await service.markAllRead(hospitalId);
    expect(res.success).toBe(true);

    // Verify DB
    const dbNotifs = await HospitalNotificationModel.find({ hospitalId });
    expect(dbNotifs).toHaveLength(2);
    expect(dbNotifs[0].read).toBe(true);
    expect(dbNotifs[1].read).toBe(true);
  });
});
