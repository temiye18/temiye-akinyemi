"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Drifts its child vertically against the scroll for subtle depth (GSAP scrub).
 * `amount` is the peak offset in px over the element's travel through the
 * viewport; positive drifts up (moves slower than scroll). Off for reduced motion.
 */
export default function Parallax({
  children,
  className,
  amount = 60,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      gsap.fromTo(
        ref.current,
        { y: amount },
        {
          y: -amount,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [reduce, amount] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
