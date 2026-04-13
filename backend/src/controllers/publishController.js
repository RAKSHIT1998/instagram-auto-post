import { z } from "zod";
import Post from "../models/Post.js";
import PlatformPost from "../models/PlatformPost.js";
import Analytics from "../models/Analytics.js";
import { generateMultiPlatformContent } from "../services/ai/contentGenerator.js";
import { generateImageFromIdea } from "../services/imageGenerator.js";
import { predictBestTime } from "../utils/bestTimePredictor.js";
import { enqueuePublish } from "../queue/publishQueue.js";

const createSchema = z.object({
  idea: z.string().min(3),
  niche: z.string().min(2),
  tone: z.string().default("motivational"),
  audience: z.string().optional(),
  goal: z.string().optional(),
  priority: z.string().optional(),
  top_posts: z.array(z.string()).optional(),
  autoSchedule: z.boolean().default(true)
});

const scheduleSchema = z.object({
  scheduledAt: z.coerce.date()
});

const metricsSchema = z.object({
  likes: z.number().int().nonnegative().default(0),
  comments: z.number().int().nonnegative().default(0),
  shares: z.number().int().nonnegative().default(0),
  saves: z.number().int().nonnegative().default(0),
  impressions: z.number().int().nonnegative().default(0),
  clicks: z.number().int().nonnegative().default(0),
  retweets: z.number().int().nonnegative().default(0)
});

function buildPlatformDocs(postId, content, imageUrl, autoSchedule) {
  return [
    {
      postId,
      platform: "instagram",
      content: `${content.instagram.caption}\n\n${content.instagram.hashtags.join(" ")}`,
      hashtags: content.instagram.hashtags,
      mediaUrl: imageUrl,
      mediaType: imageUrl ? "image" : "none",
      scheduledAt: autoSchedule ? predictBestTime("instagram") : undefined
    },
    {
      postId,
      platform: "twitter",
      content: content.twitter.tweet,
      mediaUrl: imageUrl,
      mediaType: imageUrl ? "image" : "none",
      scheduledAt: autoSchedule ? predictBestTime("twitter") : undefined
    },
    {
      postId,
      platform: "linkedin",
      content: content.linkedin.post,
      mediaUrl: imageUrl,
      mediaType: imageUrl ? "image" : "none",
      scheduledAt: autoSchedule ? predictBestTime("linkedin") : undefined
    },
    {
      postId,
      platform: "facebook",
      content: content.facebook.post,
      mediaUrl: imageUrl,
      mediaType: imageUrl ? "image" : "none",
      scheduledAt: autoSchedule ? predictBestTime("facebook") : undefined
    }
  ];
}

function calculateScore(metrics) {
  return (
    metrics.likes +
    metrics.comments * 2 +
    metrics.shares * 3 +
    metrics.saves * 2 +
    metrics.clicks * 2 +
    metrics.retweets * 2
  );
}

function isOwner(userId, postDoc) {
  return Boolean(postDoc?.userId?.toString() === userId);
}

async function findOwnedPlatformPost(platformPostId, userId) {
  const doc = await PlatformPost.findById(platformPostId).populate("postId", "userId");
  if (!doc || !isOwner(userId, doc.postId)) {
    return null;
  }

  return doc;
}

export async function createCorePost(req, res, next) {
  try {
    const body = createSchema.parse(req.body);

    const [content, imageUrl] = await Promise.all([
      generateMultiPlatformContent({
        topic: body.idea,
        idea: body.idea,
        niche: body.niche,
        audience: body.audience,
        tone: body.tone,
        goal: body.goal,
        priority: body.priority,
        top_posts: body.top_posts
      }),
      generateImageFromIdea(body)
    ]);

    const post = await Post.create({
      idea: body.idea,
      niche: body.niche,
      tone: body.tone,
      userId: req.user.sub
    });

    const docs = buildPlatformDocs(post._id, content, imageUrl, body.autoSchedule);
    const platformPosts = await PlatformPost.insertMany(docs);

    res.status(201).json({ post, platformPosts });
  } catch (error) {
    next(error);
  }
}

export async function listPlatformPosts(_req, res, next) {
  try {
    const postIds = await Post.find({ userId: _req.user.sub }).select("_id").lean();
    const ids = postIds.map((doc) => doc._id);

    const docs = await PlatformPost.find({ postId: { $in: ids } })
      .populate("postId")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(docs);
  } catch (error) {
    next(error);
  }
}

export async function schedulePlatformPost(req, res, next) {
  try {
    const body = scheduleSchema.parse(req.body);
    const ownedDoc = await findOwnedPlatformPost(req.params.id, req.user.sub);

    if (!ownedDoc) {
      return res.status(404).json({ message: "PlatformPost not found" });
    }

    ownedDoc.scheduledAt = body.scheduledAt;
    ownedDoc.status = "pending";
    await ownedDoc.save();

    res.json(ownedDoc);
  } catch (error) {
    next(error);
  }
}

export async function publishNow(req, res, next) {
  try {
    const doc = await findOwnedPlatformPost(req.params.id, req.user.sub);
    if (!doc) {
      return res.status(404).json({ message: "PlatformPost not found" });
    }

    await enqueuePublish(doc._id.toString());
    res.json({ queued: true, id: doc._id });
  } catch (error) {
    next(error);
  }
}

export async function ingestAnalytics(req, res, next) {
  try {
    const metrics = metricsSchema.parse(req.body);
    const platformPost = await findOwnedPlatformPost(req.params.id, req.user.sub);

    if (!platformPost) {
      return res.status(404).json({ message: "PlatformPost not found" });
    }

    const score = calculateScore(metrics);
    const analytics = await Analytics.create({
      postId: platformPost.postId,
      platformPostId: platformPost._id,
      platform: platformPost.platform,
      ...metrics,
      score
    });

    res.status(201).json(analytics);
  } catch (error) {
    next(error);
  }
}

export async function topPerformers(req, res, next) {
  try {
    const limit = Number(req.query.limit || 10);
    const postIds = await Post.find({ userId: req.user.sub }).select("_id").lean();
    const ids = postIds.map((doc) => doc._id);

    const docs = await Analytics.find({ postId: { $in: ids } })
      .sort({ score: -1 })
      .limit(limit)
      .populate("platformPostId");
    res.json(docs);
  } catch (error) {
    next(error);
  }
}
