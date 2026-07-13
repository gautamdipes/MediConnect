import { Router } from "express";
import {
  createMedicalRecord,
  getMedicalRecordById,
  getMedicalRecords,
  deleteMedicalRecord,
  updateMedicalRecord
} from "../controllers/medical-record.controller";
import { authMiddleware } from "../middleware/authorized.middleware";

const router = Router();

router.post("/", authMiddleware, createMedicalRecord);
router.get("/", authMiddleware, getMedicalRecords);
router.get("/:id", authMiddleware, getMedicalRecordById);
router.put("/:id", authMiddleware, updateMedicalRecord);
router.delete("/:id", authMiddleware, deleteMedicalRecord);

export default router;
