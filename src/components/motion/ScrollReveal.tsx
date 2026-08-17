"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A large statement whose words fill from faint to full ink as you scroll
 * through it (GSAP ScrollTrigger scrub). Words are readable by default, so the
 * content never depends on the effect firing; reduced-motion shows them full.
 */
export default function ScrollReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const words = text.split(" ");

  useGSAP(
    () => {
      if (reduce) return;
      const els = gsap.utils.toArray<HTMLElement>(".sr-word", ref.current);
      gsap.set(els, { opacity: 0.16 });
      gsap.to(els, {
        opacity: 1,
        ease: "none",
        stagger: 0.4,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 78%",
          end: "bottom 52%",
          scrub: true,
        },
      });
    },
    { scope: ref, dependencies: [reduce] },
  );

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="sr-word mr-[0.26em] inline-block">
          {w}
        </span>
      ))}
    </p>
  );
}
