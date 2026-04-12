import mongoose from "mongoose";

const WaitlistLeadSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: "landing" },
    niche: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("WaitlistLead", WaitlistLeadSchema);
