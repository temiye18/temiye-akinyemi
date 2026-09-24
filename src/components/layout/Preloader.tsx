"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { site } from "@/lib/content";

/** false on the server and first client render, true after hydration. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Tell the hero the name has landed (the light strikes then). */
function announceDone() {
  (window as Window & { __preloaderDone?: boolean }).__preloaderDone = true;
  window.dispatchEvent(new Event("preloader:done"));
}

/**
 * Real readiness, 0..1: fonts, eager images, and the window load event (which
 * waits on scripts, styles and every non-lazy resource). Lazy images are left
 * out; they may never load while offscreen.
 */
function trackReadiness() {
  let fonts = document.fonts ? 0 : 1;
  let loaded = document.readyState === "complete" ? 1 : 0;
  document.fonts?.ready.then(() => (fonts = 1));
  if (!loaded) window.addEventListener("load", () => (loaded = 1), { once: true });
  const eager = Array.from(document.images).filter((img) => img.loading !== "lazy");
  return () => {
    const imgs = eager.length ? eager.filter((i) => i.complete).length / eager.length : 1;
    const v = fonts * 0.35 + imgs * 0.3 + loaded * 0.35;
    // 0.35 + 0.3 + 0.35 sums to 0.9999999999999999 in floating point
    return v > 0.999 ? 1 : v;
  };
}

const MIN_MS = 1300; // never a flash, even on a warm cache
const MAX_MS = 7000; // never a wall, even on a bad connection

/**
 * The opening of the shot. In darkness a single filament of light warms up
 * beneath the name, growing from the centre as the page genuinely loads, and
 * the letters come up with it: the same light that will fill the room. When
 * everything is ready the filament flares and draws back to a point while the
 * name lifts off and flies to its exact place in the hero headline (rendered
 * at the headline's own size and scaled down, so it lands pixel-identical). On
 * landing the light strikes and the second line rises into it.
 *
 * Falls back to a simple fade when there's no clean line to land on (the
 * headline wraps, the page opened scrolled, or the dashboard is up). Plays on
 * every full load, skippable with any click or key, never under reduced motion.
 */
