import { Router } from "express";
import { registerUser, loginUser, uploadProfileImage } from "../controllers/user.controller";
import { getMedicalRecords } from "../controllers/medical-record.controller";
import { authMiddleware } from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";
import { getUserOverview } from "../controllers/user/overview.controller";
import { listHospitals } from "../controllers/admin/hospital.controller";
import { listDoctors } from "../controllers/admin/doctor.controller";
import {
  listMyAppointments,
  bookAppointment,
  cancelMyAppointment,
  getDashboardOverview,
} from "../controllers/user/appointment.controller";

const router = Router();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/auth/profile/upload", authMiddleware, uploads.single("file"), uploadProfileImage);

// Dashboard
router.get("/dashboard", authMiddleware, getDashboardOverview);

// Overview (stats)
router.get("/overview", authMiddleware, getUserOverview);

// Medical records
router.get("/medical-records", authMiddleware, getMedicalRecords);

// Appointments
router.get("/appointments", authMiddleware, listMyAppointments);
router.post("/appointments", authMiddleware, bookAppointment);
router.patch("/appointments/:id/cancel", authMiddleware, cancelMyAppointment);

// Browse
router.get("/hospitals", authMiddleware, listHospitals);
router.get("/doctors", authMiddleware, listDoctors);

export default router;
