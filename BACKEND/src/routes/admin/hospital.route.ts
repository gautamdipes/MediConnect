import { Router } from "express";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";
import {
  listHospitals,
  getHospital,
  createHospital,
  updateHospital,
  verifyHospital,
  deleteHospital,
} from "../../controllers/admin/hospital.controller";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", listHospitals);
router.get("/:id", getHospital);
router.post("/", createHospital);
router.put("/:id", updateHospital);
router.patch("/:id/verify", verifyHospital);
router.delete("/:id", deleteHospital);

export default router;