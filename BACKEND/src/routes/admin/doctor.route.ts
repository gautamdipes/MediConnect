import { Router } from "express";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";
import {
  listDoctors,
  getStats,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../controllers/admin/doctor.controller";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", getStats);       // must be before /:id
router.get("/",      listDoctors);
router.get("/:id",   getDoctor);
router.post("/",     createDoctor);
router.put("/:id",   updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;