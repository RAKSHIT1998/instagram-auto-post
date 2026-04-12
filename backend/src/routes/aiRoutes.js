import { Router } from "express";
import { generateContent } from "../controllers/aiController.js";

const router = Router();

router.post("/generate", generateContent);

export default router;
