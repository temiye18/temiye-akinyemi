"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Canonical Lenis + GSAP integration: Lenis is driven from GSAP's single ticker
 * and ScrollTrigger updates on every Lenis scroll, so pinning and scrubbed
 * effects stay in sync with the eased scroll. Refreshes after fonts load.
 */
function ScrollTriggerBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
    };
  }, [lenis]);

  return null;
}

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
        autoRaf: false,
        lerp: reduce ? 1 : 0.1,
        smoothWheel: !reduce,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        anchors: reduce ? false : { offset: -80 },
      }}
    >
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
