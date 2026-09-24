"use client";

import { useEffect, useRef, useState } from "react";
import { nav } from "@/lib/content";

/** Document-space top of an element, ignoring transforms (the 3D plane). */
function docTop(el: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/**
 * The index. Links are set in Fraunces; the section you're in leans into
 * italic, the site's one emphasis device (roman and italic are stacked in one
 * grid cell and crossfade, so a word never changes width or nudges its
 * neighbours). Beneath runs a hairline reading rail: each link's segment fills
 * with ink as you read its section; finished sections stay drawn, softer;
 * sections ahead stay blank. Writes are transform-only, rAF-throttled.
 */
export default function NavIndex() {
  const [active, setActive] = useState(-1);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    let raf = 0;
    let tops: number[] = [];
    let heights: number[] = [];
    let vh = window.innerHeight;
    let maxScroll = 0;

    // All geometry is read here (on resize), never in the scroll frame: by the
    // time our rAF runs, GSAP's scrubbed tweens have written styles, and a
    // layout read then would force a synchronous reflow every frame.
    const measure = () => {
      const els = ids.map((id) => document.getElementById(id));
      tops = els.map((el) => (el ? docTop(el) : 0));
      heights = els.map((el) => (el ? el.offsetHeight : 1));
      vh = window.innerHeight;
      maxScroll = document.documentElement.scrollHeight - vh;
    };

    const update = () => {
      raf = 0;
      const probe = window.scrollY + vh * 0.45;
      let current = -1;
      ids.forEach((_, i) => {
        const top = tops[i];
        const last = i === ids.length - 1;
        // the last section can't reach the probe line, so it fills against
        // the end of the page instead
        const end = last ? Math.min(top + heights[i], maxScroll + vh * 0.45) : top + heights[i];
        const p = Math.min(1, Math.max(0, (probe - top) / Math.max(1, end - top)));
        const el = fills.current[i];
        if (el) el.style.transform = `scaleX(${p.toFixed(4)})`;
        if (probe >= top && (probe < top + heights[i] || last)) current = i;
      });
      setActive((a) => (a === current ? a : current));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      schedule();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <ul className="nav-index relative flex items-center gap-7 pb-2.5">
      {/* the rail */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[var(--color-line)]" />
      {nav.map((item, i) => {
        const isActive = active === i;
        const done = active > i;
        return (
          <li key={item.href} className="relative">
            <a
              href={item.href}
              data-cursor-target
              aria-current={isActive ? "location" : undefined}
              className={`group grid font-[family-name:var(--font-display)] text-[0.98rem] leading-none tracking-[-0.005em] transition-colors duration-300 ${
                isActive ? "text-[var(--color-ink)]" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <span
                className={`[grid-area:1/1] transition-opacity duration-500 ease-[var(--ease-out-expo)] ${
                  isActive ? "opacity-0" : "opacity-100"
                }`}
              >
                {item.label}
              </span>
              <span
                aria-hidden
                className={`[grid-area:1/1] italic transition-opacity duration-500 ease-[var(--ease-out-expo)] ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.label}
              </span>
            </a>
            {/* this section's segment of the rail */}
            <span
              aria-hidden
              ref={(el) => {
                fills.current[i] = el;
              }}
              className={`absolute inset-x-0 -bottom-2.5 h-px origin-left transition-colors duration-500 ${
                done ? "bg-[var(--color-muted)]" : "bg-[var(--color-ink)]"
              }`}
              style={{ transform: "scaleX(0)" }}
            />
          </li>
        );
      })}
    </ul>
  );
}
