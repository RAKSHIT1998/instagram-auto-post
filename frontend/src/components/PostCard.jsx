import { motion } from "framer-motion";

export default function PostCard({ item }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="uppercase text-xs tracking-wider text-cyan">{item.platform}</p>
        <p className="text-xs text-muted">{item.status}</p>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.content || "No content"}</p>
    </motion.div>
  );
}
