import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command } from "lucide-react";

export default function CommandPalette({ open, onClose, actions }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;

    return actions.filter((action) => {
      const hay = `${action.label} ${(action.keywords || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [actions, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!filtered.length) return;
        setActiveIndex((idx) => (idx + 1) % filtered.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!filtered.length) return;
        setActiveIndex((idx) => (idx - 1 + filtered.length) % filtered.length);
        return;
      }

      if (event.key === "Enter") {
        if (!filtered.length) return;
        event.preventDefault();
        filtered[activeIndex]?.run?.();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, activeIndex, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-2xl spotlight-card glass-card p-3"
          >
            <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/10">
              <Command size={16} className="text-cyan" />
              <input
                ref={inputRef}
                className="bg-transparent outline-none w-full py-2 text-sm"
                placeholder="Type a command..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="text-[11px] text-muted border border-white/15 rounded-md px-1.5 py-0.5">Esc</span>
            </div>

            <div className="max-h-[55vh] overflow-auto pt-2">
              {filtered.length ? (
                filtered.map((action, idx) => (
                  <button
                    key={action.id || action.label}
                    onClick={() => {
                      action.run?.();
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between ${
                      idx === activeIndex ? "bg-white/12 text-white" : "text-muted hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span>{action.label}</span>
                    {action.hint ? <span className="text-xs text-muted">{action.hint}</span> : null}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-muted">No commands found.</div>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
