import { Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ user, onRegisterDemo, loading, onLogout, onOpenOnboarding }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-20 backdrop-blur bg-bg/80 border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between"
    >
      <div>
        <p className="text-muted text-sm">AI Social SaaS</p>
        <h2 className="text-lg font-semibold">Premium Growth Engine</h2>
        <p className="text-[11px] text-muted/80 mt-0.5 hidden lg:block">Shortcuts: ⌘/Ctrl+K Commands • G Generate • D Dashboard • S Scheduled • A Analytics • I Integrations</p>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <motion.button whileHover={{ y: -1 }} onClick={onOpenOnboarding} className="px-4 py-2 text-sm rounded-xl border border-white/15 hover:border-accent transition">
              Integrations
            </motion.button>
            <div className="spotlight-card glass-card px-4 py-2 text-sm">
              {user.email} <span className="text-cyan">• {user.plan}</span>
            </div>
            <motion.button whileHover={{ y: -1 }} onClick={onLogout} className="px-4 py-2 text-sm rounded-xl border border-white/15 hover:border-red-400 transition">
              Logout
            </motion.button>
          </>
        ) : (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onRegisterDemo} disabled={loading} className="gradient-btn inline-flex items-center gap-2">
            <Rocket size={16} />
            {loading ? "Creating..." : "Start Demo"}
          </motion.button>
        )}
      </div>
    </motion.header>
  );
}
