import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, Copy, RotateCw } from "lucide-react";

const STATUS_STYLES = {
  posted: "text-success border-success/40 bg-success/10",
  queued: "text-cyan border-cyan/40 bg-cyan/10",
  pending: "text-cyan border-cyan/40 bg-cyan/10",
  failed: "text-red-400 border-red-400/40 bg-red-400/10"
};

export default function PostCard({ item, onRetry }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const longText = (item.content || "").length > 240;
  const shownText = useMemo(() => {
    if (expanded || !longText) return item.content || "No content";
    return `${(item.content || "").slice(0, 240)}...`;
  }, [expanded, longText, item.content]);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(item.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    try {
      await onRetry?.(item._id);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.012, y: -2 }}
      transition={{ duration: 0.2 }}
      className="spotlight-card glass-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="uppercase text-xs tracking-wider text-cyan">{item.platform}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[item.status] || "text-muted border-white/15"}`}>
          {item.status}
        </span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{shownText}</p>
      {item.status === "failed" && item.error ? (
        <p className="text-red-400/80 text-xs mt-2">{item.error}</p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <button onClick={copyContent} className="px-3 py-1.5 rounded-lg border border-white/15 text-xs hover:border-cyan inline-flex items-center gap-1.5">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </button>
        {longText ? (
          <button onClick={() => setExpanded((v) => !v)} className="px-3 py-1.5 rounded-lg border border-white/15 text-xs hover:border-accent">
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
        {item.status === "failed" && onRetry ? (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-3 py-1.5 rounded-lg border border-white/15 text-xs hover:border-cyan inline-flex items-center gap-1.5"
          >
            <RotateCw size={14} className={retrying ? "animate-spin" : ""} /> {retrying ? "Retrying..." : "Retry"}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
