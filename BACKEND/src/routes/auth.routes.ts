import { Router } from "express";
import { whoami, updateProfile, updatePassword } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";

const router = Router();

// Return the logged‑in user's info (payload from JWT)
router.get("/whoami", authMiddleware, whoami);

// Update user profile (accepts JSON fields + optional image upload)
router.post("/update", authMiddleware, uploads.single("file"), updateProfile);
router.put("/password", authMiddleware, updatePassword);

export default router;
export const authRouter = router;
