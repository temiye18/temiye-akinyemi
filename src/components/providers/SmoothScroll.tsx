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

/**
 * In-page anchors (`#work`, `#about`…) are scrolled by Lenis; the browser's own
 * fragment navigation must never run alongside it. It fires `popstate`, which
 * next-view-transitions treats as a route change: it freezes the page in a view
 * transition and only releases it when the URL hash changes. Clicking the
 * section already in the hash (e.g. Work while the URL ends in #work) never
 * changes it, so the page froze until Chrome's ~4s view-transition timeout and
 * then jumped. Cancelling the default in the capture phase leaves Lenis (which
 * listens later, on window) free to glide, and keeps the URL clean. Under
 * reduced motion Lenis's anchor handling is off, so jump there directly.
 */
function InPageAnchors({ reduce }: { reduce: boolean }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      e.preventDefault();
      if (!reduce) return; // Lenis takes it from here
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      const top = !el || el.id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "auto" });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduce]);
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
      <InPageAnchors reduce={!!reduce} />
      {children}
    </ReactLenis>
  );
}
