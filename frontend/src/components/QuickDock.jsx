import { motion } from "framer-motion";
import { Compass, Sparkles, Calendar, BarChart3, PlugZap } from "lucide-react";

const ACTIONS = [
  { key: "dashboard", label: "Dashboard", icon: Compass },
  { key: "generate", label: "Generate", icon: Sparkles },
  { key: "scheduled", label: "Scheduled", icon: Calendar },
  { key: "analytics", label: "Analytics", icon: BarChart3 }
];

export default function QuickDock({ page, onChange, onOpenOnboarding }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed right-4 bottom-4 z-30 spotlight-card glass-card px-3 py-2 flex items-center gap-1"
    >
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        const active = page === action.key;
        return (
          <motion.button
            key={action.key}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(action.key)}
            className={`relative px-3 py-2 rounded-xl text-xs md:text-sm inline-flex items-center gap-2 ${
              active ? "text-white" : "text-muted hover:text-white hover:bg-white/10"
            }`}
            title={`${action.label} (${action.key[0].toUpperCase()})`}
          >
            {active ? (
              <motion.div
                layoutId="quickdock-active-pill"
                className="absolute inset-0 rounded-xl bg-white/15"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            ) : null}
            <Icon size={14} className="relative z-10" />
            <span className="hidden md:inline relative z-10">{action.label}</span>
          </motion.button>
        );
      })}

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onOpenOnboarding}
        className="px-3 py-2 rounded-xl text-xs md:text-sm inline-flex items-center gap-2 text-cyan hover:bg-white/10"
        title="Integrations (I)"
      >
        <PlugZap size={14} />
        <span className="hidden md:inline">Connect</span>
      </motion.button>
    </motion.div>
  );
}
