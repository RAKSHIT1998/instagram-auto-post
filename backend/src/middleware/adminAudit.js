import AdminAudit from "../models/AdminAudit.js";

export function adminAudit(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", async () => {
    try {
      if (!req.user?.sub || req.user.role !== "admin") return;

      await AdminAudit.create({
        adminUserId: req.user.sub,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        durationMs: Date.now() - startedAt,
        requestId: req.get("x-request-id")
      });
    } catch (error) {
      console.error("Failed to write admin audit log", error?.message || error);
    }
  });

  next();
}
