import mongoose from "mongoose";

const AutopilotConfigSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    enabled: { type: Boolean, default: false },
    niche: { type: String, required: true },
    tone: { type: String, default: "bold" },
    audience: { type: String },
    goal: { type: String },
    cadence: {
      type: String,
      enum: ["daily", "every_2_days", "every_3_days", "weekly"],
      default: "daily"
    },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date, index: true },
    recentTopics: [{ type: String }],
    lastError: { type: String },
    lastErrorAt: { type: Date },
    consecutiveFailures: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("AutopilotConfig", AutopilotConfigSchema);
