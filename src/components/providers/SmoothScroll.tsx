"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

/**
 * Inertial smooth-scroll (Lenis). It runs its own RAF loop (autoRaf), which is
 * the robust default — no manual ticker to fall out of sync. Reduced-motion
 * gets native scrolling (no wheel smoothing). Touch stays native everywhere.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        lerp: reduce ? 1 : 0.1,
        smoothWheel: !reduce,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        // smooth-scroll in-page anchor links, offset to clear the fixed nav
        anchors: reduce ? false : { offset: -80 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
