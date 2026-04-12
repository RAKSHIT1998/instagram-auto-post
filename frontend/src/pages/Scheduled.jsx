import { useEffect, useState } from "react";
import API from "../services/api";
import PostCard from "../components/PostCard";

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scheduled Posts</h2>
        <button onClick={load} className="gradient-btn">Refresh</button>
      </div>

      {loading ? <p className="text-muted">Loading...</p> : null}

      <div className="grid lg:grid-cols-2 gap-4">
        {items.map((item) => (
          <PostCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}
