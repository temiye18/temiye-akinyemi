"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

// WebGL canvas never renders on the server.
const ShaderField = dynamic(() => import("./ShaderField"), {
  ssr: false,
  loading: () => <StaticBackdrop />,
});

/** Static, GPU-free fallback used for reduced-motion and while the canvas loads. */
function StaticBackdrop() {
  return (
    <div
      className="h-full w-full"
      style={{
        background:
          "radial-gradient(58% 55% at 50% 45%, color-mix(in srgb, var(--color-ink) 7%, transparent), transparent 70%), var(--color-ground)",
      }}
    />
  );
}

export default function HeroBackdrop() {
  const reduce = useReducedMotion();
  if (reduce) return <StaticBackdrop />;
  return <ShaderField />;
}
