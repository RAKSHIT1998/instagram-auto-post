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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("new");

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

  const filtered = items
    .filter((item) => {
      if (statusFilter === "all") return true;
      return item.status === statusFilter;
    })
    .filter((item) => {
      if (!query.trim()) return true;
      const haystack = `${item.platform || ""} ${item.content || ""}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "new") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "old") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return (a.platform || "").localeCompare(b.platform || "");
    });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scheduled Posts</h2>
        <button onClick={load} className="gradient-btn">Refresh</button>
      </motion.div>

      <div className="glass-card p-4 grid md:grid-cols-3 gap-3">
        <input
          className="input-dark"
          placeholder="Search by platform or content"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input-dark" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="posted">Posted</option>
          <option value="pending">Pending</option>
          <option value="queued">Queued</option>
          <option value="failed">Failed</option>
        </select>
        <select className="input-dark" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="new">Newest first</option>
          <option value="old">Oldest first</option>
          <option value="platform">Platform A-Z</option>
        </select>
      </div>

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
          {filtered.map((item) => (
            <motion.div key={item._id} variants={itemVariants}>
              <PostCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : null}

      {!loading && !filtered.length ? (
        <div className="glass-card p-6 text-center text-muted">No posts match your filters yet.</div>
      ) : null}
    </div>
  );
}
