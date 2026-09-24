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

- **Display / headings:** Fraunces (variable serif, `opsz` + `SOFT` + `WONK` axes loaded). Optical size follows the rendered size (`font-optical-sizing: auto`), so display headlines get the high-contrast cut and small titles the sturdier text cut. Editorial, with an italic used as the signature emphasis device (`software engineer.` / `looks and feels` / `something rare.`).
- **Body / UI:** Geist Sans.
- **Data / labels:** Geist Mono, for genuine measurement only (telemetry HUD, counters, tabular figures), not as a "technical" costume.

Scale is fluid (`clamp`). Display heading max 7rem; tracking floor about `-0.035em`; headings `text-wrap: balance`, body `text-wrap: pretty`. Small labels use the `.eyebrow` utility (sans, uppercase, letter-spaced, muted) for metadata only, never as a kicker above a heading: headings speak for themselves.

## Motion

Shared easing tokens in `@theme`: `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)`, `--ease-in-out-quart: cubic-bezier(0.76,0,0.24,1)`. Libraries: Motion (`motion/react`), GSAP (available), Lenis (smooth scroll wired to anchors), OGL (hero shader), React Three Fiber (one 3D artifact). The home page's one signature moment is **the Beam** (`BeamField`, WebGL via OGL), the world's founding line made literal: a gallery under warm light. A single shaft of tungsten light falls through a dark room from beyond the top-left; haze drifts in it; dust motes glitter only when they drift into the light (pin-sharp far away, soft bokeh up close). The name stands in the beam as crisp native type, never covered: where the light rakes across it the letters warm and glint (a transparent layer drawn exactly over the letters), and their shapes cast soft volumetric shadow shafts back into the haze. The page opens on the preloader: in darkness a single filament warms under the name, filling with the page's real readiness and bringing the letters up from the centre; then it flares and draws back to a point as the name flies to its exact place in the headline. On landing the light strikes with a tungsten flicker, the comma and second line rise into it, the camera dollies in and the beam sweeps across the name. The pointer is the gaffer's hand (the beam swings toward it, the air and dust part around it); scrolling cranes the camera up through the motes. Light theme is a sunbeam in a bright room. Everything else is quiet craft in service of it: the Selected Work preview hangs from the pointer and swings with its momentum, wiping between projects in the direction you travel; the hovered preview then flies into the case page's frame through a shared View Transition (`shot-<slug>`), alongside the title morph (`title-<slug>`); the manifesto's words come into focus (blur and ink) as you scroll. The 2D/3D orbiting plane remains. Reveals are opacity/mask on scroll; every effect has a reduced-motion path (the Beam never mounts; the room and its fall of light are a still CSS gradient).

## Components

- **Nav:** one quiet instrument on a three-column grid. Left, the wordmark is handed up from the hero: only "T." while the hero headline is on screen, unfurling to "Temiye Akinyemi." once it scrolls away. Centre, the index set in Fraunces, the current section leaning into italic (roman and italic crossfade in one grid cell, so no word moves), over a hairline reading rail whose per-section segments fill with ink as you read. Right, a single enamel control deck (solid, no backdrop blur, no animated shadow) holding the ⌘K / Ctrl+K command menu and four switches with authored morphing glyphs: eclipse (theme), lifting layers (3D), page to bento (dashboard), speaker (sound), a running dot for what's on, a delayed tooltip for each. Theme changes spill from the pressed switch as a View Transition circle. Below `lg`, a menu opens on a six-slat curtain with the index set large and every control labelled.
- **Sections:** Hero (the Beam: a lit room, the name standing in the light), Selected Work (stacked rows → case pages), About (portrait + statement + spec), Capabilities (disciplines with draw-in hairlines + toolkit brand-mark grid), Experience (timeline, the current role marked), Contact (address with open and copy actions).
- **Primitives:** `Reveal`, `MaskText`, `DrawLine`, `Magnetic`, `Cursor`, `Portrait`, `LocalTime`, `EmailLink`, `TelemetryHUD`, and the nav set in `components/nav/` (`Wordmark`, `NavIndex`, `ControlDeck` + switches, `Glyphs`, `CommandPalette`, `MobileMenu`).
- **Icons:** Hugeicons for UI, Simple Icons for brand marks (rendered monochrome), authored SVG where needed. No unicode glyphs as icons.

## Layout

Centered content at `max-w-[1360px]`, case pages at `1100px`. Fixed nav (floating, stays flat while content orbits in 3D) over a soft ground-coloured top scrim, so scrolled content fades out before it meets it. Hairlines and generous whitespace over boxed cards; cards used only where they are the best affordance (portrait, toolkit panel). Fully responsive with mobile fallbacks for pointer-only effects.

## Accessibility

`prefers-reduced-motion` honored everywhere; pointer effects gated behind `(hover: hover) and (pointer: fine)`; visible focus; skip link; meaningful alt text; AA contrast in both themes.
