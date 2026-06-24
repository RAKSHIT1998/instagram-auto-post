import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function MotionSection({ eyebrow, title, description, children, className, minHeight = "min-h-[70vh]" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], [50, -30]);
  const opacity = useTransform(scrollYProgress, [0.05, 0.35, 0.95], [0.55, 1, 0.7]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.99]);

  return (
    <section ref={ref} className={`${minHeight} flex items-center justify-center px-4 md:px-8`}>
      <motion.div style={{ y, opacity, scale }} className={className || "glass-card max-w-4xl w-full p-8 md:p-14"}>
        {children || (
          <>
            <p className="text-cyan uppercase tracking-[0.2em] text-xs mb-4">{eyebrow}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">{title}</h3>
            <p className="text-muted text-lg md:text-xl">{description}</p>
          </>
        )}
      </motion.div>
    </section>
  );
}
