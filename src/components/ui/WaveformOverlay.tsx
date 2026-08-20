"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { ambientState } from "@/lib/ambientState";

// The visualizer is for genuine idleness (settled in to listen, or stepped
// away), not merely "not scrolling" — reading is not scrolling but still
// engaged, so pointer movement counts as activity and the wait is long enough
// that a reading pause never triggers it. Any of these events also dismiss it.
const IDLE_MS = 60000;
const ACTIVITY = [
  "scroll",
  "wheel",
  "touchstart",
  "keydown",
  "pointerdown",
  "pointermove",
];

// three slow flow-lines that weave for depth. `s` is per-ms drift speed (small =
// tranquil); amplitude breathes from `base` up to `base + react` with the music.
const LINES = [
  { f: 0.0041, s: 0.0002, p: 0.4, base: 0.1, react: 0.55, alpha: 0.14, glow: 5 },
  { f: 0.0029, s: 0.00013, p: 2.3, base: 0.17, react: 0.85, alpha: 0.5, glow: 9 },
  { f: 0.0022, s: -0.0001, p: 4.6, base: 0.08, react: 0.45, alpha: 0.11, glow: 5 },
];

function parseRGB(c: string): [number, number, number] {
  const s = c.trim();
  if (s.startsWith("#")) {
    const hex =
      s.length === 4
        ? s
            .slice(1)
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : s.slice(1);
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  return [242, 238, 228];
}

/**
 * When sound is playing and the visitor stops interacting, the page recedes
 * behind a soft veil and the music becomes a calm surface: slow flow-lines that
 * weave and breathe around a small emblem, dissolving into the dark at both
 * edges. Any scroll or input brings the page back. Purely decorative
 * (pointer-events-none, aria-hidden), skipped under reduced motion.
 */
export default function WaveformOverlay() {
  const reduce = useReducedMotion();
  const playing = useSyncExternalStore(
    ambientState.subscribe,
    () => ambientState.getSnapshot().playing,
    () => false,
  );
  const [idle, setIdle] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const shown = idle && playing && !reduce;

  useEffect(() => {
    if (!playing || reduce) return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    const onActivity = () => {
      setIdle(false);
      arm();
    };
    const initial = requestAnimationFrame(onActivity);
    for (const evt of ACTIVITY)
      window.addEventListener(evt, onActivity, { passive: true });
    return () => {
      cancelAnimationFrame(initial);
      window.clearTimeout(timer);
      for (const evt of ACTIVITY) window.removeEventListener(evt, onActivity);
    };
  }, [playing, reduce]);

  useEffect(() => {
    if (!shown) return;
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    const root = getComputedStyle(document.documentElement);
    const [ir, ig, ib] = parseRGB(root.getPropertyValue("--color-ink"));
    const ink = (a: number) => `rgba(${ir},${ig},${ib},${a})`;

    const analyser = ambientState.getSnapshot().analyser;
    const freq = new Uint8Array(analyser ? analyser.frequencyBinCount : 1024);
    let level = 0.15;
    let t = 0;
    let last = performance.now();

    let raf = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const now = performance.now();
      t += Math.min(64, now - last);
      last = now;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const cy = h / 2;
      const maxAmp = Math.min(140, h * 0.14);
      g.clearRect(0, 0, w, h);

      // gentle breathing energy from the music (heavily smoothed)
      const a = ambientState.getSnapshot().analyser;
      let target = 0.14;
      if (a) {
        a.getByteFrequencyData(freq);
        let sum = 0;
        for (let i = 2; i < 90; i++) sum += freq[i];
        target = Math.min(1, (sum / (88 * 255)) * 1.5);
      }
      level += (target - level) * 0.05;

      g.lineCap = "round";
      g.lineJoin = "round";
      const step = 5;
      for (const L of LINES) {
        const amp = (L.base + level * L.react) * maxAmp;
        g.beginPath();
        for (let x = 0; x <= w; x += step) {
          const s =
            Math.sin(x * L.f + t * L.s + L.p) +
            0.3 * Math.sin(x * L.f * 1.7 - t * L.s * 1.3 + L.p);
          const y = cy + (s / 1.3) * amp;
          if (x === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.strokeStyle = ink(L.alpha * 0.4);
        g.lineWidth = L.glow;
        g.stroke();
        g.strokeStyle = ink(L.alpha);
        g.lineWidth = 1.6;
        g.stroke();
      }

      // dissolve at the far edges
      g.globalCompositeOperation = "destination-in";
      const mask = g.createLinearGradient(0, 0, w, 0);
      mask.addColorStop(0, "rgba(0,0,0,0)");
      mask.addColorStop(0.1, "rgba(0,0,0,1)");
      mask.addColorStop(0.9, "rgba(0,0,0,1)");
      mask.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = mask;
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [shown]);

  if (reduce) return null;

  return (
    <div
      aria-hidden
      data-shown={shown ? "true" : "false"}
      className="pointer-events-none fixed inset-0 z-40 opacity-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] data-[shown=true]:opacity-100"
    >
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-ground)_58%,transparent)] backdrop-blur-[3px]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <p className="eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[76px] whitespace-nowrap text-[var(--color-faint)]">
        Scroll or click to explore
      </p>
    </div>
  );
}
