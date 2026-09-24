"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A large statement whose words fill from faint to full ink, coming into
 * focus as they do, as you scroll through it (GSAP ScrollTrigger scrub). Words are readable by default, so the
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
      // Each word comes into focus as it fills: faint and soft, then full ink.
      // Blur (not a variable-font axis) so glyph widths, and the line breaks,
      // never move while you scroll.
      gsap.set(els, { opacity: 0.16, filter: "blur(5px)" });
      gsap.to(els, {
        opacity: 1,
        filter: "blur(0px)",
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
