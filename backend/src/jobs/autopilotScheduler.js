import cron from "node-cron";
import AutopilotConfig from "../models/AutopilotConfig.js";
import { generateAutopilotTopic } from "../services/ai/contentGenerator.js";
import { generateAndPublishPost } from "../services/postCreationService.js";

const CADENCE_MS = {
  daily: 24 * 60 * 60 * 1000,
  every_2_days: 2 * 24 * 60 * 60 * 1000,
  every_3_days: 3 * 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000
};

export async function runAutopilotForConfig(config, now = new Date()) {
  const topic = await generateAutopilotTopic({
    niche: config.niche,
    tone: config.tone,
    audience: config.audience,
    goal: config.goal,
    recentTopics: config.recentTopics
  });

  await generateAndPublishPost({
    userId: config.userId,
    topic,
    niche: config.niche,
    tone: config.tone,
    audience: config.audience,
    goal: config.goal
  });

  config.lastRunAt = now;
  config.nextRunAt = new Date(now.getTime() + (CADENCE_MS[config.cadence] || CADENCE_MS.daily));
  config.recentTopics = [...(config.recentTopics || []), topic].slice(-15);
  config.lastError = undefined;
  config.consecutiveFailures = 0;
  await config.save();
}

export function startAutopilotScheduler() {
  cron.schedule("*/15 * * * *", async () => {
    const now = new Date();

    const due = await AutopilotConfig.find({
      enabled: true,
      $or: [{ nextRunAt: { $lte: now } }, { nextRunAt: { $exists: false } }, { nextRunAt: null }]
    }).limit(200);

    for (const config of due) {
      try {
        await runAutopilotForConfig(config, now);
      } catch (error) {
        config.lastError = error.message;
        config.lastErrorAt = now;
        config.consecutiveFailures = (config.consecutiveFailures || 0) + 1;
        config.nextRunAt = new Date(now.getTime() + (CADENCE_MS[config.cadence] || CADENCE_MS.daily));
        await config.save().catch(() => {});
        console.error(`Autopilot failed for user ${config.userId}:`, error.message);
      }
    }
  });

  console.log("Autopilot scheduler started (checks every 15 minutes)");
}
