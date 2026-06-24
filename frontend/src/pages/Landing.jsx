import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import MotionSection from "../components/MotionSection";
import TiltCard from "../components/TiltCard";
import MagneticButton from "../components/MagneticButton";
import API from "../services/api";

const HeroScene = lazy(() => import("../components/HeroScene"));

const FAQS = [
  {
    q: "Can I connect my own social accounts?",
    a: "Yes. Every user connects their own Instagram, X, LinkedIn and other APIs inside onboarding."
  },
  {
    q: "Does it auto-publish content?",
    a: "Yes. Generated posts are queued and published via background workers with retry logic."
  },
  {
    q: "Can I start free?",
    a: "Yes. You can start with a demo and then move to paid plans when your volume increases."
  }
];

const FEATURES = [
  {
    eyebrow: "Cinematic workflow",
    title: "Designed like Apple. Built for creators.",
    description: "Smooth motion, glass surfaces and focused interactions that make daily posting feel effortless.",
    span: "md:col-span-2"
  },
  {
    eyebrow: "Automation",
    title: "One idea. Four platforms. Zero chaos.",
    description: "Generate once, auto-adapt tone and structure for Instagram, Facebook, X and LinkedIn instantly."
  },
  {
    eyebrow: "Autopilot",
    title: "Set it once. Forget it forever.",
    description: "Autopilot invents new topics and publishes on your cadence with zero manual input."
  },
  {
    eyebrow: "Learning loop",
    title: "Every post makes the next one smarter.",
    description: "Track performance, learn winning hooks and continuously improve with built-in ML feedback.",
    span: "md:col-span-2"
  }
];

export default function Landing({ onStartDemo }) {
  const [waitlist, setWaitlist] = useState({ name: "", email: "", niche: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

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
    <div className="min-h-screen mesh-gradient">
      <header className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">AI Growth</h1>
        <MagneticButton className="gradient-btn" onClick={onStartDemo}>Start Demo</MagneticButton>
      </header>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-24 grid lg:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 text-cyan uppercase tracking-[0.2em] text-xs mb-4 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5">
            ✨ 100% AI-generated content
          </span>
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            Build viral content.
            <br />
            Ship across platforms.
            <br />
            Grow on autopilot.
          </h2>
          <p className="text-muted text-lg mb-8">
            Stop writing posts yourself - let AI do it for you. It writes, schedules and publishes to Instagram, X,
            LinkedIn and Facebook on its own, every day, with zero manual work after setup.
          </p>
          <div className="flex flex-wrap gap-3">
            <MagneticButton className="gradient-btn" onClick={onStartDemo}>Start demo</MagneticButton>
            <MagneticButton
              as="a"
              href="#waitlist"
              className="px-5 py-2.5 rounded-xl border border-white/15 hover:border-accent transition inline-block"
            >
              Join waitlist
            </MagneticButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative h-[420px] md:h-[480px]"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <Suspense fallback={<div className="hero-glow w-full h-full" />}>
              <HeroScene />
            </Suspense>
          </div>

          <div className="glass-card p-6 md:p-8 absolute bottom-0 left-0 right-0 md:left-6 md:right-6">
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
          </div>
        </motion.div>
      </section>

      <MotionSection minHeight="min-h-fit py-10" className="max-w-6xl w-full">
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <TiltCard key={f.title} className={`glass-card p-6 md:p-8 ${f.span || ""}`}>
              <p className="text-cyan uppercase tracking-[0.2em] text-xs mb-3">{f.eyebrow}</p>
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">{f.title}</h3>
              <p className="text-muted">{f.description}</p>
            </TiltCard>
          ))}
        </div>
      </MotionSection>

      <section id="waitlist" className="max-w-3xl mx-auto px-4 md:px-8 pb-20">
        <TiltCard className="glass-card p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-4">Join the waitlist</h3>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <input className="input-dark" placeholder="Name" value={waitlist.name} onChange={(e) => setWaitlist({ ...waitlist, name: e.target.value })} />
            <input className="input-dark" placeholder="Email" value={waitlist.email} onChange={(e) => setWaitlist({ ...waitlist, email: e.target.value })} />
            <input className="input-dark" placeholder="Niche" value={waitlist.niche} onChange={(e) => setWaitlist({ ...waitlist, niche: e.target.value })} />
          </div>
          <MagneticButton className="gradient-btn" onClick={joinWaitlist} disabled={loading}>
            {loading ? "Joining..." : "Join waitlist"}
          </MagneticButton>
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
        </TiltCard>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-24">
        <div className="glass-card p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-4">FAQs</h3>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <div key={faq.q} className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 hover:bg-white/5"
                  onClick={() => setOpenFaq((current) => (current === idx ? -1 : idx))}
                >
                  {faq.q}
                </button>
                {openFaq === idx ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4 text-muted text-sm">
                    {faq.a}
                  </motion.div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
