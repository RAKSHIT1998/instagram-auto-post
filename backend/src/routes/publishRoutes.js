import { Router } from "express";
import {
  createCorePost,
  ingestAnalytics,
  listPlatformPosts,
  publishNow,
  schedulePlatformPost,
  topPerformers
} from "../controllers/publishController.js";

const router = Router();

router.post("/core", createCorePost);
router.get("/platform-posts", listPlatformPosts);
router.post("/platform-posts/:id/schedule", schedulePlatformPost);
router.post("/platform-posts/:id/publish", publishNow);
router.post("/platform-posts/:id/analytics", ingestAnalytics);
router.get("/analytics/top", topPerformers);

export default router;
