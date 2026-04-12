import { Router } from "express";
import { activateProPlan, createSubscriptionOrder } from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/order", requireAuth, createSubscriptionOrder);
router.post("/activate", requireAuth, activateProPlan);

export default router;
