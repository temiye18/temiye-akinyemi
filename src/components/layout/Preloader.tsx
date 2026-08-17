"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { site } from "@/lib/content";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%*/<>{}";
const NAME = site.name.toUpperCase();

/** false on the server and first client render, true after hydration. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Preloader → hero handoff. A 0→100 counter while the name resolves out of
 * scrambled glyphs, then the panel masks upward to reveal the hero. Runs once
 * per session, is skippable, and is skipped entirely for reduced-motion.
 *
 * Whether to show is derived (mounted + not reduced-motion + not seen this
 * session + not yet dismissed) rather than set from an effect.
 */
export default function Preloader() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const mounted = useMounted();

  // read once, on the client, whether the preloader already ran this session
  const [seen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("preloaded") === "1";
    } catch {
      return false;
    }
  });
  const [dismissed, setDismissed] = useState(false);
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState(NAME);

  const show = mounted && !reduce && !seen && !dismissed;

  // Lock scroll through Lenis while the overlay is up.
  useEffect(() => {
    if (!show) return;
    lenis?.stop();
    return () => {
      lenis?.start();
    };
  }, [show, lenis]);

  // Drive the counter + scramble.
  useEffect(() => {
    if (!show) return;
    let raf = 0;
    const duration = 1500;
    const start = performance.now();
    let finished = false;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(eased * 100);
      setCount(value);

      const revealed = Math.floor((value / 100) * NAME.length);
      let out = "";
      for (let i = 0; i < NAME.length; i++) {
        const ch = NAME[i];
        if (ch === " ") out += " ";
        else if (i < revealed) out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setLabel(out);

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!finished) {
        finished = true;
        setLabel(NAME);
        try {
          sessionStorage.setItem("preloaded", "1");
        } catch {
          /* ignore */
        }
        setTimeout(() => setDismissed(true), 260);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  // Skip on click / key.
  useEffect(() => {
    if (!show) return;
    const skip = () => {
      try {
        sessionStorage.setItem("preloaded", "1");
      } catch {
        /* ignore */
      }
      setDismissed(true);
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--color-ground)]"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <span
            aria-hidden
            className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,6vw,4rem)] tracking-[0.08em] text-[var(--color-ink)]"
          >
            {label}
          </span>
          <span className="eyebrow mt-6 text-[var(--color-faint)] [font-variant-numeric:tabular-nums]">
            {count.toString().padStart(3, "0")} · Loading experience
          </span>

          <div className="absolute bottom-0 left-0 h-px w-full bg-[var(--color-line)]">
            <div
              className="h-full bg-[var(--color-accent)] transition-[width] duration-100 ease-linear"
              style={{ width: `${count}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
