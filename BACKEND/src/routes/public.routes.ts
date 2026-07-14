import { Router } from "express";
import { getLanding } from "../controllers/public/landing.controller";

const router = Router();

router.get("/landing", getLanding);

export default router;
