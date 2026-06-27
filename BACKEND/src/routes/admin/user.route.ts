import { Router } from "express";
import { listUsers, getUser, createUser, updateUser, deleteUser } from "../../controllers/admin/user.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";

const router = Router();

// All admin user routes require authentication and admin role
router.get("/", authMiddleware, adminMiddleware, listUsers);
router.get("/:id", authMiddleware, adminMiddleware, getUser);
router.post("/", authMiddleware, adminMiddleware, createUser);
router.put("/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;
