import { Router } from "express";
import {
  createMedicalRecord,
  getMedicalRecordById,
  getMedicalRecords,
  deleteMedicalRecord,
  updateMedicalRecord
} from "../controllers/medical-record.controller";
import { uploads } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/authorized.middleware";

const router = Router();

router.post("/", authMiddleware, uploads.single("file"), createMedicalRecord);
router.get("/", authMiddleware, getMedicalRecords);
router.get("/:id", authMiddleware, getMedicalRecordById);
router.put("/:id", authMiddleware, uploads.single("file"), updateMedicalRecord);
router.delete("/:id", authMiddleware, deleteMedicalRecord);

export default router;
