import cron from "node-cron";
import PlatformPost from "../models/PlatformPost.js";
import Analytics from "../models/Analytics.js";
import { fetchMetrics } from "../services/platformMetrics.js";

function calcScore(metrics) {
  return metrics.likes + metrics.comments * 2 + metrics.shares * 3;
}

export function startAnalyticsCollector() {
  cron.schedule("0 * * * *", async () => {
    const posts = await PlatformPost.find({ status: "posted" }).limit(500);

    for (const post of posts) {
      const metrics = await fetchMetrics(post);
      const score = calcScore(metrics);

       post.metrics = metrics;
       await post.save();

      await Analytics.create({
        postId: post.postId,
        platformPostId: post._id,
        platform: post.platform,
        ...metrics,
        score
      });
    }
  });

  console.log("Analytics collector started (hourly)");
}
