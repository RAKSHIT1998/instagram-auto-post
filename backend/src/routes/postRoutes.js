import { Router } from "express";
import { createPost, listMyPosts } from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/create", requireAuth, createPost);
router.get("/mine", requireAuth, listMyPosts);

export default router;
