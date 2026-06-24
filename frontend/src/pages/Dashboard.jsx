import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import AnalyticsCard from "../components/AnalyticsCard";
import TiltCard from "../components/TiltCard";
import PostCard from "../components/PostCard";
import MagneticButton from "../components/MagneticButton";
import API from "../services/api";

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" }
];

export default function Dashboard({ stats, items, integrationStatus, onGoGenerate, onOpenIntegrations, onOpenAutopilot, onRetry }) {
  const [autopilot, setAutopilot] = useState(null);

  useEffect(() => {
    API.get("/autopilot")
      .then(({ data }) => setAutopilot(data))
      .catch(() => setAutopilot(null));
  }, []);

  const recent = [...(items || [])]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  const connectedMap = integrationStatus?.connected || {};
  const connectedCount = PLATFORMS.filter((p) => connectedMap[p.key]).length;

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 hero-glow">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Grow your brand on autopilot</h1>
        <p className="text-muted mb-5">
          It's all AI-generated - tell it your niche and tone once, and let AI write, schedule and publish for you.
        </p>
        <button onClick={onGoGenerate} className="gradient-btn">Generate with AI ✨</button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <TiltCard className="rounded-2xl">
          <AnalyticsCard title="Total Posts" value={stats.totalPosts} accentClassName="border-t-accent" />
        </TiltCard>
        <TiltCard className="rounded-2xl">
          <AnalyticsCard title="Posted" value={stats.posted} accentClassName="border-t-success" />
        </TiltCard>
        <TiltCard className="rounded-2xl">
          <AnalyticsCard title="Pending" value={stats.pending} accentClassName="border-t-cyan" />
        </TiltCard>
        <TiltCard className="rounded-2xl">
          <AnalyticsCard title="Failed" value={stats.failed} accentClassName="border-t-red-400" />
        </TiltCard>
      </motion.section>

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
          </div>
          {recent.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {recent.map((item) => (
                <PostCard key={item._id} item={item} onRetry={onRetry} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-muted">
              Nothing generated yet. Click "Generate with AI" above to create your first post.
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">
          <div className="spotlight-card glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted">Connected platforms</p>
              <span className="text-xs text-cyan">{connectedCount}/{PLATFORMS.length}</span>
            </div>
            <div className="space-y-2 mb-4">
              {PLATFORMS.map((p) => {
                const connected = Boolean(connectedMap[p.key]);
                return (
                  <div key={p.key} className="flex items-center gap-2 text-sm">
                    {connected ? <CheckCircle2 className="text-success" size={16} /> : <Circle className="text-muted" size={16} />}
                    <span className={connected ? "text-white" : "text-muted"}>{p.label}</span>
                  </div>
                );
              })}
            </div>
            {connectedCount < PLATFORMS.length ? (
              <MagneticButton className="gradient-btn w-full text-center" onClick={onOpenIntegrations}>
                Connect a platform
              </MagneticButton>
            ) : null}
          </div>

          <div className="spotlight-card glass-card p-5">
            <p className="text-sm text-muted mb-2">Autopilot</p>
            {autopilot?.enabled ? (
              <>
                <p className="text-success text-sm mb-1">Active - {autopilot.niche}, {autopilot.cadence}</p>
                <p className="text-xs text-muted">
                  Next run: {autopilot.nextRunAt ? new Date(autopilot.nextRunAt).toLocaleString() : "Pending"}
                </p>
              </>
            ) : (
              <p className="text-muted text-sm mb-3">Not enabled - let AI invent topics and post automatically forever.</p>
            )}
            <button onClick={onOpenAutopilot} className="text-cyan text-sm hover:underline mt-3">
              {autopilot?.enabled ? "Manage autopilot" : "Set up autopilot"} →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
