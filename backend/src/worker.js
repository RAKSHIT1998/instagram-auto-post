import { connectDB } from "./config/db.js";
import { initPublishWorker } from "./queue/publishQueue.js";
import { startScheduler } from "./jobs/scheduler.js";
import { startAnalyticsCollector } from "./jobs/analyticsCollector.js";

async function boot() {
  await connectDB();
  initPublishWorker();
  startScheduler();
  startAnalyticsCollector();
  console.log("Worker started");
}

boot();
