"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "capabilities", label: "Capabilities" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/**
 * A quiet corner readout — section index, current section, live scroll velocity
 * (only while moving), and overall progress. Doubles as the site's scroll-progress
 * affordance. Desktop-only, aria-hidden, and it fades its telemetry at rest so it
 * never nags. Mono numerals here are genuine measurement, not decoration.
 */
export default function TelemetryHUD() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [vel, setVel] = useState(0);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    ) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = SECTIONS.findIndex((s) => s.id === e.target.id);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));

    let lastY = window.scrollY;
    let lastT = performance.now();
    let stopTimer = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? y / h : 0);

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) setVel(Math.abs((y - lastY) / dt) * 1000);
      lastY = y;
      lastT = now;

      setScrolling(true);
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => setScrolling(false), 220);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(stopTimer);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-6 left-6 z-40 hidden select-none flex-col gap-2 md:flex"
    >
      <div className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.14em] text-[var(--color-faint)] [font-variant-numeric:tabular-nums]">
        <span>
          {(active + 1).toString().padStart(2, "0")} /{" "}
          {SECTIONS.length.toString().padStart(2, "0")}
        </span>
        <span className="h-3 w-px bg-[var(--color-line-strong)]" />
        <span className="uppercase">{SECTIONS[active].label}</span>
        {!reduce && (
          <span
            className={`transition-opacity duration-300 ${scrolling ? "opacity-100" : "opacity-0"}`}
          >
            · {Math.round(vel)} px/s
          </span>
        )}
      </div>
      <div className="h-px w-40 bg-[var(--color-line)]">
        <div
          className="h-full bg-[var(--color-muted)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
