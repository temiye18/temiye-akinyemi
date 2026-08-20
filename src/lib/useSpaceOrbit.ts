"use client";

import { type RefObject, useEffect } from "react";

/**
 * Shared 3D "space" orbit. Applies a perspective + slow rotateX/rotateY to `el`,
 * ramping up when idle and settling flat during scroll activity, with a gentle
 * pointer nudge. Used by both the site plane (SpacePlane) and the dashboard bento
 * so 3D mode feels identical in each. Off unless active, and only on fine
 * pointers (the caller folds reduced-motion into `active`).
 *
 * origin "viewport" pivots around the centre of the current viewport, so a long
 * scrolling page rotates as one plane without flinging its far ends off-screen.
 * origin "center" pivots around the element's own box centre, for a viewport-fit
 * surface like the dashboard, whose plane is the full-height overlay itself.
 */
export function useSpaceOrbit(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  origin: "viewport" | "center" = "viewport",
  // "scene": the perspective lives on a parent (via the CSS `perspective`
  // property) and the plane keeps `transform-style: preserve-3d`, so its child
  // cards can extrude toward the camera on hover. The plane's own transform is
  // then just the rotation. "inline" (default): perspective is baked into this
  // element's transform, flattening its children (the site plane needs no
  // extrusion).
  mode: "inline" | "scene" = "inline",
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const clear = () => {
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
    };

    if (!active || !fine) {
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
    // window scroll drives the site plane; the element's own scroll drives a
    // viewport-fit overlay that scrolls internally (both settle it flat).
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });

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

      if (origin === "viewport") {
        const originY = window.scrollY + window.innerHeight / 2;
        el.style.transformOrigin = `50% ${originY}px`;
      } else {
        el.style.transformOrigin = "50% 50%";
      }
      const rot = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
      el.style.transform =
        mode === "scene" ? rot : `perspective(1700px) ${rot}`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("scroll", onScroll);
      clear();
    };
  }, [ref, active, origin, mode]);
}
