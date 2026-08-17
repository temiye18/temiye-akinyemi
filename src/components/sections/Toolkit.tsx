"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  siTypescript,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siRedis,
  siSocketdotio,
  siDocker,
  siGooglegemini,
  siTailwindcss,
  siStripe,
} from "simple-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { capabilities } from "@/lib/content";

// brand marks for the toolkit, keyed by the tool name in content
const LOGOS: Record<string, { path: string }> = {
  TypeScript: siTypescript,
  React: siReact,
  "Next.js": siNextdotjs,
  "Node.js": siNodedotjs,
  PostgreSQL: siPostgresql,
  Prisma: siPrisma,
  Redis: siRedis,
  "Socket.IO": siSocketdotio,
  Docker: siDocker,
  "Google Gemini": siGooglegemini,
  "Tailwind CSS": siTailwindcss,
  Stripe: siStripe,
};

// real brand hue, revealed only on engagement. Marks whose identity is
// black/white keep the theme ink so they stay legible in both themes.
const BRAND: Record<string, string> = {
  TypeScript: "#3178C6",
  React: "#61DAFB",
  "Next.js": "var(--color-ink)",
  "Node.js": "#5FA04E",
  PostgreSQL: "#4169E1",
  Prisma: "var(--color-ink)",
  Redis: "#FF4438",
  "Socket.IO": "var(--color-ink)",
  Docker: "#2496ED",
  "Google Gemini": "#8E75B2",
  "Tailwind CSS": "#06B6D4",
  Stripe: "#635BFF",
};

function ToolMark({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

/**
 * The stack as brand marks. Calm and scannable at rest (faint monochrome), so a
 * recruiter reads it in a glance. Two restrained GSAP layers add life without
 * gimmickry: a staggered entrance as it scrolls in, and a cursor-proximity bloom
 * where nearby marks lift and fade up into their real brand colour. Touch and
 * reduced-motion fall back to a plain colour-on-hover; nothing is gated on JS.
 */
export default function Toolkit() {
  const reduce = useReducedMotion();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const gridRef = useRef<HTMLUListElement>(null);

  // Staggered entrance.
  useGSAP(
    () => {
      if (reduce) return;
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", gridRef.current);
      gsap.from(cells, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        stagger: { each: 0.045, from: "start" },
        scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
      });
    },
    { dependencies: [] },
  );

  // Cursor-proximity bloom: nearer the pointer, the more a mark lifts and the
  // more its brand-colour overlay fades in. rAF-throttled; resets on leave.
  useGSAP(
    () => {
      if (!fine || reduce) return;
      const grid = gridRef.current;
      if (!grid) return;
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", grid);
      const R = 130; // how far the bloom reaches beyond the cell under the cursor
      let raf = 0;
      let px = -9999;
      let py = -9999;

      const marks = cells.map((c) => c.querySelector<HTMLElement>("[data-mark]"));
      const overlays = cells.map((c) => c.querySelector<HTMLElement>("[data-brand]"));

      // Distance from the pointer to a cell's rectangle: 0 while inside it, so
      // the cell under the cursor blooms fully and neighbours light as you near.
      // Read every rect first, then write, so a frame never thrashes layout.
      const update = () => {
        raf = 0;
        const es = cells.map((cell) => {
          const r = cell.getBoundingClientRect();
          const dx = Math.max(r.left - px, 0, px - r.right);
          const dy = Math.max(r.top - py, 0, py - r.bottom);
          return Math.max(0, 1 - Math.hypot(dx, dy) / R);
        });
        for (let i = 0; i < cells.length; i++) {
          const e = es[i];
          if (overlays[i]) overlays[i]!.style.opacity = e.toFixed(3);
          if (marks[i])
            marks[i]!.style.transform = `translateY(${(-7 * e).toFixed(2)}px) scale(${(1 + 0.1 * e).toFixed(3)})`;
        }
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      const onMove = (ev: PointerEvent) => {
        px = ev.clientX;
        py = ev.clientY;
        schedule();
      };
      const onLeave = () => {
        px = -9999;
        py = -9999;
        schedule();
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      grid.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        grid.removeEventListener("pointerleave", onLeave);
        cancelAnimationFrame(raf);
        for (const cell of cells) {
          const mark = cell.querySelector<HTMLElement>("[data-mark]");
          const overlay = cell.querySelector<HTMLElement>("[data-brand]");
          if (mark) mark.style.transform = "";
          if (overlay) overlay.style.opacity = "";
        }
      };
    },
    { dependencies: [fine, reduce] },
  );

  return (
    <ul
      ref={gridRef}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3 lg:grid-cols-4"
    >
      {capabilities.toolkit.map((name) => {
        const logo = LOGOS[name];
        return (
          <li
            key={name}
            data-cell
            style={{ "--brand": BRAND[name] ?? "var(--color-ink)" } as React.CSSProperties}
            className="group flex items-center gap-4 bg-[var(--color-surface)] px-6 py-7 transition-colors duration-300 hover:bg-[var(--color-surface-2)]"
          >
            {logo && (
              <span
                data-mark
                className="relative shrink-0 will-change-transform transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5"
              >
                {/* faint base, always visible */}
                <span className="block text-[var(--color-faint)]">
                  <ToolMark path={logo.path} />
                </span>
                {/* brand overlay: proximity-driven on fine pointers, hover elsewhere */}
                <span
                  data-brand
                  aria-hidden
                  className="absolute inset-0 opacity-0 [color:var(--brand)] transition-opacity duration-300 group-hover:opacity-100"
                >
                  <ToolMark path={logo.path} />
                </span>
              </span>
            )}
            <span className="text-sm text-[var(--color-ink)]">{name}</span>
          </li>
        );
      })}
    </ul>
  );
}
