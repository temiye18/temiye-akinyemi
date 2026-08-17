"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Lifts and dissolves its content as it scrolls out of view (GSAP scrub).
 * Used for the hero's cinematic departure. Off for reduced motion.
 */
export default function ScrollFade({
  children,
  className,
  y = -140,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      gsap.to(ref.current, {
        y,
        opacity: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref, dependencies: [reduce, y] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
