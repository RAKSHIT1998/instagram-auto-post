import { Queue, Worker } from "bullmq";
import PlatformPost from "../models/PlatformPost.js";
import { createRedisConnection } from "../config/redis.js";
import { publishToPlatform } from "../services/platformPublisher.js";

const connection = createRedisConnection();

export const publishQueue = new Queue("publish-queue", { connection });

export async function enqueuePublish(platformPostId) {
  await publishQueue.add(
    "publish",
    { platformPostId },
    {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 200,
      backoff: {
        type: "exponential",
        delay: 5000
      }
    }
  );
}

export function initPublishWorker() {
  const worker = new Worker(
    "publish-queue",
    async (job) => {
      const { platformPostId } = job.data;
      const doc = await PlatformPost.findById(platformPostId);
      if (!doc) return;

      doc.status = "queued";
      await doc.save();

      const result = await publishToPlatform(doc.platform, {
        content: doc.content,
        mediaUrl: doc.mediaUrl,
        mediaType: doc.mediaType
      });

      doc.status = "posted";
      doc.externalPostId = result.externalPostId;
      doc.publishedAt = new Date();
      doc.error = undefined;
      await doc.save();
    },
    { connection }
  );

  worker.on("failed", async (job, err) => {
    const platformPostId = job?.data?.platformPostId;
    if (!platformPostId) return;

    const doc = await PlatformPost.findById(platformPostId);
    if (!doc) return;

    doc.status = "failed";
    doc.error = err.message;
    await doc.save();
  });

  console.log("Publish worker started");
  return worker;
}
