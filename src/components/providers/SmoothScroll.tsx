"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

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

  // Re-sync on client navigation. The Lenis root persists across route changes,
  // so after going home <-> case (very different heights) it keeps stale
  // dimensions and every pin keeps stale positions. Without this, the returned
  // home page has a mismatched pin/coverflow whose cards no longer sit where
  // hit-testing expects, so clicks land on nothing. Resize Lenis and refresh
  // ScrollTrigger a frame after the new route paints.
  useEffect(() => {
    if (!lenis) return;
    const id = requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

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
