import mongoose from "mongoose";

const AdminAuditSchema = new mongoose.Schema(
  {
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    method: { type: String, required: true },
    path: { type: String, required: true, index: true },
    statusCode: { type: Number, required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
    durationMs: { type: Number, required: true },
    requestId: { type: String }
  },
  { timestamps: true }
);

AdminAuditSchema.index({ createdAt: -1, adminUserId: 1 });

export default mongoose.model("AdminAudit", AdminAuditSchema);
