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
import oauthRoutes from "./routes/oauthRoutes.js";
import autopilotRoutes from "./routes/autopilotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { initPublishWorker } from "./queue/publishQueue.js";
import { startScheduler } from "./jobs/scheduler.js";
import { startAnalyticsCollector } from "./jobs/analyticsCollector.js";
import { startAutopilotScheduler } from "./jobs/autopilotScheduler.js";

const app = express();

const allowedOrigins = (env.CORS_ORIGIN || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    }
  })
);

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
app.use("/api/oauth", oauthRoutes);
app.use("/api/autopilot", autopilotRoutes);
app.use("/api/admin", adminRoutes);

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

  if (env.RUN_AUTOPILOT) {
    startAutopilotScheduler();
  }

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}
