import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function App() {
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ topic: "fitness discipline", niche: "fitness", tone: "bold" });
  const [result, setResult] = useState(null);
  const [posts, setPosts] = useState([]);

  async function registerDemo() {
    const email = `user${Date.now()}@demo.com`;
    const r = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Demo User", email, password: "password123" })
    });
    const data = await r.json();
    setToken(data.token || "");
  }

  async function createPost() {
    const r = await fetch(`${API}/api/posts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    const data = await r.json();
    setResult(data);
  }

  async function loadPosts() {
    const r = await fetch(`${API}/api/posts/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    setPosts(Array.isArray(data) ? data : []);
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>AI Social SaaS</h1>
      <button onClick={registerDemo}>Register Demo User</button>
      <p><b>Token:</b> {token ? "ready" : "missing"}</p>

      <h2>Dashboard</h2>
      <input placeholder="topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
      <input placeholder="niche" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
      <input placeholder="tone" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
      <div style={{ marginTop: 10 }}>
        <button onClick={createPost}>Generate Post</button>
        <button onClick={loadPosts} style={{ marginLeft: 8 }}>Scheduled Posts</button>
      </div>

      <h2>Preview</h2>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8, overflowX: "auto" }}>
        {result ? JSON.stringify(result.generated || result, null, 2) : "No generated post yet"}
      </pre>

      <h2>Analytics / Status</h2>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8, overflowX: "auto" }}>
        {JSON.stringify(posts, null, 2)}
      </pre>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
