import AnalyticsCard from "../components/AnalyticsCard";

export default function Dashboard({ stats, onGoGenerate }) {
  return (
    <div className="space-y-6">
      <section className="glass-card p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Grow your brand on autopilot</h1>
        <p className="text-muted mb-5">Generate platform-native content and publish with one click.</p>
        <button onClick={onGoGenerate} className="gradient-btn">Generate AI 🚀</button>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Posts" value={stats.totalPosts} />
        <AnalyticsCard title="Posted" value={stats.posted} />
        <AnalyticsCard title="Pending" value={stats.pending} />
        <AnalyticsCard title="Failed" value={stats.failed} />
      </section>
    </div>
  );
}
