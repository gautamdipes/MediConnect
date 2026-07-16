import { Router } from "express";
import { registerUser, loginUser, googleLoginUser, uploadProfileImage, updateUser, requestPasswordReset, verifyPasswordResetCode, confirmPasswordReset } from "../controllers/user.controller";
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
import { sendChatMessage } from "../controllers/user/chat.controller";
import { UserRepository } from "../repositories/user.repository";

const router = Router();
const userRepo = new UserRepository();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLoginUser);
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/verify", verifyPasswordResetCode);
router.post("/password-reset/confirm", confirmPasswordReset);
router.post("/auth/profile/upload", authMiddleware, uploads.single("file"), uploadProfileImage);

// Profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const user = await userRepo.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        adminProfileImage: user.adminProfileImage,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/profile", authMiddleware, uploads.single("file"), updateUser);

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

// AI Chat
router.post("/chat", authMiddleware, sendChatMessage);

export default router;
