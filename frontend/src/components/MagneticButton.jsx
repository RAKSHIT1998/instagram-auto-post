import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const COARSE_POINTER = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export default function MagneticButton({ children, className = "", onClick, disabled, as = "button", href }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.2 });

  if (COARSE_POINTER) {
    const Tag = as;
    return (
      <Tag className={className} onClick={onClick} disabled={disabled} href={href}>
        {children}
      </Tag>
    );
  }

  function onMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const MotionTag = motion[as] || motion.button;

  return (
    <MotionTag
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      onClick={onClick}
      disabled={disabled}
      href={href}
    >
      {children}
    </MotionTag>
  );
}
