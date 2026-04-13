import { motion } from "framer-motion";

export default function PostCard({ item }) {
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
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.content || "No content"}</p>
    </motion.div>
  );
}
