"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { site } from "@/lib/content";

const REST = "emiye Akinyemi";

/**
 * The name, handed up from the hero. While the hero headline is on screen the
 * nav holds only the monogram "T." (the hero already says who this is). Once
 * the headline scrolls away, the name unfurls letter by letter into
 * "Temiye Akinyemi." and the italic dot travels to the end; scroll back and it
 * folds away again. Width unfolds on a 0fr → 1fr grid track, so nothing else
 * in the bar moves. Screen readers always get the full name.
 */
export default function Wordmark({ forceExpanded = false }: { forceExpanded?: boolean }) {
  const [heroVisible, setHeroVisible] = useState(true);
  // pages without the hero (a case study) show the full name from the start
  const hasHero = useSyncExternalStore(
    () => () => {},
    () => !!document.querySelector("[data-hero-name]"),
    () => true,
  );

  useEffect(() => {
    const hero = document.querySelector("[data-hero-name]");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), {
      rootMargin: "-72px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const expanded = forceExpanded || !hasHero || !heroVisible;

  return (
    <a
      href="#top"
      data-cursor-target
      aria-label={`${site.name}, back to top`}
      data-expanded={expanded}
      className="wordmark group inline-flex items-baseline font-[family-name:var(--font-display)] text-[1.2rem] leading-none tracking-[-0.01em] text-[var(--color-ink)]"
    >
      <span aria-hidden>T</span>
      <span aria-hidden className="wordmark-track">
        <span className="wordmark-rest">
          {REST.split("").map((ch, i) => (
            <span key={i} className="wordmark-ch" style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? "\u00a0" : ch}
            </span>
          ))}
        </span>
      </span>
      <span aria-hidden className="italic text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-ink)]">
        .
      </span>
    </a>
  );
}
