import { BarChart3, Bot, Calendar, Home, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "generate", label: "Generate", icon: Sparkles },
  { key: "autopilot", label: "Autopilot", icon: Bot },
  { key: "scheduled", label: "Scheduled", icon: Calendar },
  { key: "analytics", label: "Analytics", icon: BarChart3 }
];

export default function Sidebar({ page, onChange, isAdmin }) {
  const renderedItems = isAdmin
    ? items.concat([{ key: "admin", label: "Admin Console", icon: BarChart3 }])
    : items;

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="hidden md:flex w-72 min-h-screen border-r border-white/10 bg-card/70 backdrop-blur-md p-6 flex-col"
    >
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent mb-10">
        AI Growth
      </h1>

      <nav className="space-y-2">
        {renderedItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`relative w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                active ? "text-white" : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {active ? (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 border border-accent/50"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              ) : null}
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
