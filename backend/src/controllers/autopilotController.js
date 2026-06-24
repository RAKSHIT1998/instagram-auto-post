import { z } from "zod";
import AutopilotConfig from "../models/AutopilotConfig.js";
import { runAutopilotForConfig } from "../jobs/autopilotScheduler.js";

const updateSchema = z.object({
  niche: z.string().min(2),
  tone: z.string().default("bold"),
  audience: z.string().optional(),
  goal: z.string().optional(),
  cadence: z.enum(["daily", "every_2_days", "every_3_days", "weekly"]).default("daily"),
  enabled: z.boolean().default(false)
});

export async function getAutopilotConfig(req, res, next) {
  try {
    const config = await AutopilotConfig.findOne({ userId: req.user.sub });
    res.json(
      config || {
        enabled: false,
        niche: "",
        tone: "bold",
        audience: "",
        goal: "",
        cadence: "daily"
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function updateAutopilotConfig(req, res, next) {
  try {
    const body = updateSchema.parse(req.body);
    const existing = await AutopilotConfig.findOne({ userId: req.user.sub });
    const turningOn = body.enabled && !existing?.enabled;

    const config = await AutopilotConfig.findOneAndUpdate(
      { userId: req.user.sub },
      {
        $set: {
          niche: body.niche,
          tone: body.tone,
          audience: body.audience,
          goal: body.goal,
          cadence: body.cadence,
          enabled: body.enabled,
          ...(turningOn ? { nextRunAt: new Date() } : {})
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(config);
  } catch (error) {
    next(error);
  }
}

export async function runAutopilotNow(req, res, next) {
  try {
    const config = await AutopilotConfig.findOne({ userId: req.user.sub });
    if (!config) {
      return res.status(404).json({ message: "Autopilot is not configured yet" });
    }

    await runAutopilotForConfig(config);
    res.json({ success: true, config });
  } catch (error) {
    next(error);
  }
}
