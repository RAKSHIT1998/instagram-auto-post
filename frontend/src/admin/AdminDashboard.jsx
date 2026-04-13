import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";
import API from "../services/api";
import AnalyticsCard from "../components/AnalyticsCard";

const PIE_COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#EAB308"];

export default function AdminDashboard() {
  const [mrr, setMrr] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [overview, setOverview] = useState({ totalUsers: 0, postsToday: 0, totalPosts: 0 });
  const [analytics, setAnalytics] = useState({ totalLikes: 0, totalComments: 0, totalShares: 0 });
  const [extra, setExtra] = useState({ postsPerDay: [], platformEngagement: {}, topPerformingPosts: [] });

  useEffect(() => {
    Promise.all([
      API.get("/admin/mrr"),
      API.get("/admin/overview"),
      API.get("/admin/analytics"),
      API.get("/admin/analytics/overview")
    ])
      .then(([mrrRes, ovRes, analyticsRes, extraRes]) => {
        setMrr(mrrRes.data?.mrr || 0);
        setActiveUsers(mrrRes.data?.activeUsers || 0);
        setOverview(ovRes.data || {});
        setAnalytics(analyticsRes.data || {});
        setExtra(extraRes.data || {});
      })
      .catch(() => {
        setMrr(0);
        setActiveUsers(0);
      });
  }, []);

  const pieData = Object.entries(extra.platformEngagement || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold">Admin Console</motion.h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="MRR" value={`₹${mrr}`} />
        <AnalyticsCard title="Active Users" value={activeUsers} />
        <AnalyticsCard title="Total Users" value={overview.totalUsers || 0} />
        <AnalyticsCard title="Posts Today" value={overview.postsToday || 0} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <AnalyticsCard title="Likes" value={analytics.totalLikes || 0} />
        <AnalyticsCard title="Comments" value={analytics.totalComments || 0} />
        <AnalyticsCard title="Shares" value={analytics.totalShares || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 h-80 hero-glow">
          <p className="text-muted text-sm mb-4">Posts per day (last 14 days)</p>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={extra.postsPerDay || []}>
              <defs>
                <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#7C3AED" fillOpacity={1} fill="url(#colorPosts)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="glass-card p-5 h-80">
          <p className="text-muted text-sm mb-4">Platform engagement</p>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie dataKey="value" data={pieData} outerRadius={95} label>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="glass-card p-5">
        <p className="text-muted text-sm mb-3">Top performing posts</p>
        <div className="space-y-3">
          {(extra.topPerformingPosts || []).map((post, idx) => (
            <div key={`${post.postId}-${idx}`} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-1">
                <span className="text-cyan uppercase text-xs tracking-wider">{post.platform}</span>
                <span className="font-mono">Score: {post.score}</span>
              </div>
              <p className="text-sm text-muted line-clamp-2">{post.content}</p>
            </div>
          ))}
          {!(extra.topPerformingPosts || []).length ? <p className="text-muted text-sm">No data yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
