import { z } from "zod";
import SocialConnection from "../models/SocialConnection.js";
import { encryptSecret } from "../utils/crypto.js";

const connectSchema = z.object({
  platform: z.enum(["instagram", "facebook", "twitter", "linkedin"]),
  accountLabel: z.string().min(2).optional(),
  accessToken: z.string().min(4).optional(),
  refreshToken: z.string().min(4).optional(),
  tokenExpiresAt: z.coerce.date().optional(),
  scopes: z.array(z.string().min(1)).optional(),
  providerAccountId: z.string().min(1).optional(),
  metadata: z.record(z.any()).optional()
});

const visiblePlatforms = ["instagram", "facebook", "twitter", "linkedin"];
const requiredPlatforms = ["instagram", "twitter", "linkedin"];

function toPublicIntegration(doc) {
  if (!doc) return null;

  return {
    _id: doc._id,
    userId: doc.userId,
    platform: doc.platform,
    status: doc.status,
    accountLabel: doc.accountLabel,
    tokenConfigured: Boolean(doc.encryptedAccessToken || doc.accessToken),
    tokenExpiresAt: doc.tokenExpiresAt,
    scopes: doc.scopes || [],
    providerAccountId: doc.providerAccountId,
    lastValidatedAt: doc.lastValidatedAt,
    metadata: doc.metadata,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export async function getIntegrationsStatus(req, res, next) {
  try {
    const docs = await SocialConnection.find({ userId: req.user.sub, status: "connected" });
    const map = Object.fromEntries(visiblePlatforms.map((platform) => [platform, false]));

    docs.forEach((d) => {
      map[d.platform] = true;
    });

    const allConnected = requiredPlatforms.every((platform) => map[platform]);
    res.json({
      connected: map,
      allConnected,
      integrations: docs.map((doc) => toPublicIntegration(doc.toObject()))
    });
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
          encryptedAccessToken: body.accessToken ? encryptSecret(body.accessToken) : undefined,
          encryptedRefreshToken: body.refreshToken ? encryptSecret(body.refreshToken) : undefined,
          tokenExpiresAt: body.tokenExpiresAt,
          scopes: body.scopes,
          providerAccountId: body.providerAccountId,
          lastValidatedAt: new Date(),
          metadata: body.metadata
        },
        $unset: {
          accessToken: ""
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, integration: toPublicIntegration(doc.toObject()) });
  } catch (error) {
    next(error);
  }
}

export async function disconnectIntegration(req, res, next) {
  try {
    const platform = z.enum(["instagram", "facebook", "twitter", "linkedin"]).parse(req.params.platform);
    const doc = await SocialConnection.findOneAndUpdate(
      { userId: req.user.sub, platform },
      {
        $set: { status: "disconnected" },
        $unset: {
          accessToken: "",
          encryptedAccessToken: "",
          encryptedRefreshToken: "",
          tokenExpiresAt: "",
          scopes: "",
          providerAccountId: "",
          metadata: ""
        }
      },
      { new: true }
    );

    res.json({ success: true, integration: toPublicIntegration(doc?.toObject()) });
  } catch (error) {
    next(error);
  }
}
