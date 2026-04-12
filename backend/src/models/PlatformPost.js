import mongoose from "mongoose";

const PlatformPostSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    platform: {
      type: String,
      enum: ["instagram", "facebook", "twitter", "linkedin"],
      required: true,
      index: true
    },
    content: { type: String, required: true },
    hashtags: [{ type: String }],
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none"
    },
    status: {
      type: String,
      enum: ["pending", "queued", "posted", "failed"],
      default: "pending",
      index: true
    },
    scheduledAt: { type: Date, index: true },
    publishedAt: Date,
    externalPostId: String,
    error: String,
    metrics: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      retweets: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

PlatformPostSchema.index({ platform: 1, scheduledAt: 1, status: 1 });

export default mongoose.model("PlatformPost", PlatformPostSchema);
