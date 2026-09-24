"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

// WebGL canvas never renders on the server.
const BeamField = dynamic(() => import("./BeamField"), {
  ssr: false,
  loading: () => <StaticBackdrop />,
});

/**
 * Static, GPU-free fallback (reduced motion, and while the canvas loads): the
 * same room and the same fall of light, held still.
 */
function StaticBackdrop() {
  return (
    <div
      className="h-full w-full"
      style={{
        background:
          "linear-gradient(128deg, transparent 18%, color-mix(in srgb, var(--color-ink) 9%, transparent) 34%, color-mix(in srgb, var(--color-ink) 4%, transparent) 50%, transparent 66%), radial-gradient(90% 80% at 40% 52%, var(--color-ground), color-mix(in srgb, var(--color-ground) 70%, black))",
      }}
    />
  );
}

export default function HeroBackdrop() {
  const reduce = useReducedMotion();
  if (reduce) return <StaticBackdrop />;
  return <BeamField />;
}
