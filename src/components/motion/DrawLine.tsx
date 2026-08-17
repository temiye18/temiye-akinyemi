"use client";

import { motion, useReducedMotion } from "motion/react";

/** A hairline that draws in from the left on scroll-into-view. */
export default function DrawLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`h-px origin-left bg-[var(--color-line-strong)] ${className ?? ""}`}
      initial={{ scaleX: reduce ? 1 : 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
