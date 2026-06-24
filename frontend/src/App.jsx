import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import QuickDock from "./components/QuickDock";
import CommandPalette from "./components/CommandPalette";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Autopilot from "./pages/Autopilot";
import Scheduled from "./pages/Scheduled";
import Analytics from "./pages/Analytics";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import API from "./services/api";

const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));

export default function App() {
  const isAdminPath = window.location.pathname.startsWith("/admin");
  const [page, setPage] = useState("dashboard");
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [items, setItems] = useState([]);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  async function loadMeAndStatus() {
    try {
      const me = await API.get("/auth/me");
      setUser(me.data);

      const status = await API.get("/integrations/status");
      setIntegrationStatus(status.data);
      setView((current) => (current === "onboarding" ? "onboarding" : "app"));
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      setIntegrationStatus(null);
      setView("landing");
    }
  }

  async function loadPosts() {
    if (!localStorage.getItem("token")) return;
    try {
      const { data } = await API.get("/posts/mine");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadMeAndStatus();
      loadPosts();
    }
  }, []);

  useEffect(() => {
    let raf = 0;

    function onPointerMove(event) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
      });
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  useEffect(() => {
    function shouldIgnore(event) {
      const tag = event.target?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable;
    }

    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }

      if (event.key === "Escape") {
        setPaletteOpen(false);
      }

      if (paletteOpen) return;
      if (shouldIgnore(event)) return;

      const key = event.key.toLowerCase();
      if (key === "g") setPage("generate");
      if (key === "d") setPage("dashboard");
      if (key === "s") setPage("scheduled");
      if (key === "a") setPage("analytics");
      if (key === "i") setView("onboarding");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen]);

  async function registerDemo() {
    setRegisterLoading(true);
    try {
      const email = `user${Date.now()}@demo.com`;
      const { data } = await API.post("/auth/register", {
        name: "Demo User",
        email,
        password: "password123"
      });

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      await loadMeAndStatus();
      setPage("generate");
    } finally {
      setRegisterLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setIntegrationStatus(null);
    setItems([]);
    setView("landing");
  }

  const stats = useMemo(() => {
    return {
      totalPosts: items.length,
      posted: items.filter((i) => i.status === "posted").length,
      pending: items.filter((i) => i.status === "pending" || i.status === "queued").length,
      failed: items.filter((i) => i.status === "failed").length
    };
  }, [items]);

  function onCreated(payload) {
    if (Array.isArray(payload?.platformPosts)) {
      setItems(payload.platformPosts.concat(items));
    }
    setRefreshKey((k) => k + 1);
    setPage("scheduled");
  }

  const paletteActions = useMemo(() => {
    const actions = [];

    if (view === "landing") {
      actions.push({
        id: "start-demo",
        label: "Start Demo Account",
        hint: "Enter",
        keywords: ["register", "trial", "signup"],
        run: () => registerDemo()
      });
    }

    if (view === "onboarding") {
      actions.push({
        id: "back-app",
        label: "Back to Dashboard",
        keywords: ["home", "dashboard"],
        run: () => {
          setView("app");
          setPage("dashboard");
        }
      });
    }

    if (view === "app") {
      actions.push(
        {
          id: "go-dashboard",
          label: "Go to Dashboard",
          hint: "D",
          keywords: ["home", "overview"],
          run: () => setPage("dashboard")
        },
        {
          id: "go-generate",
          label: "Open Generate",
          hint: "G",
          keywords: ["create", "ai", "compose"],
          run: () => setPage("generate")
        },
        {
          id: "go-autopilot",
          label: "Open Autopilot",
          keywords: ["automatic", "autonomous", "schedule"],
          run: () => setPage("autopilot")
        },
        {
          id: "go-scheduled",
          label: "Open Scheduled",
          hint: "S",
          keywords: ["queue", "calendar"],
          run: () => setPage("scheduled")
        },
        {
          id: "go-analytics",
          label: "Open Analytics",
          hint: "A",
          keywords: ["metrics", "charts"],
          run: () => setPage("analytics")
        },
        {
          id: "go-integrations",
          label: "Open Integrations",
          hint: "I",
          keywords: ["connect", "oauth", "tokens"],
          run: () => setView("onboarding")
        },
        {
          id: "refresh-posts",
          label: "Refresh My Posts",
          keywords: ["reload", "sync"],
          run: () => loadPosts()
        }
      );

      if (user?.role === "admin") {
        actions.push({
          id: "go-admin",
          label: "Open Admin Console",
          keywords: ["admin", "reports"],
          run: () => setPage("admin")
        });
      }

      actions.push({
        id: "logout",
        label: "Logout",
        keywords: ["sign out", "exit"],
        run: () => logout()
      });
    }

    return actions;
  }, [view, user?.role]);

  if (view === "landing") {
    return (
      <>
        <div className="cursor-glow" />
        <div className="noise-overlay" />
        <Landing onStartDemo={registerDemo} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />
      </>
    );
  }

  if (view === "onboarding") {
    return (
      <>
        <div className="cursor-glow" />
        <div className="noise-overlay" />
        <Onboarding
          status={integrationStatus}
          onRefresh={loadMeAndStatus}
          onDone={() => {
            setView("app");
            setPage("dashboard");
          }}
        />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <div className="cursor-glow" />
      <div className="noise-overlay" />
      <Sidebar page={page} onChange={setPage} isAdmin={Boolean(user?.role === "admin")} />

      <main className="flex-1">
        <Navbar
          user={user}
          onRegisterDemo={registerDemo}
          loading={registerLoading}
          onLogout={logout}
          onOpenOnboarding={() => setView("onboarding")}
        />

        <section className="p-4 md:p-8 max-w-6xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isAdminPath ? "admin-path" : page}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {isAdminPath || page === "admin" ? (
                <Suspense fallback={<div className="glass-card p-6 text-muted">Loading admin console...</div>}>
                  <AdminDashboard />
                </Suspense>
              ) : null}
              {!isAdminPath && page === "dashboard" ? <Dashboard stats={stats} onGoGenerate={() => setPage("generate")} /> : null}
              {!isAdminPath && page === "generate" ? <Generate onCreated={onCreated} /> : null}
              {!isAdminPath && page === "autopilot" ? (
                <Autopilot hasConnectedPlatform={Object.values(integrationStatus?.connected || {}).some(Boolean)} />
              ) : null}
              {!isAdminPath && page === "scheduled" ? <Scheduled refreshKey={refreshKey} onItemsLoaded={setItems} /> : null}
              {!isAdminPath && page === "analytics" ? <Analytics items={items} /> : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {!isAdminPath ? (
        <QuickDock
          page={page}
          onChange={setPage}
          onOpenOnboarding={() => setView("onboarding")}
        />
      ) : null}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />
    </div>
  );
}
