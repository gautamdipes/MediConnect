import { Router } from "express";
import { listHospitalNotifications, markAllHospitalNotificationsRead, markHospitalNotificationRead } from "../../controllers/hospital/notification.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { hospitalMiddleware } from "../../middleware/hospital.middleware";

const router = Router();
router.use(authMiddleware, hospitalMiddleware);
router.get("/", listHospitalNotifications);
router.patch("/read-all", markAllHospitalNotificationsRead);
router.patch("/:notificationId/read", markHospitalNotificationRead);
export default router;
