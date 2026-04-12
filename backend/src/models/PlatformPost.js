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
    error: String
  },
  { timestamps: true }
);

PlatformPostSchema.index({ platform: 1, scheduledAt: 1, status: 1 });

export default mongoose.model("PlatformPost", PlatformPostSchema);
