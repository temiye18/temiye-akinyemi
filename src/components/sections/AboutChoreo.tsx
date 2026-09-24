"use client";

import { useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

/**
 * The About section's entrance, played once as it arrives, in the order a
 * visitor would walk up to a wall in a gallery:
 *   1. the wall text rises line by line from behind its own masks;
 *   2. the print settles onto the wall and its cover rolls up like a blind;
 *   3. the reading beside it follows;
 *   4. the wall label goes up: its rules draw across, its rows come in one by
 *      one, and the status dot switches on last.
 * The markup is server-rendered and complete; this only hides what it is
 * about to animate, so without JS (or under reduced motion) nothing is hidden.
 * Transform and opacity only.
 */
export default function AboutChoreo({ id }: { id: string }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const root = document.getElementById(id);
    if (!root) return;
    const q = <T extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(`[data-a="${s}"]`));
    const ease = "expo.out";
    let split: SplitText | null = null;
    let cancelled = false;
    const ctx = gsap.context(() => {}, root);

    // Lines are measured, so split only once the real fonts are in (a fallback
    // face breaks the lines differently). The section sits well below the fold,
    // so this always settles long before it is seen.
    const build = () => ctx.add(() => {
      // 1. the wall text
      const stmt = q("stmt")[0];
      if (stmt) {
        split = SplitText.create(stmt, { type: "lines", mask: "lines", linesClass: "about-line" });
        gsap.set(split.lines, { yPercent: 108 });
        gsap.to(split.lines, {
          yPercent: 0,
          duration: 1.15,
          ease,
          stagger: 0.09,
          scrollTrigger: { trigger: stmt, start: "top 82%", once: true },
          onComplete: () => {
            // hand the heading back as plain text (balanced wrapping, clean a11y)
            split?.revert();
            split = null;
          },
        });
      }

      // 2 to 4. the print, the reading and the label, as one sequence
      const wall = q("wall")[0];
      if (!wall) return;
      const print = q("print");
      const blind = q("blind");
      const paras = q("para");
      const label = q("label");
      const name = q("name");
      const rules = q("rule");
      const rows = q("row");
      const status = q("status");
      const dot = q("dot");

      gsap.set(print, { y: 28, opacity: 0 });
      gsap.set(blind, { scaleY: 1 });
      gsap.set(paras, { y: 22, opacity: 0 });
      gsap.set(label, { y: 18, opacity: 0 });
      gsap.set([...name, ...rows, ...status], { opacity: 0, y: 8 });
      gsap.set(rules, { scaleX: 0 });
      gsap.set(dot, { scale: 0 });

      gsap
        .timeline({ scrollTrigger: { trigger: wall, start: "top 78%", once: true } })
        .to(print, { y: 0, opacity: 1, duration: 1.1, ease }, 0)
        .to(blind, { scaleY: 0, duration: 1.25, ease: "power4.inOut" }, 0.2)
        .to(paras, { y: 0, opacity: 1, duration: 0.95, ease, stagger: 0.12 }, 0.3)
        .to(label, { y: 0, opacity: 1, duration: 0.9, ease }, 0.55)
        .to(name, { y: 0, opacity: 1, duration: 0.7, ease }, 0.7)
        .to(rules, { scaleX: 1, duration: 0.9, ease: "power3.inOut", stagger: 0.07 }, 0.75)
        .to(rows, { y: 0, opacity: 1, duration: 0.7, ease, stagger: 0.07 }, 0.85)
        .to(status, { y: 0, opacity: 1, duration: 0.7, ease }, 1.2)
        .to(dot, { scale: 1, duration: 0.5, ease: "back.out(3)" }, 1.3);
    });

    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      build();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      split?.revert();
      ctx.revert();
    };
  }, [id, reduce]);

  return null;
}
