"use client";

import { useEffect, useRef, useState } from "react";
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
 * affordance. Desktop-only and aria-hidden.
 *
 * Only the active section is React state (it changes rarely). Progress and
 * velocity are written straight to the DOM via refs so scrolling never triggers
 * a per-frame re-render.
 */
export default function TelemetryHUD() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const barRef = useRef<HTMLDivElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);

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
      if (barRef.current) {
        barRef.current.style.width = `${(h > 0 ? y / h : 0) * 100}%`;
      }

      const now = performance.now();
      const dt = now - lastT;
      if (velRef.current) {
        if (dt > 0) {
          const v = Math.abs((y - lastY) / dt) * 1000;
          velRef.current.textContent = `· ${Math.round(v)} px/s`;
        }
        velRef.current.style.opacity = "1";
      }
      lastY = y;
      lastT = now;

      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        if (velRef.current) velRef.current.style.opacity = "0";
      }, 220);
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
            ref={velRef}
            className="opacity-0 transition-opacity duration-300"
          />
        )}
      </div>
      <div className="h-px w-40 bg-[var(--color-line)]">
        <div ref={barRef} className="h-full w-0 bg-[var(--color-muted)]" />
      </div>
    </div>
  );
}
