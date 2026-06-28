import { Router } from "express";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/admin/user.controller";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;