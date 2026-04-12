import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    postsUsedThisMonth: { type: Number, default: 0 },
    billingCycleStart: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