export default function Preloader() {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const mounted = useMounted();
  const [dismissed, setDismissed] = useState(false);
  const show = mounted && !reduce && !dismissed;

  const rootRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const filamentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  // No preloader this load (reduced motion): lift the pre-paint cover now.
  useEffect(() => {
    if (mounted && !show && !dismissed) document.documentElement.removeAttribute("data-preload");
  }, [mounted, show, dismissed]);

  // hold the page still while the shot opens
  useEffect(() => {
    if (!show) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [show, lenis]);

  useEffect(() => {
    if (!show) return;
    const root = document.documentElement;
    const name = nameRef.current;
    const track = trackRef.current;
    const filament = filamentRef.current;
    const glow = glowRef.current;
    const ground = groundRef.current;
    const meta = metaRef.current;
    if (!name || !track || !filament || !glow || !ground || !meta) return;

    // our own ground takes over from the pre-paint cover
    root.removeAttribute("data-preload");

    const h1 = document.querySelector<HTMLElement>("[data-hero-name]");
    const wrap = h1?.parentElement ?? null;
    const heroLine = h1?.firstElementChild as HTMLElement | null;
    const canLand = () => {
      if (!h1 || !heroLine || window.scrollY > 8) return false;
      if (root.dataset.uiMode === "dashboard") return false;
      const text = heroLine.firstChild;
      if (!text) return false;
      const r = document.createRange();
      r.selectNodeContents(text);
      return r.getClientRects().length === 1; // the name sits on one line
    };
    if (wrap && canLand()) wrap.dataset.heroIntro = "pending";

    // Set the travelling name exactly as the headline sets it.
    if (h1) {
      const cs = getComputedStyle(h1);
      name.style.fontSize = cs.fontSize;
      name.style.letterSpacing = cs.letterSpacing;
      name.style.lineHeight = cs.lineHeight;
      name.style.fontWeight = cs.fontWeight;
    }

    let s0 = 0.6;
    let x0 = 0;
    let y0 = 0;
    const place = () => {
      const w = name.offsetWidth;
      const h = name.offsetHeight;
      s0 = Math.min(0.62, (window.innerWidth - 48) / w);
      x0 = (window.innerWidth - w * s0) / 2;
      y0 = window.innerHeight * 0.44 - (h * s0) / 2;
      gsap.set(name, { x: x0, y: y0, scale: s0, transformOrigin: "0 0" });
      const fw = w * s0;
      Object.assign(track.style, { left: `${x0}px`, top: `${y0 + h * s0 + 22}px`, width: `${fw}px` });
    };
    place();
    window.addEventListener("resize", place);
    // the name's width changes when Fraunces swaps in; re-centre then
    document.fonts?.ready.then(() => !exiting && place());

    const readiness = trackReadiness();
    const t0 = performance.now();
    let shown = 0;
    let raf = 0;
    let exiting = false;
    let skipped = false;
    let tl: gsap.core.Timeline | null = null;

    const paint = (p: number) => {
      filament.style.transform = `scaleX(${p.toFixed(4)})`;
      glow.style.transform = `scaleX(${p.toFixed(4)})`;
      glow.style.opacity = (0.15 + p * 0.3).toFixed(3);
      const edge = ((1 - p) * 50).toFixed(2);
      name.style.clipPath = `inset(-30% ${edge}% -30% ${edge}%)`;
      if (counterRef.current) counterRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
    };

    const exit = () => {
      if (exiting) return;
      exiting = true;
      cancelAnimationFrame(raf);
      paint(1);
      name.style.clipPath = "none";
      const landing = canLand() && heroLine ? heroLine.getBoundingClientRect() : null;

      tl = gsap.timeline({
        onComplete: () => {
          window.removeEventListener("resize", place);
          setDismissed(true);
        },
      });
      // the filament flares, the readout steps away
      tl.to(glow, { opacity: 1, duration: 0.28, ease: "power2.out" })
        .to(meta, { opacity: 0, y: 6, duration: 0.3, ease: "power2.in" }, "<")
        .addLabel("fly", "+=0.1");
      // it draws back to a point as the name lifts off
      tl.to([filament, glow], { scaleX: 0, opacity: 0, duration: 0.6, ease: "power3.in" }, "fly");
      if (landing) {
        tl.to(name, { x: landing.left, y: landing.top, scale: 1, duration: 1.05, ease: "expo.inOut" }, "fly")
          .to(ground, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, "fly+=0.3")
          .add(() => {
            // landed: the headline takes over exactly where the name arrived
            if (wrap) {
              wrap.dataset.heroIntro = "play";
              window.setTimeout(() => delete wrap.dataset.heroIntro, 1800);
            }
            announceDone();
          }, "fly+=1.05")
          .set(name, { opacity: 0 }, "fly+=1.1");
      } else {
        tl.to(name, { opacity: 0, y: `-=${14}`, duration: 0.55, ease: "power2.in" }, "fly")
          .to(ground, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, "fly+=0.2")
          .add(() => {
            if (wrap) delete wrap.dataset.heroIntro;
            announceDone();
          }, "fly+=0.5");
      }
      if (skipped) tl.timeScale(2.4);
    };

    const tick = (now: number) => {
      const t = now - t0;
      const target = Math.min(skipped || t > MAX_MS ? 1 : readiness(), Math.min(1, t / MIN_MS));
      shown += (target - shown) * 0.12;
      if (target >= 1 && shown > 0.995) shown = 1;
      paint(shown);
      if (shown >= 1) exit();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // skip: finish the light at once and play the hand-off quickly
    const skip = () => {
      if (skipped) return;
      skipped = true;
      if (!exiting) {
        shown = 1;
        paint(1);
        exit();
      } else tl?.timeScale(2.4);
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      cancelAnimationFrame(raf);
      tl?.kill();
      window.removeEventListener("resize", place);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[10000]" aria-hidden>
      {/* the dark before the light */}
      <div ref={groundRef} className="absolute inset-0 bg-[var(--color-ground)]" />

      {/* the name, set at the headline's own size and scaled down to the centre */}
      <div
        ref={nameRef}
        className="absolute left-0 top-0 whitespace-nowrap font-[family-name:var(--font-display)] font-medium text-[var(--color-ink)] will-change-transform"
        style={{ clipPath: "inset(-30% 50% -30% 50%)" }}
      >
        {site.name}
      </div>

      {/* the filament: a hairline track, the lit wire, and its soft glow */}
      <div ref={trackRef} className="absolute h-px">
        <div className="absolute inset-0 bg-[var(--color-line)]" />
        {/* on a light ground an ink glow reads as a shadow, so it stays faint there */}
        <div className="pl-glow absolute inset-0">
          <div
            ref={glowRef}
            className="absolute inset-x-0 -top-[3px] h-[7px] origin-center rounded-full bg-[var(--color-ink)] opacity-0 blur-[6px]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <div
          ref={filamentRef}
          className="absolute inset-0 origin-center bg-[var(--color-ink)]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* a quiet readout: where, and how far along */}
      <div
        ref={metaRef}
        className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-6 sm:px-10"
      >
        <span className="eyebrow">{site.location}</span>
        <span
          ref={counterRef}
          className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.2em] text-[var(--color-faint)] [font-variant-numeric:tabular-nums]"
        >
          000
        </span>
      </div>
    </div>
  );
}
