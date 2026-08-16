"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useThreeD } from "@/components/providers/ThreeDMode";

/**
 * 3D "space" mode. Renders the page content as a single plane that orbits slowly
 * in 3D when idle — floating over the dotted field — and settles flat while you
 * scroll or read. The pivot tracks the centre of the current viewport so a long
 * page can rotate as one plane without flinging its far ends off-screen. Pointer
 * movement nudges the orbit. Off in 2D and under reduced-motion.
 */
export default function SpacePlane({
  children,
}: {
  children: React.ReactNode;
}) {
  const { enabled } = useThreeD();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const clear = () => {
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
    };

    if (!enabled || reduce || !fine) {
      clear();
      return;
    }

    el.style.willChange = "transform";

    let raf = 0;
    const start = performance.now();
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let lastScroll = performance.now();

    const onMove = (e: PointerEvent) => {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
    };
    const onScroll = () => {
      lastScroll = performance.now();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const loop = (now: number) => {
      const t = (now - start) / 1000;

      // ease the pointer influence
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;

      // amplitude ramps to full ~0.9s after the last scroll, so it settles flat
      // while reading and orbits when idle.
      const idleFor = now - lastScroll;
      const amp = Math.min(Math.max((idleFor - 120) / 900, 0), 1);

      // slow autonomous orbit + pointer nudge
      const ry = (Math.sin(t * 0.24) * 7 + mx * 12) * amp;
      const rx = (Math.cos(t * 0.19) * 4 - my * 7) * amp;

      const originY = window.scrollY + window.innerHeight / 2;
      el.style.transformOrigin = `50% ${originY}px`;
      el.style.transform = `perspective(1700px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      clear();
    };
  }, [enabled, reduce]);

  return <main ref={ref}>{children}</main>;
}
