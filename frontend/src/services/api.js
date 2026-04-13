import axios from "axios";

const rawBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const normalizedBase = rawBase.replace(/\/+$/, "");
const baseURL = normalizedBase.endsWith("/api") ? normalizedBase : `${normalizedBase}/api`;

const API = axios.create({
  baseURL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
