import { Router } from "express";
import { createHospitalAppointment, listHospitalAppointments, updateHospitalAppointmentStatus } from "../../controllers/hospital/appointment.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { hospitalMiddleware } from "../../middleware/hospital.middleware";

const router = Router();
router.use(authMiddleware, hospitalMiddleware);
router.get("/", listHospitalAppointments);
router.post("/", createHospitalAppointment);
router.patch("/:id/status", updateHospitalAppointmentStatus);
export default router;
