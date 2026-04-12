import { Router } from "express";
import { joinWaitlist } from "../controllers/waitlistController.js";

const router = Router();

router.post("/join", joinWaitlist);

export default router;
