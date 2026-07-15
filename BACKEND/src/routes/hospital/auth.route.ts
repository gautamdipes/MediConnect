import { Router } from "express";
import { hospitalLogin } from "../../controllers/hospital/auth.controller";

const router = Router();

router.post("/login", hospitalLogin);

export default router;
