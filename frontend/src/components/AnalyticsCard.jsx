import { motion } from "framer-motion";

export default function AnalyticsCard({ title, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card p-5"
    >
      <p className="text-muted text-sm">{title}</p>
      <h3 className="text-3xl font-bold font-mono mt-1">{value}</h3>
    </motion.div>
  );
}
