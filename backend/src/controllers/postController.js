import { z } from "zod";
import PlatformPost from "../models/PlatformPost.js";
import { generateAndPublishPost } from "../services/postCreationService.js";

const createSchema = z.object({
  topic: z.string().min(3),
  niche: z.string().min(2),
  tone: z.string().default("bold"),
  audience: z.string().optional(),
  goal: z.string().optional(),
  priority: z.string().optional(),
  top_posts: z.array(z.string()).optional()
});

export async function createPost(req, res, next) {
  try {
    const body = createSchema.parse(req.body);
    const result = await generateAndPublishPost({ userId: req.user.sub, ...body });
    res.status(201).json({ success: true, post: result.post, platformPosts: result.platformPosts, generated: result.generated });
  } catch (error) {
    next(error);
  }
}

export async function listMyPosts(req, res, next) {
  try {
    const docs = await PlatformPost.find()
      .populate({ path: "postId", match: { userId: req.user.sub } })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(docs.filter((d) => d.postId));
  } catch (error) {
    next(error);
  }
}
