"use client";

import Image from "next/image";
import { useState } from "react";
import { site } from "@/lib/content";

const CARD =
  "rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]";

/**
 * About portrait card. Shows /public/temiye.png in full color, with a scrim so
 * the name stays readable; falls back to a large monogram if the image is absent.
 */
export default function Portrait() {
  const [hasImage, setHasImage] = useState(true);

  return (
    <div
      className={`${CARD} relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden p-7`}
    >
      {hasImage ? (
        <Image
          src="/temiye.png"
          alt={site.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          onError={() => setHasImage(false)}
          className="object-cover"
        />
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
