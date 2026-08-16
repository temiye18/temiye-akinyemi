"use client";

import { motion, useReducedMotion } from "motion/react";

/** A thin monochrome proficiency bar that fills on scroll-into-view. */
export default function Meter({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`relative h-[2px] w-full overflow-hidden bg-[var(--color-line-strong)] ${className ?? ""}`}
    >
      <motion.span
        className="absolute inset-y-0 left-0 block bg-[var(--color-ink)]"
        initial={{ width: reduce ? `${level}%` : 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
