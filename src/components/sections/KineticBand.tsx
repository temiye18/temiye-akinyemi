"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from "motion/react";

const PHRASE = ["Immersive", "Interactive", "Enigmatic", "Engineered"];

/** wrap a value into [min, max) */
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * KINETIC — a marquee whose speed and direction bend to scroll velocity, its
 * letterforms thickening (Fraunces `wght`) and skewing as you scroll faster,
 * settling crisp at rest. Reduced-motion gets a plain static band.
 */
export default function KineticBand() {
  const reduce = useReducedMotion();

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smooth, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const weight = useTransform(smooth, (v) =>
    Math.round(340 + Math.min(Math.abs(v) / 1400, 1) * 480),
  );
  const skew = useTransform(smooth, [-2000, 0, 2000], [-9, 0, 9], {
    clamp: true,
  });

  const direction = useRef(-1);
  useAnimationFrame((_, delta) => {
    let moveBy = direction.current * 3 * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    moveBy += direction.current * moveBy * vf;
    baseX.set(baseX.get() + moveBy);
  });

  if (reduce) {
    return (
      <section
        aria-hidden
        className="overflow-hidden border-y border-[var(--color-line)] py-10"
      >
        <div className="flex justify-center gap-10 font-[family-name:var(--font-display)] text-[clamp(2rem,7vw,6rem)] italic text-[var(--color-faint)]">
          {PHRASE.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Immersive, interactive, enigmatic, engineered"
      className="overflow-hidden border-y border-[var(--color-line)] py-10"
    >
      <motion.div
        style={{ x, skewX: skew, fontWeight: weight }}
        className="flex whitespace-nowrap font-[family-name:var(--font-display)] text-[clamp(2.5rem,9vw,8rem)] italic leading-none text-[var(--color-ink)] will-change-transform"
      >
        {[0, 1].map((block) => (
          <span key={block} className="flex" aria-hidden>
            {PHRASE.map((w, i) => (
              <span key={`${block}-${w}`} className="flex items-center">
                <span className="px-8">{w}</span>
                {i < PHRASE.length - 1 && (
                  <span className="text-[var(--color-accent)]">✦</span>
                )}
                {i === PHRASE.length - 1 && (
                  <span className="text-[var(--color-accent)]">✦</span>
                )}
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
