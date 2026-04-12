import { z } from "zod";
import SocialConnection from "../models/SocialConnection.js";

const connectSchema = z.object({
  platform: z.enum(["instagram", "twitter", "linkedin"]),
  accountLabel: z.string().min(2).optional(),
  accessToken: z.string().min(4).optional(),
  metadata: z.record(z.any()).optional()
});

export async function getIntegrationsStatus(req, res, next) {
  try {
    const docs = await SocialConnection.find({ userId: req.user.sub, status: "connected" });
    const map = {
      instagram: false,
      twitter: false,
      linkedin: false
    };

    docs.forEach((d) => {
      map[d.platform] = true;
    });

    res.json({ connected: map, allConnected: Object.values(map).every(Boolean), integrations: docs });
  } catch (error) {
    next(error);
  }
}

export async function connectIntegration(req, res, next) {
  try {
    const body = connectSchema.parse(req.body);

    const doc = await SocialConnection.findOneAndUpdate(
      { userId: req.user.sub, platform: body.platform },
      {
        $set: {
          status: "connected",
          accountLabel: body.accountLabel,
          accessToken: body.accessToken,
          metadata: body.metadata
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, integration: doc });
  } catch (error) {
    next(error);
  }
}

export async function disconnectIntegration(req, res, next) {
  try {
    const platform = z.enum(["instagram", "twitter", "linkedin"]).parse(req.params.platform);
    const doc = await SocialConnection.findOneAndUpdate(
      { userId: req.user.sub, platform },
      { $set: { status: "disconnected" } },
      { new: true }
    );

    res.json({ success: true, integration: doc });
  } catch (error) {
    next(error);
  }
}
