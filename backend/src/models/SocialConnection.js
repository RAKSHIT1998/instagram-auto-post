import mongoose from "mongoose";

const SocialConnectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    platform: {
      type: String,
      enum: ["instagram", "facebook", "twitter", "linkedin"],
      required: true,
      index: true
    },
    status: { type: String, enum: ["connected", "disconnected"], default: "connected" },
    accountLabel: { type: String },
    accessToken: { type: String },
    encryptedAccessToken: { type: String },
    encryptedRefreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    scopes: [{ type: String }],
    providerAccountId: { type: String },
    lastValidatedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

SocialConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model("SocialConnection", SocialConnectionSchema);
