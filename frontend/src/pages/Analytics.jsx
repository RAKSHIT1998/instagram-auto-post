import AnalyticsCard from "../components/AnalyticsCard";

function countBy(items, fn) {
  return items.reduce((acc, it) => {
    const k = fn(it);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export default function Analytics({ items }) {
  const statusMap = countBy(items, (it) => it.status || "unknown");
  const platformMap = countBy(items, (it) => it.platform || "other");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Posted" value={statusMap.posted || 0} />
        <AnalyticsCard title="Pending" value={statusMap.pending || 0} />
        <AnalyticsCard title="Queued" value={statusMap.queued || 0} />
        <AnalyticsCard title="Failed" value={statusMap.failed || 0} />
      </div>

      <div className="glass-card p-5">
        <p className="text-muted mb-2">Platform Distribution</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {Object.entries(platformMap).map(([k, v]) => (
            <div key={k} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-muted capitalize">{k}</p>
              <p className="font-mono text-lg">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
