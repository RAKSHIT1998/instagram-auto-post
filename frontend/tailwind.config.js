/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F1A",
        card: "#111827",
        accent: "#7C3AED",
        cyan: "#06B6D4",
        text: "#E5E7EB",
        muted: "#9CA3AF",
        success: "#10B981"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124, 58, 237, 0.3), 0 10px 30px rgba(6, 182, 212, 0.15)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};
