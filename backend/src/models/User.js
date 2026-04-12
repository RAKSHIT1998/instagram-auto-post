import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    plan: { type: String, enum: ["free", "pro", "agency"], default: "free" },
    subscription: {
      status: {
        type: String,
        enum: ["inactive", "active", "cancelled"],
        default: "inactive"
      },
      amount: { type: Number, default: 0 },
      startedAt: { type: Date }
    },
    postsUsedThisMonth: { type: Number, default: 0 },
    billingCycleStart: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
