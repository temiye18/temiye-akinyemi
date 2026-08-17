"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * State-aware custom cursor. Renders only on fine-pointer devices, hides the
 * native cursor, follows the pointer with inertial lerp, and swells when over
 * anything interactive. Fully skipped for touch/coarse pointers and honored
 * against prefers-reduced-motion (shown, but without the lerp trail).
 */
export default function Cursor() {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine)");
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Hide the native cursor while ours is active.
  useEffect(() => {
    if (!enabled) return;
    document.body.dataset.cursor = "on";
    return () => {
      delete document.body.dataset.cursor;
    };
  }, [enabled]);

  // Wire pointer tracking only once the nodes are actually in the DOM.
  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let hovering = false;
    let raf = 0;

    const isTarget = (el: Element | null) =>
      !!el?.closest("a, button, [data-cursor-target]");

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px)`;
      const nextHover = isTarget(e.target as Element);
      if (nextHover !== hovering) {
        hovering = nextHover;
        ring.dataset.hover = hovering ? "true" : "false";
      }
      if (reduce) ring.style.transform = `translate(${tx}px, ${ty}px)`;
    };

    const loop = () => {
      rx += (tx - rx) * 0.15;
      ry += (ty - ry) * 0.15;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={ringRef}
        data-hover="false"
        className="absolute -left-4 -top-4 h-8 w-8 rounded-full border border-[var(--color-accent)] transition-[width,height,opacity,background-color] duration-300 ease-[var(--ease-out-expo)] data-[hover=true]:-left-6 data-[hover=true]:-top-6 data-[hover=true]:h-12 data-[hover=true]:w-12 data-[hover=true]:bg-[var(--color-accent-soft)]"
      />
      <div
        ref={dotRef}
        className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
      />
    </div>
  );
}
