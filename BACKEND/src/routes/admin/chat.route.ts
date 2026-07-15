import { Router } from "express";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { sendAdminChatMessage } from "../../controllers/admin/chat.controller";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post("/", sendAdminChatMessage);

export default router;
