"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { nav, site } from "@/lib/content";
import { useUIMode } from "@/components/providers/UIMode";
import { toggleTheme, useTheme } from "@/lib/theme";
import { toggleSound, useSoundPlaying } from "@/lib/sound";
import { LayoutGlyph, SoundGlyph, ThemeGlyph } from "./Glyphs";

const SLATS = 6;
const EASE = [0.76, 0, 0.24, 1] as const;

/** Two strokes that fold into an X. */
export function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="menu-glyph" data-open={open}>
      <span />
      <span />
    </span>
  );
}

/** The close control: mounts as two strokes, folds into an X a beat later. */
function CloseButton({ onClose }: { onClose: () => void }) {
  const [folded, setFolded] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFolded(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close menu"
      className="deck grid h-10 w-10 place-items-center rounded-full text-[var(--color-ink)]"
    >
      <MenuGlyph open={folded} />
    </button>
  );
}

/** Which section is under the reading line (for the italic current item). */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const els = nav
      .map((n) => document.getElementById(n.href.slice(1)))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return active;
}

/**
 * Phone and tablet menu. Opens on the same six-slat curtain as the preloader
 * (drawn down from the centre out) so the two read as one system, then the
 * index rises in, set large in Fraunces with the current section in italic.
 * Controls are labelled (touch has no hover). Focus is trapped inside; Escape,
 * the close button, or choosing a destination closes it.
 */
export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const { dashboard, setDashboard } = useUIMode();
  const theme = useTheme();
  const playing = useSoundPlaying();
  const active = useActiveSection(open);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const id = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a,button"));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, lenis, onClose]);

  const go = (href: string) => {
    onClose();
    const scroll = () => {
      lenis?.start();
      lenis?.scrollTo(href, { offset: -80 });
    };
    if (dashboard) {
      setDashboard(false);
      window.setTimeout(scroll, 140);
    } else window.setTimeout(scroll, reduce ? 0 : 380);
  };

  const pill =
    "flex h-11 items-center gap-2.5 rounded-full border border-[var(--color-line)] px-4 text-sm text-[var(--color-ink)] transition-colors duration-300 active:bg-[var(--color-accent-soft)]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[65] lg:hidden"
          initial="closed"
          animate="open"
          exit="closed"
        >
          {/* the curtain */}
          <div aria-hidden className="absolute inset-0 flex">
            {Array.from({ length: SLATS }).map((_, i) => {
              const fromCentre = Math.abs(i - (SLATS - 1) / 2);
              return (
                <motion.div
                  key={i}
                  className="-mr-px h-full flex-1 origin-top bg-[var(--color-ground)]"
                  variants={{
                    closed: { scaleY: 0, transition: { duration: reduce ? 0 : 0.5, ease: EASE, delay: reduce ? 0 : 0.12 + (2.5 - fromCentre) * 0.04 } },
                    open: { scaleY: 1, transition: { duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : fromCentre * 0.05 } },
                  }}
                />
              );
            })}
          </div>

          <motion.div
            className="relative flex h-full flex-col px-6 pb-8 pt-4 sm:px-8"
            variants={{
              closed: { opacity: 0, transition: { duration: reduce ? 0 : 0.2 } },
              open: { opacity: 1, transition: { duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.28 } },
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-display)] text-[1.2rem] tracking-[-0.01em]">
                {site.name}
                <span className="italic text-[var(--color-muted)]">.</span>
              </span>
              <CloseButton onClose={onClose} />
            </div>

            <nav aria-label="Sections" className="mt-auto">
              <ul>
                {nav.map((item, i) => {
                  const isActive = active === item.href;
                  return (
                    <motion.li
                      key={item.href}
                      variants={{
                        closed: { opacity: 0, y: 18 },
                        open: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.34 + i * 0.05 },
                        },
                      }}
                    >
                      <a
                        href={item.href}
                        aria-current={isActive ? "location" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          go(item.href);
                        }}
                        className={`flex items-baseline justify-between border-b border-[var(--color-line)] py-3.5 font-[family-name:var(--font-display)] text-[clamp(2.1rem,9vw,3rem)] leading-none tracking-[-0.02em] ${
                          isActive ? "italic text-[var(--color-ink)]" : "text-[var(--color-muted)]"
                        }`}
                      >
                        {item.label}
                        {isActive && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]" />}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              className="mt-8 flex flex-wrap gap-2.5"
              variants={{
                closed: { opacity: 0 },
                open: { opacity: 1, transition: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.62 } },
              }}
            >
              <button type="button" className={pill} onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}>
                <ThemeGlyph dark={theme === "dark"} />
                {theme === "dark" ? "Dark" : "Light"}
              </button>
              <button
                type="button"
                className={pill}
                aria-pressed={dashboard}
                onClick={() => {
                  setDashboard(!dashboard);
                  onClose();
                }}
              >
                <LayoutGlyph dashboard={dashboard} />
                {dashboard ? "Dashboard" : "Site"}
              </button>
              <button type="button" className={pill} aria-pressed={playing} onClick={() => void toggleSound()}>
                <SoundGlyph on={playing} />
                {playing ? "Sound on" : "Sound off"}
              </button>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm"
              variants={{
                closed: { opacity: 0 },
                open: { opacity: 1, transition: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.7 } },
              }}
            >
              <a href={`mailto:${site.email}`} className="text-[var(--color-ink)] underline decoration-[var(--color-line-strong)] underline-offset-4">
                {site.email}
              </a>
              <span className="flex gap-4">
                {site.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="eyebrow text-[var(--color-muted)]">
                    {s.label}
                  </a>
                ))}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
