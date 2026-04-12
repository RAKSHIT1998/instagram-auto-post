import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    idea: { type: String, required: true },
    niche: { type: String, required: true, index: true },
    tone: { type: String, default: "motivational" }
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
