import { Router } from "express";
import { registerUser, loginUser, updateUser, uploadProfileImage } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/auth/profile/upload", authMiddleware, uploads.single("file"), uploadProfileImage);

export default router;
