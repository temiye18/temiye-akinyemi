"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useThreeD } from "@/components/providers/ThreeDMode";
import { ScrollTrigger } from "@/lib/gsap";
import { useSpaceOrbit } from "@/lib/useSpaceOrbit";

/**
 * 3D "space" mode. Renders the page content as a single plane that orbits slowly
 * in 3D when idle — floating over the page — and settles flat while you scroll or
 * read. The pivot tracks the centre of the current viewport so a long page can
 * rotate as one plane without flinging its far ends off-screen. Pointer movement
 * nudges the orbit. Off in 2D and under reduced-motion. (The orbit itself lives
 * in useSpaceOrbit, shared with the dashboard so 3D feels identical in both.)
 *
 * A transformed ancestor becomes the containing block for `position: fixed`, so
 * GSAP's pin (used by the coverflow gallery) cannot pin to the viewport while
 * this plane is transformed. The gallery therefore drops its pin in 3D mode
 * (see SelectedWork), and we refresh ScrollTrigger a frame after any toggle so
 * the pin spacer is added or removed cleanly.
 */
export default function SpacePlane({
  children,
}: {
  children: React.ReactNode;
}) {
  const { enabled } = useThreeD();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  useSpaceOrbit(ref, enabled && !reduce, "viewport");

  // Let the gallery rebuild (pin on/off) then re-measure every trigger.
  useEffect(() => {
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(refresh);
  }, [enabled, reduce]);

  return <main ref={ref}>{children}</main>;
}
