import cron from "node-cron";
import PlatformPost from "../models/PlatformPost.js";
import Analytics from "../models/Analytics.js";
import { fetchMetrics } from "../services/platformMetrics.js";

function calcScore(metrics) {
  return metrics.likes + metrics.comments * 2 + metrics.shares * 3;
}

export function startAnalyticsCollector() {
  cron.schedule("0 * * * *", async () => {
    const posts = await PlatformPost.find({ status: "posted" }).populate("postId", "userId").limit(500);

    for (const post of posts) {
      try {
        const metrics = await fetchMetrics(post, post.postId?.userId);
        const score = calcScore(metrics);

        post.metrics = metrics;
        await post.save();

        await Analytics.create({
          postId: post.postId?._id,
          platformPostId: post._id,
          platform: post.platform,
          ...metrics,
          score
        });
      } catch (error) {
        console.error(`Analytics collection failed for platform post ${post._id}:`, error.message);
      }
    }
  });

  console.log("Analytics collector started (hourly)");
}
