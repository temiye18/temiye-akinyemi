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
            "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--color-ink) 8%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(145deg,#7a7263,#4a4438_72%)]"
        style={{
          clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
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
