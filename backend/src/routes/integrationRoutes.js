import { Router } from "express";
import {
  connectIntegration,
  disconnectIntegration,
  getIntegrationsStatus
} from "../controllers/integrationsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/status", requireAuth, getIntegrationsStatus);
router.post("/connect", requireAuth, connectIntegration);
router.delete("/:platform", requireAuth, disconnectIntegration);

export default router;
