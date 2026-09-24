"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content";

/**
 * The portrait, hung as a framed print: a hairline frame, a mat, and the
 * photograph behind glass, lit from beyond the top-left like everything else in
 * this gallery (the Beam's light comes from the same side). As it scrolls into
 * view the gallery light comes up on it: a dark veil lifts and the
 * raking light fades in, scrubbed to scroll. The photo drifts gently inside the
 * mat. Opacity and transform only; reduced motion shows it lit and still. Falls
 * back to a monogram when the photo is missing.
 */
export default function Portrait() {
  const [hasImage, setHasImage] = useState(true);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduce) return;
      const root = rootRef.current;
      // the lights come up as the print arrives
      gsap.fromTo(
        veilRef.current,
        { opacity: 0.7 },
        {
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 95%", end: "top 58%", scrub: true },
        },
      );
      gsap.fromTo(
        lightRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 85%", end: "top 45%", scrub: true },
        },
      );
      if (hasImage) {
        gsap.fromTo(
          imgRef.current,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    },
    { scope: rootRef, dependencies: [reduce, hasImage] },
  );

  return (
    <figure ref={rootRef} className="print relative m-0">
      {/* the frame and its mat */}
      <div className="print-frame border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-[clamp(0.6rem,1.1vw,1rem)]">
        {/* behind the glass */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-surface-2)]">
          {hasImage ? (
            <div ref={imgRef} className="absolute inset-x-0 -inset-y-[6%]">
              <Image
                src="/temiye.png"
                alt={site.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                onError={() => setHasImage(false)}
                className="object-cover object-[50%_22%]"
              />
            </div>
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 grid place-items-center font-[family-name:var(--font-display)] text-[12rem] leading-none text-[var(--color-line-strong)]"
            >
              T
            </span>
          )}
          {/* raking light from the top-left, and the fall-off away from it */}
          <div ref={lightRef} aria-hidden className="print-light pointer-events-none absolute inset-0" style={{ opacity: reduce ? 1 : 0 }} />
          {/* the room before the lights come up: dark in both themes, since
              an unlit print dims rather than fogs */}
          <div
            ref={veilRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#0f0e0c]"
            style={{ opacity: reduce ? 0 : 0.7 }}
          />
          {/* the cover that rolls up off the print when it is first hung (see
              AboutChoreo); at rest, and without JS, it is rolled away */}
          <div
            data-a="blind"
            aria-hidden
            className="pointer-events-none absolute inset-0 origin-top bg-[var(--color-surface)]"
            style={{ transform: "scaleY(0)" }}
          />
          {/* the glass: a faint inner edge where it meets the mat */}
          <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]" />
        </div>
      </div>
    </figure>
  );
}
