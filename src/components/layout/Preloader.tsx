"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content";

const NAME = site.name;
const COLUMNS = 6;

/** false on the server and first client render, true after hydration. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Preloader → hero handoff, choreographed with GSAP. The name rises in from
 * behind masks while a progress line and counter run, then the panel lifts away
 * as staggered vertical slats to reveal the hero. Plays on every load,
 * skippable, and skipped entirely under reduced motion.
 */
export default function Preloader() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const mounted = useMounted();

  const [dismissed, setDismissed] = useState(false);

  // Plays on every full page load (the layout persists across in-app
  // navigations, so it won't replay when moving between routes).
  const show = mounted && !reduce && !dismissed;

  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const finish = () => setDismissed(true);

  // lock scroll while the overlay is up
  useEffect(() => {
    if (!show) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [show, lenis]);

  // skip: fast-forward the timeline to its end
  useEffect(() => {
    if (!show) return;
    const skip = () => tlRef.current?.progress(1);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  useGSAP(
    () => {
      if (!show) return;
      const counter = { v: 0 };

      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;

      tl.set(".pl-char", { yPercent: 118 })
        .set(".pl-sub", { yPercent: 130, opacity: 0 })
        .set(".pl-progress", { scaleX: 0 })
        .set(".pl-col", { yPercent: 0 });

      // name rises in
      tl.to(
        ".pl-char",
        { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.035 },
        0.15,
      )
        .to(
          ".pl-sub",
          { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out" },
          0.5,
        )
        // progress line + counter run alongside
        .to(
          ".pl-progress",
          { scaleX: 1, duration: 1.6, ease: "power2.inOut" },
          0.1,
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counterRef.current)
                counterRef.current.textContent = String(
                  Math.round(counter.v),
                ).padStart(3, "0");
            },
          },
          0.1,
        );

      // exit: name lifts out, then the slats lift away to reveal the hero
      tl.to(
        ".pl-char",
        { yPercent: -118, duration: 0.7, ease: "expo.in", stagger: 0.02 },
        "+=0.35",
      )
        .to(
          [".pl-sub", ".pl-meta"],
          { opacity: 0, y: -16, duration: 0.4, ease: "power2.in" },
          "<",
        )
        .to(
          ".pl-col",
          {
            yPercent: -100,
            duration: 1,
            ease: "expo.inOut",
            stagger: { each: 0.08, from: "center" },
          },
          "<0.15",
        );
    },
    { scope: rootRef, dependencies: [show] },
  );

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[10000] overflow-hidden"
      aria-hidden
    >
      {/* slats — the opaque panel that lifts away */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <div
            key={i}
            className="pl-col h-full flex-1 border-r border-[var(--color-line)] bg-[var(--color-ground)] last:border-r-0"
          />
        ))}
      </div>

      {/* content, above the slats */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <h2 className="flex flex-wrap justify-center gap-x-[0.28em] text-center font-[family-name:var(--font-display)] text-[clamp(2rem,7vw,4.5rem)] font-medium leading-none tracking-tight text-[var(--color-ink)]">
          {NAME.split(" ").map((word, wi) => (
            <span key={wi} className="inline-flex">
              {word.split("").map((ch, ci) => (
                <span
                  key={ci}
                  className="inline-block overflow-hidden pb-[0.12em] align-bottom"
                >
                  <span className="pl-char inline-block">{ch}</span>
                </span>
              ))}
            </span>
          ))}
        </h2>
        <span className="pl-sub mt-5 font-[family-name:var(--font-sans)] text-[0.72rem] font-medium uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Software Engineer
        </span>
      </div>

      {/* corner readouts + progress line */}
      <div className="pl-meta absolute inset-x-0 bottom-0">
        <div className="flex items-end justify-between px-6 pb-5 sm:px-10">
          <span className="font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.2em] text-[var(--color-faint)]">
            Loading experience
          </span>
          <span
            ref={counterRef}
            className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.2em] text-[var(--color-faint)] [font-variant-numeric:tabular-nums]"
          >
            000
          </span>
        </div>
        <div className="h-px w-full bg-[var(--color-line)]">
          <div className="pl-progress h-full origin-left bg-[var(--color-ink)]" />
        </div>
      </div>
    </div>
  );
}
