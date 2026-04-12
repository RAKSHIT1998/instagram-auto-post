import { z } from "zod";
import { generateMultiPlatformContent } from "../services/ai/contentGenerator.js";

const generateSchema = z.object({
  topic: z.string().min(3).optional(),
  idea: z.string().min(3).optional(),
  niche: z.string().min(2),
  audience: z.string().optional(),
  tone: z.string().default("motivational"),
  goal: z.string().optional(),
  priority: z.string().optional(),
  top_posts: z.array(z.string()).optional()
}).refine((d) => Boolean(d.topic || d.idea), {
  message: "Either topic or idea is required",
  path: ["topic"]
});

export async function generateContent(req, res, next) {
  try {
    const body = generateSchema.parse(req.body);
    const content = await generateMultiPlatformContent(body);
    res.json(content);
  } catch (error) {
    next(error);
  }
}
