"use client";

import { useEffect, useRef } from "react";

/**
 * A bespoke monochrome radar graphic used where a project has no live site.
 * Expanding sonar pings, a rotating sweep, and responder blips that light up as
 * the sweep passes them. Theme-aware, pauses off-screen, and renders a single
 * static frame under reduced motion.
 */
export default function PlaceholderGraphic({ caption }: { caption?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let ink = "#f2eee4";
    let ground = "#0f0e0c";
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      ink = cs.getPropertyValue("--color-ink").trim() || ink;
      ground = cs.getPropertyValue("--color-ground").trim() || ground;
    };
    readTheme();
    const mo = new MutationObserver(readTheme);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let w = 0;
    let h = 0;
    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // fixed responder positions (angle in rad, radius fraction)
    const blips = [
      { a: -1.9, r: 0.62 },
      { a: 0.5, r: 0.78 },
      { a: 2.4, r: 0.5 },
      { a: 1.35, r: 0.86 },
      { a: -0.7, r: 0.9 },
    ];

    const hex = (c: string, alpha: number) => {
      const m = c.replace("#", "");
      const r = parseInt(m.slice(0, 2), 16);
      const g = parseInt(m.slice(2, 4), 16);
      const b = parseInt(m.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const draw = (t: number) => {
      const cx = w / 2;
      const cy = h * 0.52;
      const maxR = Math.min(w, h) * 0.62;

      ctx.clearRect(0, 0, w, h);

      // faint dotted grid
      const step = 26;
      for (let x = (cx % step); x < w; x += step) {
        for (let y = (cy % step); y < h; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 0.9, 0, Math.PI * 2);
          ctx.fillStyle = hex(ink, 0.05);
          ctx.fill();
        }
      }

      // concentric range rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = hex(ink, 0.08);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // crosshair
      ctx.strokeStyle = hex(ink, 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // expanding pings
      for (let i = 0; i < 3; i++) {
        const phase = ((t * 0.12 + i / 3) % 1);
        const r = phase * maxR;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = hex(ink, (1 - phase) * 0.22);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // rotating sweep
      const sweep = reduce ? -0.6 : t * 0.9;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweep);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR);
      grad.addColorStop(0, hex(ink, 0.18));
      grad.addColorStop(1, hex(ink, 0));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, -0.5, 0);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      // leading edge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = hex(ink, 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // responder blips, brightening as the sweep passes
      const sweepAngle = ((sweep % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      for (const b of blips) {
        const ba = ((b.a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let diff = Math.abs(sweepAngle - ba);
        diff = Math.min(diff, Math.PI * 2 - diff);
        const glow = reduce ? 0.7 : Math.max(0, 1 - diff / 0.9);
        const bx = cx + Math.cos(b.a) * b.r * maxR;
        const by = cy + Math.sin(b.a) * b.r * maxR;
        ctx.beginPath();
        ctx.arc(bx, by, 2.4 + glow * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hex(ink, 0.2 + glow * 0.7);
        ctx.fill();
        if (glow > 0.05) {
          ctx.beginPath();
          ctx.arc(bx, by, 6 + glow * 8, 0, Math.PI * 2);
          ctx.strokeStyle = hex(ink, glow * 0.35);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // center node
      ctx.beginPath();
      ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = hex(ink, 0.9);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = hex(ink, 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    let raf = 0;
    let running = true;
    const start = performance.now();
    const loop = (now: number) => {
      if (!running) return;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
      const io = new IntersectionObserver(
        ([e]) => {
          const was = running;
          running = e.isIntersecting;
          if (running && !was) raf = requestAnimationFrame(loop);
        },
        { threshold: 0 },
      );
      io.observe(host);
      return () => {
        running = false;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        mo.disconnect();
      };
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <figure className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div ref={hostRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      {caption && (
        <figcaption className="eyebrow pointer-events-none absolute bottom-4 left-4 text-[var(--color-faint)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
