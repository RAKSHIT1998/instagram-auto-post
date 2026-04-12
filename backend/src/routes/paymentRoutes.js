import { Router } from "express";
import { activateProPlan, createSubscriptionOrder, handleWebhook } from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/order", requireAuth, createSubscriptionOrder);
router.post("/activate", requireAuth, activateProPlan);
router.post("/webhook", handleWebhook);

export default router;
