import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    platformPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlatformPost",
      required: true,
      index: true
    },
    platform: {
      type: String,
      enum: ["instagram", "facebook", "twitter", "linkedin"],
      required: true,
      index: true
    },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    retweets: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

AnalyticsSchema.index({ platform: 1, score: -1 });

export default mongoose.model("Analytics", AnalyticsSchema);
