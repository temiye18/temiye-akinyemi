"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

const Shard = dynamic(() => import("./Shard"), {
  ssr: false,
  loading: () => <Poster />,
});

/** GPU-free faceted stand-in for reduced-motion and initial load. */
function Poster() {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(230,162,81,0.16), transparent 62%)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(145deg,#1a1e2b,#0b0c12_70%)]"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
          boxShadow: "0 0 60px rgba(230,162,81,0.12)",
        }}
      />
    </div>
  );
}

export default function ArtifactCanvas() {
  const reduce = useReducedMotion();
  if (reduce) return <Poster />;
  return <Shard />;
}
