import { Router } from "express";
import { getMRR, getAdminOverview } from "../controllers/adminController.js";
import { getAnalytics, getAnalyticsOverview } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/mrr", getMRR);
router.get("/analytics", getAnalytics);
router.get("/analytics/overview", getAnalyticsOverview);
router.get("/overview", getAdminOverview);

export default router;
