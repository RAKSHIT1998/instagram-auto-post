import { useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import MagneticButton from "../components/MagneticButton";

export default function Generate({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    topic: "Consistency beats motivation",
    niche: "fitness",
    tone: "bold"
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/posts/create", form);
      setResult(data);
      onCreated?.(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to generate post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="spotlight-card glass-card p-6 hero-glow">
        <h2 className="text-xl font-semibold mb-1">Generate AI Post</h2>
        <p className="text-muted text-sm mb-4">Give it a topic, niche and tone - AI writes and formats it for every connected platform.</p>
        <div className="grid md:grid-cols-3 gap-3">
          <input className="input-dark" placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          <input className="input-dark" placeholder="Niche" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
          <input className="input-dark" placeholder="Tone" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
        </div>
        <MagneticButton onClick={generate} className="gradient-btn mt-4" disabled={loading}>
          {loading ? "Generating..." : "Generate 🚀"}
        </MagneticButton>
        {error ? <p className="text-red-400 mt-3 text-sm">{error}</p> : null}
      </motion.div>

      {loading ? (
        <div className="glass-card p-6 space-y-3">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton skeleton-line w-full" />
          <div className="skeleton skeleton-line w-11/12" />
          <div className="skeleton skeleton-line w-8/12" />
        </div>
      ) : null}

      {result && !loading ? (
        <motion.div initial={{ opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="spotlight-card glass-card p-6">
          <p className="text-sm text-cyan uppercase tracking-wide mb-2">✨ AI-generated preview</p>
          <p className="text-lg font-semibold mb-4">{result.post?.idea}</p>
          <pre className="text-xs overflow-auto text-muted">{JSON.stringify(result.generated, null, 2)}</pre>
        </motion.div>
      ) : null}
    </div>
  );
}
