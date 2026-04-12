import cron from "node-cron";
import PlatformPost from "../models/PlatformPost.js";
import { enqueuePublish } from "../queue/publishQueue.js";

export function startScheduler() {
  cron.schedule("*/10 * * * *", async () => {
    const now = new Date();

    const due = await PlatformPost.find({
      status: "pending",
      scheduledAt: { $lte: now }
    })
      .sort({ scheduledAt: 1 })
      .limit(100);

    for (const post of due) {
      await enqueuePublish(post._id.toString());
    }
  });

  console.log("Scheduler started (every 10 minutes)");
}
