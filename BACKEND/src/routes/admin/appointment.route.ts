import { Router } from "express";
import {
  listAppointments,
  getAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  createAppointment,
  updateAppointment
} from "../../controllers/admin/appointment.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";

const router = Router();

// Assuming admin routes need auth
router.use(authMiddleware);

router.get("/", listAppointments);
router.post("/", createAppointment);
router.get("/:id", getAppointment);
router.patch("/:id/status", updateAppointmentStatus);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
