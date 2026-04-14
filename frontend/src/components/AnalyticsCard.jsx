import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function parseValue(value) {
  if (typeof value === "number") {
    return { numeric: value, prefix: "", suffix: "", animate: true };
  }

  if (typeof value !== "string") {
    return { numeric: 0, prefix: "", suffix: "", animate: false };
  }

  const match = value.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { numeric: 0, prefix: "", suffix: value, animate: false };
  }

  return {
    prefix: match[1] || "",
    numeric: Number(match[2]),
    suffix: match[3] || "",
    animate: Number.isFinite(Number(match[2]))
  };
}

export default function AnalyticsCard({ title, value }) {
  const { numeric, prefix, suffix, animate } = useMemo(() => parseValue(value), [value]);
  const [display, setDisplay] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplay(value);
      return;
    }

    const duration = 650;
    const start = performance.now();

    let frameId;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(numeric * eased);
      setDisplay(`${prefix}${current}${suffix}`);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [animate, numeric, prefix, suffix, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card p-5"
    >
      <p className="text-muted text-sm">{title}</p>
      <h3 className="text-3xl font-bold font-mono mt-1">{display}</h3>
    </motion.div>
  );
}
