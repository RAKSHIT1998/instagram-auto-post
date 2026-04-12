import { motion } from "framer-motion";

export default function AnalyticsCard({ title, value }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="glass-card p-5">
      <p className="text-muted text-sm">{title}</p>
      <h3 className="text-3xl font-bold font-mono mt-1">{value}</h3>
    </motion.div>
  );
}
