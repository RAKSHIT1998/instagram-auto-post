import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import MagneticButton from "../components/MagneticButton";

const CADENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "every_2_days", label: "Every 2 days" },
  { value: "every_3_days", label: "Every 3 days" },
  { value: "weekly", label: "Weekly" }
];

export default function Autopilot({ hasConnectedPlatform }) {
  const [config, setConfig] = useState({ enabled: false, niche: "", tone: "bold", audience: "", goal: "", cadence: "daily" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/autopilot");
        if (data) setConfig((prev) => ({ ...prev, ...data }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(nextEnabled) {
    setSaving(true);
    setError("");
    try {
      const payload = { ...config, enabled: nextEnabled ?? config.enabled };
      const { data } = await API.put("/autopilot", payload);
      setConfig((prev) => ({ ...prev, ...data }));
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to save autopilot settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-6 space-y-3">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton skeleton-line w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="spotlight-card glass-card p-6 hero-glow">
        <h2 className="text-xl font-semibold mb-2">Autopilot</h2>
        <p className="text-muted text-sm mb-4">
          Set your niche, tone and posting cadence once. The system invents new topics and publishes them automatically from here on - no further input needed.
        </p>

        {!hasConnectedPlatform ? (
          <p className="text-red-400 text-sm mb-4">Connect at least one platform before enabling autopilot.</p>
        ) : null}

        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="input-dark"
            placeholder="Niche (e.g. fitness)"
            value={config.niche}
            onChange={(e) => setConfig({ ...config, niche: e.target.value })}
          />
          <input
            className="input-dark"
            placeholder="Tone (e.g. bold)"
            value={config.tone}
            onChange={(e) => setConfig({ ...config, tone: e.target.value })}
          />
          <input
            className="input-dark"
            placeholder="Audience (optional)"
            value={config.audience || ""}
            onChange={(e) => setConfig({ ...config, audience: e.target.value })}
          />
          <input
            className="input-dark"
            placeholder="Goal (optional)"
            value={config.goal || ""}
            onChange={(e) => setConfig({ ...config, goal: e.target.value })}
          />
          <select
            className="input-dark"
            value={config.cadence}
            onChange={(e) => setConfig({ ...config, cadence: e.target.value })}
          >
            {CADENCE_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <MagneticButton
            className="gradient-btn"
            disabled={saving || (!hasConnectedPlatform && !config.enabled) || !config.niche}
            onClick={() => save(!config.enabled)}
          >
            {saving ? "Saving..." : config.enabled ? "Disable autopilot" : "Enable autopilot"}
          </MagneticButton>
          <MagneticButton className="gradient-btn" disabled={saving || !config.enabled} onClick={() => save()}>
            Save settings
          </MagneticButton>
        </div>

        {error ? <p className="text-red-400 mt-3 text-sm">{error}</p> : null}
      </motion.div>

      {config.enabled ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="spotlight-card glass-card p-6 space-y-2 text-sm">
          <p className="text-cyan uppercase tracking-wide text-xs">Status</p>
          <p>Last run: {config.lastRunAt ? new Date(config.lastRunAt).toLocaleString() : "Not yet run"}</p>
          <p>Next run: {config.nextRunAt ? new Date(config.nextRunAt).toLocaleString() : "Pending"}</p>
          {config.lastError ? <p className="text-red-400">Last error: {config.lastError}</p> : null}
          {config.recentTopics?.length ? (
            <div>
              <p className="text-muted mt-2">Recent topics:</p>
              <ul className="list-disc list-inside text-muted">
                {config.recentTopics.slice(-5).reverse().map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}
