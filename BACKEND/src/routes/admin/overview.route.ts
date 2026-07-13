import { Router } from "express";
import { getOverviewStats } from "../../controllers/admin/overview.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";

const router = Router();

// Assuming admin routes need auth
router.use(authMiddleware);

router.get("/", getOverviewStats);

export default router;
