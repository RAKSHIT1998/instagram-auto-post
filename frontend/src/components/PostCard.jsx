import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

export default function PostCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.012, y: -2 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="uppercase text-xs tracking-wider text-cyan">{item.platform}</p>
        <p className="text-xs text-muted">{item.status}</p>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{shownText}</p>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={copyContent} className="px-3 py-1.5 rounded-lg border border-white/15 text-xs hover:border-cyan inline-flex items-center gap-1.5">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </button>
        {longText ? (
          <button onClick={() => setExpanded((v) => !v)} className="px-3 py-1.5 rounded-lg border border-white/15 text-xs hover:border-accent">
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
