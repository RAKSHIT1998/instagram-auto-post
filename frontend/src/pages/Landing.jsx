import { useState } from "react";
import { motion } from "framer-motion";
import MotionSection from "../components/MotionSection";
import API from "../services/api";

export default function Landing({ onStartDemo }) {
  const [waitlist, setWaitlist] = useState({ name: "", email: "", niche: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function joinWaitlist() {
    setLoading(true);
    setMessage("");
    try {
      await API.post("/waitlist/join", waitlist);
      setMessage("You are on the waitlist. We will contact you soon.");
      setWaitlist({ name: "", email: "", niche: "" });
    } catch {
      setMessage("Unable to join right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">AI Growth</h1>
        <button className="gradient-btn" onClick={onStartDemo}>Start Demo</button>
      </header>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-24 grid lg:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-cyan uppercase tracking-[0.2em] text-xs mb-4">Premium AI Social OS</p>
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            Build viral content.
            <br />
            Ship across platforms.
            <br />
            Grow on autopilot.
          </h2>
          <p className="text-muted text-lg mb-8">
            Generate, schedule and optimize Instagram, X, LinkedIn and Facebook posts with one premium control center.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="gradient-btn" onClick={onStartDemo}>Start demo</button>
            <a href="#waitlist" className="px-5 py-2.5 rounded-xl border border-white/15 hover:border-accent transition">Join waitlist</a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-card p-6 md:p-8 hero-glow"
        >
          <p className="text-muted text-sm mb-3">Live preview</p>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">Instagram caption + hashtags generated</div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">X post optimized under 280 chars</div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">LinkedIn insight post with CTA</div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Hook Optimizer", "Trend Radar", "Auto Schedule"].map((badge, idx) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: [0, -2, 0] }}
                transition={{ duration: 2.8, delay: idx * 0.18, repeat: Infinity }}
                className="px-3 py-1 rounded-full text-xs border border-white/20 bg-white/5"
              >
                {badge}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      <MotionSection
        eyebrow="Cinematic workflow"
        title="Designed like Apple. Built for creators."
        description="Smooth motion, glass surfaces and focused interactions that make daily posting feel effortless."
      />
      <MotionSection
        eyebrow="Automation"
        title="One idea. Four platforms. Zero chaos."
        description="Generate once, auto-adapt tone and structure for Instagram, Facebook, X and LinkedIn instantly."
      />
      <MotionSection
        eyebrow="Learning loop"
        title="Every post makes the next one smarter."
        description="Track performance, learn winning hooks and continuously improve with built-in ML feedback."
      />

      <section id="waitlist" className="max-w-3xl mx-auto px-4 md:px-8 pb-20">
        <div className="glass-card p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-4">Join the waitlist</h3>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <input className="input-dark" placeholder="Name" value={waitlist.name} onChange={(e) => setWaitlist({ ...waitlist, name: e.target.value })} />
            <input className="input-dark" placeholder="Email" value={waitlist.email} onChange={(e) => setWaitlist({ ...waitlist, email: e.target.value })} />
            <input className="input-dark" placeholder="Niche" value={waitlist.niche} onChange={(e) => setWaitlist({ ...waitlist, niche: e.target.value })} />
          </div>
          <button className="gradient-btn" onClick={joinWaitlist} disabled={loading}>{loading ? "Joining..." : "Join waitlist"}</button>
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
        </div>
      </section>
    </div>
  );
}
