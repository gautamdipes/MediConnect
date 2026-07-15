import { Router } from "express";
import { getHospitalDashboard } from "../../controllers/hospital/dashboard.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { hospitalMiddleware } from "../../middleware/hospital.middleware";

const router = Router();

router.use(authMiddleware, hospitalMiddleware);
router.get("/", getHospitalDashboard);

export default router;
