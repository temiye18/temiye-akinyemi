"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** max pull toward the pointer, px */
  strength?: number;
};

/**
 * Magnetic wrapper: pulls its child toward the pointer within its bounds and
 * springs back on leave. Pointer-only and reduced-motion-safe — it renders a
 * plain wrapper when a spring would be inappropriate.
 */
export default function Magnetic({
  children,
  className,
  strength = 14,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.5 });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const relX = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const relY = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, relX)) * strength);
    y.set(Math.max(-1, Math.min(1, relY)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}
