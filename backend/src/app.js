import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";
import publishRoutes from "./routes/publishRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import { initPublishWorker } from "./queue/publishQueue.js";
import { startScheduler } from "./jobs/scheduler.js";
import { startAnalyticsCollector } from "./jobs/analyticsCollector.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "social-multi-platform-backend" });
});

app.use("/api/ai", aiRoutes);
app.use("/api/publish", publishRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/integrations", integrationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export async function startServer() {
  await connectDB();

  if (env.RUN_EMBEDDED_WORKER) {
    initPublishWorker();
  }

  if (env.RUN_SCHEDULER) {
    startScheduler();
  }

  if (env.RUN_ANALYTICS_CRON) {
    startAnalyticsCollector();
  }

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}
