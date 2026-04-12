import { BarChart3, Calendar, Home, Sparkles } from "lucide-react";

const items = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "generate", label: "Generate", icon: Sparkles },
  { key: "scheduled", label: "Scheduled", icon: Calendar },
  { key: "analytics", label: "Analytics", icon: BarChart3 }
];

export default function Sidebar({ page, onChange, isAdmin }) {
  const renderedItems = isAdmin
    ? items.concat([{ key: "admin", label: "Admin Console", icon: BarChart3 }])
    : items;

  return (
    <aside className="hidden md:flex w-72 min-h-screen border-r border-white/10 bg-card/70 backdrop-blur-md p-6 flex-col">
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent mb-10">
        AI Growth
      </h1>

      <nav className="space-y-2">
        {renderedItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                active ? "bg-white/10 text-white border border-accent/50" : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
