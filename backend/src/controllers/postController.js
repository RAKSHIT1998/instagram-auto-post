import { z } from "zod";
import Post from "../models/Post.js";
import PlatformPost from "../models/PlatformPost.js";
import User from "../models/User.js";
import { generateMultiPlatformContent } from "../services/ai/contentGenerator.js";
import { generateImageFromIdea } from "../services/imageGenerator.js";
import { enqueuePublish } from "../queue/publishQueue.js";
import { predictBestTime } from "../utils/bestTimePredictor.js";

const createSchema = z.object({
  topic: z.string().min(3),
  niche: z.string().min(2),
  tone: z.string().default("bold"),
  audience: z.string().optional(),
  goal: z.string().optional(),
  priority: z.string().optional(),
  top_posts: z.array(z.string()).optional()
});

function inSameMonth(a, b) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

async function enforcePlanQuota(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const now = new Date();
  if (!inSameMonth(new Date(user.billingCycleStart), now)) {
    user.billingCycleStart = now;
    user.postsUsedThisMonth = 0;
  }

  if (user.plan === "free" && user.postsUsedThisMonth >= 10) {
    const err = new Error("Free plan limit reached (10 posts/month)");
    err.status = 402;
    throw err;
  }

  user.postsUsedThisMonth += 1;
  await user.save();
  return user;
}

export async function createPost(req, res, next) {
  try {
    const body = createSchema.parse(req.body);
    await enforcePlanQuota(req.user.sub);

    const ai = await generateMultiPlatformContent({
      topic: body.topic,
      niche: body.niche,
      tone: body.tone,
      audience: body.audience,
      goal: body.goal,
      priority: body.priority,
      top_posts: body.top_posts
    });

    const image = await generateImageFromIdea({ idea: body.topic, niche: body.niche });

    const post = await Post.create({
      idea: body.topic,
      niche: body.niche,
      tone: body.tone,
      userId: req.user.sub
    });

    const platforms = [
      {
        name: "instagram",
        content: `${ai.instagram.caption}\n\n${(ai.instagram.hashtags || []).join(" ")}`
      },
      { name: "twitter", content: ai.twitter.tweet },
      { name: "linkedin", content: ai.linkedin.post },
      { name: "facebook", content: ai.facebook.post }
    ];

    const created = [];
    for (const p of platforms) {
      const saved = await PlatformPost.create({
        postId: post._id,
        platform: p.name,
        content: p.content,
        hashtags: p.name === "instagram" ? ai.instagram.hashtags : [],
        mediaUrl: image,
        mediaType: image ? "image" : "none",
        scheduledAt: predictBestTime(p.name)
      });

      await enqueuePublish(saved._id.toString());
      created.push(saved);
    }

    res.status(201).json({ success: true, post, platformPosts: created, generated: ai });
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
