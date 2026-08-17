# Design

Visual system for the Temiye Akinyemi portfolio. See `PRODUCT.md` for strategy.

## Overview

A warm-monochrome, editorial portfolio with an enigmatic, "withhold then reward" personality. One signature moment per surface; loudness comes from motion, type, and contrast, not color. Dark is the default world; light is a true second theme. Foundation: Next.js 16 (App Router, React 19), Tailwind CSS v4, TypeScript.

## Theme

Two themes, toggled and remembered (`data-theme` on `<html>`, set pre-paint by an inline script to avoid flash). Dark default. Chosen for a nocturnal, cinematic first impression that the cursor-reactive hero depends on; light is a warm "daylight" counterpart. Tokens are Tailwind v4 `@theme` custom properties; only values swap between themes.

## Color

Warm-biased monochrome: warm near-black, warm cream, warm greys. **No chromatic accent** (`--color-accent` is intentionally the ink). Emphasis is the italic Fraunces receding to muted, plus black/cream contrast and underlines. Semantic color (`--color-hazard`) is separate and used only for meaning.

| Token | Dark | Light |
|---|---|---|
| `--color-ground` | `#0F0E0C` | `#F3EFE6` |
| `--color-surface` | `#161410` | `#FBF9F3` |
| `--color-surface-2` | `#1E1B15` | `#EAE3D6` |
| `--color-ink` | `#F2EEE4` | `#1B1813` |
| `--color-muted` | `#A69F92` | `#5B5548` |
| `--color-faint` | `#857E70` | `#7A7466` |
| `--color-line` | `rgba(240,236,228,.10)` | `rgba(28,24,18,.12)` |
| `--color-line-strong` | `rgba(240,236,228,.20)` | `rgba(28,24,18,.22)` |
| `--color-accent` (= ink) | `#F2EEE4` | `#1B1813` |

Contrast targets WCAG AA in both themes.

## Typography

Encodes artist × engineer through contrast. Self-hosted via `next/font`, ≤3 families.

- **Display / headings:** Fraunces (variable serif). Editorial, with an italic used as the signature emphasis device (`withhold,` / `software engineer.` / `looks and feels`).
- **Body / UI:** Geist Sans.
- **Data / labels:** Geist Mono, for genuine measurement only (telemetry HUD, counters, tabular figures), not as a "technical" costume.

Scale is fluid (`clamp`). Display heading max 7rem; tracking floor about `-0.035em`; headings `text-wrap: balance`. Small labels use the `.eyebrow` utility (sans, uppercase, letter-spaced, muted).

## Motion

Shared easing tokens in `@theme`: `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)`, `--ease-in-out-quart: cubic-bezier(0.76,0,0.24,1)`. Libraries: Motion (`motion/react`), GSAP (available), Lenis (smooth scroll wired to anchors), OGL (hero shader), React Three Fiber (one 3D artifact). Signature moments: preloader → hero handoff, the cursor **lens** that wipes the fog off the headline, the 2D/3D **orbiting plane**, and shared-element **View Transitions** between work and case pages. Reveals are opacity/mask on scroll; every effect has a reduced-motion path.

## Components

- **Nav:** floating console (contained capsules), a spring indicator that tracks the active section, icons that reveal on active/hover, mobile overlay menu.
- **Sections:** Hero (shader + lens), Selected Work (stacked rows → case pages), About (portrait + statement + spec), Capabilities (disciplines with draw-in hairlines + toolkit brand-mark grid), Experience (timeline), Contact.
- **Primitives:** `Reveal`, `MaskText`, `DrawLine`, `Magnetic`, `Cursor`, `Portrait`, `LocalTime`, `TelemetryHUD`, `ThemeToggle`, `Mode2D3DToggle`.
- **Icons:** Hugeicons for UI, Simple Icons for brand marks (rendered monochrome), authored SVG where needed. No unicode glyphs as icons.

## Layout

Centered content at `max-w-[1360px]`, case pages at `1100px`. Fixed nav (floating, stays flat while content orbits in 3D). Hairlines and generous whitespace over boxed cards; cards used only where they are the best affordance (portrait, toolkit panel). Fully responsive with mobile fallbacks for pointer-only effects.

## Accessibility

`prefers-reduced-motion` honored everywhere; pointer effects gated behind `(hover: hover) and (pointer: fine)`; visible focus; skip link; meaningful alt text; AA contrast in both themes.
