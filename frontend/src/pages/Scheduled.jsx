import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import PostCard from "../components/PostCard";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function Scheduled({ refreshKey, onItemsLoaded }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await API.get("/posts/mine");
      const rows = Array.isArray(data) ? data : [];
      setItems(rows);
      onItemsLoaded?.(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scheduled Posts</h2>
        <button onClick={load} className="gradient-btn">Refresh</button>
      </motion.div>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="glass-card p-5 space-y-3">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton skeleton-line w-full" />
              <div className="skeleton skeleton-line w-10/12" />
              <div className="skeleton skeleton-line w-8/12" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading ? (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-4"
        >
          {items.map((item) => (
            <motion.div key={item._id} variants={itemVariants}>
              <PostCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}
