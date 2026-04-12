import { Rocket } from "lucide-react";

export default function Navbar({ user, onRegisterDemo, loading, onLogout, onOpenOnboarding }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-bg/80 border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
      <div>
        <p className="text-muted text-sm">AI Social SaaS</p>
        <h2 className="text-lg font-semibold">Premium Growth Engine</h2>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button onClick={onOpenOnboarding} className="px-4 py-2 text-sm rounded-xl border border-white/15 hover:border-accent transition">
              Integrations
            </button>
            <div className="glass-card px-4 py-2 text-sm">
              {user.email} <span className="text-cyan">• {user.plan}</span>
            </div>
            <button onClick={onLogout} className="px-4 py-2 text-sm rounded-xl border border-white/15 hover:border-red-400 transition">
              Logout
            </button>
          </>
        ) : (
          <button onClick={onRegisterDemo} disabled={loading} className="gradient-btn inline-flex items-center gap-2">
            <Rocket size={16} />
            {loading ? "Creating..." : "Start Demo"}
          </button>
        )}
      </div>
    </header>
  );
}
