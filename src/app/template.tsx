"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Per-navigation enter animation. Opacity-only on purpose — a transform here
 * would create a containing block and break `position: sticky`/`fixed` in the
 * pages below. Shared-element morphs are layered on via CSS view-transition-name
 * where the browser supports it; this is the universal baseline.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
