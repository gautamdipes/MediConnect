import { Router } from "express";
import { getHospitalPatient, listHospitalPatients } from "../../controllers/hospital/patient.controller";
import { authMiddleware } from "../../middleware/authorized.middleware";
import { hospitalMiddleware } from "../../middleware/hospital.middleware";

const router = Router();

router.use(authMiddleware, hospitalMiddleware);
router.get("/", listHospitalPatients);
router.get("/:patientId", getHospitalPatient);

export default router;
