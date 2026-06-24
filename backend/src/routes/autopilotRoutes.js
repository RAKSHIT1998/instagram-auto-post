import { Router } from "express";
import { getAutopilotConfig, updateAutopilotConfig, runAutopilotNow } from "../controllers/autopilotController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getAutopilotConfig);
router.put("/", requireAuth, updateAutopilotConfig);
router.post("/run-now", requireAuth, runAutopilotNow);

export default router;
