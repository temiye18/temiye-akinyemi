"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * "Withhold, then reward" made literal: a soft veil (blur + ground tint) over
 * the headline, with a lens that follows the pointer and wipes it crisp — like
 * clearing fog off glass. Fine-pointer only; reduced-motion and touch see the
 * headline fully clear (the veil never mounts). Positioned as an overlay inside
 * a `relative` headline wrapper.
 */
export default function LensReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine && !reduce) setActive(true);
  }, [reduce]);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const r0 = el.getBoundingClientRect();
    let mx = r0.width / 2;
    let my = r0.height / 2;
    let tx = mx;
    let ty = my;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };

    const loop = () => {
      mx += (tx - mx) * 0.16;
      my += (ty - my) * 0.16;
      el.style.setProperty("--mx", `${mx}px`);
      el.style.setProperty("--my", `${my}px`);
      raf = requestAnimationFrame(loop);
    };

    el.style.setProperty("--mx", `${mx}px`);
    el.style.setProperty("--my", `${my}px`);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div ref={ref} aria-hidden className="lens-veil pointer-events-none absolute inset-0 z-10" />
  );
}
