"use client";

import { useId } from "react";

/**
 * Authored state glyphs for the control deck. Each is one drawing with two
 * states, and the change between them is the feedback: nothing swaps, it
 * morphs. Drawn on a 24 grid at a 1.5 stroke to sit with Hugeicons, animated on
 * transform / stroke-dash only (compositor-cheap), styled in globals.css under
 * `.glyph-*`. Reduced motion collapses every transition to instant.
 */

/** Eclipse: the moon's shadow slides over the sun; rays fold away at night. */
export function ThemeGlyph({ dark }: { dark: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="glyph-theme" data-dark={dark}>
      <defs>
        <mask id={`ecl-${id}`}>
          <rect width="24" height="24" fill="white" />
          <circle className="glyph-theme-shadow" cx="16.4" cy="8.4" r="4.9" fill="black" />
        </mask>
      </defs>
      <circle className="glyph-theme-disc" cx="12" cy="12" r="5.1" fill="currentColor" mask={`url(#ecl-${id})`} />
      <g className="glyph-theme-rays" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          const c = Math.cos(a);
          const s = Math.sin(a);
          return <line key={i} x1={12 + c * 7.6} y1={12 + s * 7.6} x2={12 + c * 9.6} y2={12 + s * 9.6} />;
        })}
      </g>
    </svg>
  );
}

/** Layers: one flat plane in 2D; in 3D it splits and lifts into perspective. */
export function DepthGlyph({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="glyph-depth" data-on={on}>
      <span className="glyph-depth-stage">
        <span className="glyph-depth-plane glyph-depth-back" />
        <span className="glyph-depth-plane glyph-depth-front" />
      </span>
    </span>
  );
}

/** Page ↔ bento: four strokes read as a page's lines, then regroup as tiles. */
export function LayoutGlyph({ dashboard }: { dashboard: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="glyph-layout" data-dash={dashboard} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect className="glyph-layout-a" x="4" y="4" width="7" height="7" rx="1.6" vectorEffect="non-scaling-stroke" />
      <rect className="glyph-layout-b" x="13" y="4" width="7" height="7" rx="1.6" vectorEffect="non-scaling-stroke" />
      <rect className="glyph-layout-c" x="4" y="13" width="7" height="7" rx="1.6" vectorEffect="non-scaling-stroke" />
      <rect className="glyph-layout-d" x="13" y="13" width="7" height="7" rx="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Speaker: waves draw out when sound is on; a small cross draws in when off. */
export function SoundGlyph({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="glyph-sound" data-on={on} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9.6h3.2l4.3-3.6v12l-4.3-3.6H3.5z" />
      <path className="glyph-sound-wave" pathLength={1} d="M14.6 9.4a3.8 3.8 0 0 1 0 5.2" />
      <path className="glyph-sound-wave glyph-sound-wave-2" pathLength={1} d="M17.3 6.9a7.4 7.4 0 0 1 0 10.2" />
      <path className="glyph-sound-x" pathLength={1} d="M15.2 9.8l4.4 4.4" />
      <path className="glyph-sound-x glyph-sound-x-2" pathLength={1} d="M19.6 9.8l-4.4 4.4" />
    </svg>
  );
}

/** Search lens for the command menu trigger. */
export function LensGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M14.6 14.6 19 19" />
    </svg>
  );
}
