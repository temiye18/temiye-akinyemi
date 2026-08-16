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
          "radial-gradient(60% 55% at 50% 45%, rgba(230,162,81,0.10), transparent 70%), radial-gradient(120% 100% at 50% 50%, #0e1018 0%, #0b0c12 60%, #08090e 100%)",
      }}
    />
  );
}

export default function HeroBackdrop() {
  const reduce = useReducedMotion();
  if (reduce) return <StaticBackdrop />;
  return <ShaderField />;
}
