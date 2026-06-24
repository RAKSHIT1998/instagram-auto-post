import AnalyticsCard from "../components/AnalyticsCard";
import TiltCard from "../components/TiltCard";
import { motion } from "framer-motion";

export default function Dashboard({ stats, onGoGenerate }) {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 hero-glow">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Grow your brand on autopilot</h1>
        <p className="text-muted mb-5">Generate platform-native content and publish with one click.</p>
        <button onClick={onGoGenerate} className="gradient-btn">Generate AI 🚀</button>
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
    </div>
  );
}
