import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import QuickDock from "./components/QuickDock";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
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

  async function loadMeAndStatus() {
    try {
      const me = await API.get("/auth/me");
      setUser(me.data);

      const status = await API.get("/integrations/status");
      setIntegrationStatus(status.data);
      setView(status.data?.allConnected ? "app" : "onboarding");
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
  }, []);

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

  if (view === "landing") {
    return (
      <>
        <div className="cursor-glow" />
        <div className="noise-overlay" />
        <Landing onStartDemo={registerDemo} />
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
    </div>
  );
}
