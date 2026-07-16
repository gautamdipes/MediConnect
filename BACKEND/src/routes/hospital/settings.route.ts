import { Router } from "express";
import { getHospitalSettings, updateHospitalSettings } from "../../controllers/hospital/settings.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { hospitalMiddleware } from "../../middleware/hospital.middleware";

const router = Router();
router.use(authMiddleware, hospitalMiddleware);
router.get("/", getHospitalSettings);
router.patch("/", updateHospitalSettings);
export default router;
