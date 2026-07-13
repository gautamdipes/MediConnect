import { Router } from "express";
import {
  listAppointments,
  getAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from "../../controllers/admin/appointment.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";

const router = Router();

// Assuming admin routes need auth
router.use(authMiddleware);

router.get("/", listAppointments);
router.get("/:id", getAppointment);
router.patch("/:id/status", updateAppointmentStatus);
router.delete("/:id", deleteAppointment);

export default router;
