import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import API from "../services/api";

const STEPS = [
  { key: "instagram", label: "Connect Instagram" },
  { key: "twitter", label: "Connect X (Twitter)" },
  { key: "linkedin", label: "Connect LinkedIn" }
];

export default function Onboarding({ status, onRefresh, onDone }) {
  const [form, setForm] = useState({ accountLabel: "", accessToken: "", platformId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");
    if (oauthError) setError(oauthError);
    if (oauthError || params.get("onboarding")) {
      window.history.replaceState({}, "", window.location.pathname);
      onRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connectTwitterOAuth() {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/oauth/twitter/start");
      window.location.href = data.authorizeUrl;
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to start X connection");
      setLoading(false);
    }
  }

  const nextPlatform = useMemo(() => STEPS.find((s) => !status?.connected?.[s.key])?.key || null, [status]);

  const platformIdLabel = useMemo(() => {
    if (nextPlatform === "instagram") return "Instagram User ID";
    if (nextPlatform === "linkedin") return "LinkedIn Author URN";
    if (nextPlatform === "facebook") return "Facebook Page ID";
    return "";
  }, [nextPlatform]);

  async function connect(platform) {
    setLoading(true);
    setError("");
    try {
      await API.post("/integrations/connect", {
        platform,
        accountLabel: form.accountLabel || `${platform}-account`,
        accessToken: form.accessToken,
        metadata:
          platform === "instagram"
            ? { igUserId: form.platformId }
            : platform === "linkedin"
              ? { authorUrn: form.platformId }
              : platform === "facebook"
                ? { pageId: form.platformId }
                : {}
      });
      setForm({ accountLabel: "", accessToken: "", platformId: "" });
      await onRefresh();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to connect platform");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 hero-glow">
        <p className="text-cyan uppercase tracking-[0.2em] text-xs mb-2">Onboarding Wizard</p>
        <h2 className="text-2xl font-bold">Connect your channels</h2>
        <p className="text-muted mt-2">Complete Instagram, X and LinkedIn to unlock automated multi-platform publishing.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card p-6">
        <div className="space-y-3 mb-6">
          {STEPS.map((s, i) => {
            const done = Boolean(status?.connected?.[s.key]);
            return (
              <motion.div key={s.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                {done ? <CheckCircle2 className="text-success" size={18} /> : <Circle className="text-muted" size={18} />}
                <span className={done ? "text-white" : "text-muted"}>{i + 1}. {s.label}</span>
              </motion.div>
            );
          })}
        </div>

        {nextPlatform === "twitter" ? (
          <div className="space-y-3">
            <p className="text-sm text-cyan uppercase tracking-wider">Next step: twitter</p>
            <p className="text-muted text-sm">Connect your X account securely. No tokens to copy or paste.</p>
            <button className="gradient-btn" onClick={connectTwitterOAuth} disabled={loading}>
              {loading ? "Redirecting..." : "Connect with X"}
            </button>
            {error ? <p className="text-red-400 text-sm">{error}</p> : null}
          </div>
        ) : nextPlatform ? (
          <div className="space-y-3">
            <p className="text-sm text-cyan uppercase tracking-wider">Next step: {nextPlatform}</p>
            <input
              className="input-dark"
              placeholder="Account label (e.g. brand_handle)"
              value={form.accountLabel}
              onChange={(e) => setForm({ ...form, accountLabel: e.target.value })}
            />
            <input
              className="input-dark"
              placeholder="Access token"
              value={form.accessToken}
              onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
            />
            {platformIdLabel ? (
              <input
                className="input-dark"
                placeholder={platformIdLabel}
                value={form.platformId}
                onChange={(e) => setForm({ ...form, platformId: e.target.value })}
              />
            ) : null}
            <button className="gradient-btn" onClick={() => connect(nextPlatform)} disabled={loading}>
              {loading ? "Connecting..." : `Connect ${nextPlatform}`}
            </button>
            {error ? <p className="text-red-400 text-sm">{error}</p> : null}
          </div>
        ) : (
          <div>
            <p className="text-success mb-4">All platforms connected. You are ready to publish.</p>
            <button className="gradient-btn" onClick={onDone}>Go to dashboard</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
