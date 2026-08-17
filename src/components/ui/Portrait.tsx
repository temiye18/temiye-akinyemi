"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content";

const CARD =
  "rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]";

/**
 * About portrait card. Shows /public/temiye.png in full color with a scrim so
 * the name stays readable; the photo drifts gently against the scroll (GSAP
 * parallax, gap-free via an oversized wrapper). Falls back to a monogram.
 */
export default function Portrait() {
  const [hasImage, setHasImage] = useState(true);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduce || !hasImage) return;
      gsap.fromTo(
        imgRef.current,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: rootRef, dependencies: [reduce, hasImage] },
  );

  return (
    <div
      ref={rootRef}
      className={`${CARD} relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden p-7`}
    >
      {hasImage ? (
        <div ref={imgRef} className="absolute inset-x-0 -inset-y-[8%]">
          <Image
            src="/temiye.png"
            alt={site.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setHasImage(false)}
            className="object-cover"
          />
        </div>
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-[family-name:var(--font-display)] text-[13rem] leading-none text-[var(--color-line-strong)]"
        >
          T
        </span>
      )}

      {/* scrim so the name stays readable over the photo, in either theme */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--color-ground) 90%, transparent), color-mix(in srgb, var(--color-ground) 10%, transparent) 55%, transparent)",
        }}
      />

      <div className="relative">
        <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          {site.name}
        </p>
        <p className="eyebrow mt-2">{site.location}</p>
      </div>
    </div>
  );
}
