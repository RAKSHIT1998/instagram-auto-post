import Post from "../models/Post.js";
import PlatformPost from "../models/PlatformPost.js";
import User from "../models/User.js";
import { generateMultiPlatformContent } from "./ai/contentGenerator.js";
import { generateImageFromIdea } from "./imageGenerator.js";
import { enqueuePublish } from "../queue/publishQueue.js";
import { predictBestTime } from "../utils/bestTimePredictor.js";
import { getConnectedPlatforms } from "./platformCredentials.js";

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

export async function generateAndPublishPost({
  userId,
  topic,
  niche,
  tone = "bold",
  audience,
  goal,
  priority,
  top_posts
}) {
  await enforcePlanQuota(userId);
  const connectedPlatforms = await getConnectedPlatforms(userId);

  if (!connectedPlatforms.length) {
    const err = new Error("Connect at least one platform before creating a post");
    err.status = 400;
    throw err;
  }

  const ai = await generateMultiPlatformContent({ topic, niche, tone, audience, goal, priority, top_posts });
  const image = await generateImageFromIdea({ idea: topic, niche });

  const post = await Post.create({
    idea: topic,
    niche,
    tone,
    userId
  });

  const contentMap = {
    instagram: `${ai.instagram.caption}\n\n${(ai.instagram.hashtags || []).join(" ")}`,
    twitter: ai.twitter.tweet,
    linkedin: ai.linkedin.post,
    facebook: ai.facebook.post
  };

  const platforms = connectedPlatforms
    .filter((platform) => Object.prototype.hasOwnProperty.call(contentMap, platform))
    .map((platform) => ({
      name: platform,
      content: contentMap[platform]
    }));

  if (!platforms.length) {
    const err = new Error("No supported connected platforms found for publishing");
    err.status = 400;
    throw err;
  }

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

  return { post, platformPosts: created, generated: ai };
}
