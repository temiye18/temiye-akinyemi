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

Shared easing tokens in `@theme`: `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)`, `--ease-in-out-quart: cubic-bezier(0.76,0,0.24,1)`. Libraries: Motion (`motion/react`), GSAP (available), Lenis (smooth scroll wired to anchors), OGL (hero shader), React Three Fiber (one 3D artifact). The home page's one signature moment is **the Beam** (`BeamField`, WebGL via OGL), the world's founding line made literal: a gallery under warm light. A single shaft of tungsten light falls through a dark room from beyond the top-left; haze drifts in it; dust motes glitter only when they drift into the light (pin-sharp far away, soft bokeh up close). The name stands in the beam as crisp native type, never covered: where the light rakes across it the letters warm and glint (a transparent layer drawn exactly over the letters), and their shapes cast soft volumetric shadow shafts back into the haze. The page opens on the preloader: in darkness a single filament warms under the name, filling with the page's real readiness and bringing the letters up from the centre; then it flares and draws back to a point as the name flies to its exact place in the headline. On landing the light strikes with a tungsten flicker, the comma and second line rise into it, the camera dollies in and the beam sweeps across the name. The pointer is the gaffer's hand (the beam swings toward it, the air and dust part around it); scrolling cranes the camera up through the motes. Light theme is a sunbeam in a bright room. Everything else is quiet craft in service of it: the Selected Work preview hangs from the pointer and swings with its momentum, wiping between projects in the direction you travel; the hovered preview then flies into the case page's frame through a shared View Transition (`shot-<slug>`), alongside the title morph (`title-<slug>`); the manifesto's words come into focus (blur and ink) as you scroll. The 2D/3D orbiting plane remains. The dashboard is its own surface with its own single moment, **the sliding house** (after the Rietveld Schröder house, in this world's monochrome). It is one room partitioned by planes. A fixed wall holds the portrait, the name ("software *engineer.*"), status and local time, and a live plan of the room. Five panels hang on one track: Work, About, Capabilities, Experience, Contact. Each panel's leading edge is a spine carrying its key (1 to 5), its name set vertically in Fraunces (leaning italic when open) and a real count. Open one and the panels between glide across one after another like a train, with an ink bar marking the edge that is moving. You can drag a panel by its spine, flick a trackpad sideways, press 1 to 5 or the arrows, or click the plan. A closed panel gives a little when you reach for its edge. Inside Work, the selection is a plane too: a surface-2 plane slides behind the list while the detail planes slide on a vertical track, each carrying the live screenshot that flies into the case page. The planes are tonal (surface, surface-2) and joined by hairline joints, with square corners throughout. Contact is the one solid plane, set in the other theme's tokens (`.plane-inverse`). Buttons are planes with an ink end-cap, and on hover the ink slides across from the cap. On phones the panels become sheets you swipe, with a rail of spines above them. Reveals are opacity/mask on scroll; every effect has a reduced-motion path (the Beam never mounts; the room and its fall of light are a still CSS gradient).

## Components

- **Nav:** one quiet instrument on a three-column grid. Left, the wordmark is handed up from the hero: only "T." while the hero headline is on screen, unfurling to "Temiye Akinyemi." once it scrolls away. Centre, the index set in Fraunces, the current section leaning into italic (roman and italic crossfade in one grid cell, so no word moves), over a hairline reading rail whose per-section segments fill with ink as you read. Right, a single enamel control deck (solid, no backdrop blur, no animated shadow) holding the ⌘K / Ctrl+K command menu and four switches with authored morphing glyphs: eclipse (theme), lifting layers (3D), page to bento (dashboard), speaker (sound), a running dot for what's on, a delayed tooltip for each. Theme changes spill from the pressed switch as a View Transition circle. Below `lg`, a menu opens on a six-slat curtain with the index set large and every control labelled.
- **Sections:** Hero (the Beam: a lit room, the name standing in the light), Selected Work (stacked rows → case pages), About (a gallery wall: the statement as wall text, the portrait hung as a framed print that the gallery light comes up on as it scrolls in, lit from the Beam's side, and beside it a museum wall label with the name, the facts and live status; it enters once, in the order you walk up to a wall: the wall text rises line by line from its masks, the print settles and its cover rolls up like a blind, the reading follows, then the label goes up, its rules drawing across and its rows arriving one by one), Capabilities (a working index: the six disciplines as a ledger beside the toolkit; point at a discipline and it leans italic while the tools its own copy names come up and the rest recede, or point at a tool to light the disciplines that use it; marks in the house ink, never brand colour; receding is pointer-only, so touch keeps the ledger fully readable with each row's marks carrying the link), Experience (timeline, the current role marked), Contact (address with open and copy actions).
- **Primitives:** `Reveal`, `MaskText`, `DrawLine`, `Magnetic`, `Cursor`, `Portrait`, `LocalTime`, `EmailLink`, `TelemetryHUD`, and the nav set in `components/nav/` (`Wordmark`, `NavIndex`, `ControlDeck` + switches, `Glyphs`, `CommandPalette`, `MobileMenu`).
- **Icons:** Hugeicons for UI, Simple Icons for brand marks (rendered monochrome), authored SVG where needed. No unicode glyphs as icons.

## Layout

Centered content at `max-w-[1360px]`, case pages at `1100px`. Fixed nav (floating, stays flat while content orbits in 3D) over a soft ground-coloured top scrim, so scrolled content fades out before it meets it. Hairlines and generous whitespace over boxed cards; cards used only where they are the best affordance (portrait, toolkit panel). Fully responsive with mobile fallbacks for pointer-only effects.

## Accessibility

`prefers-reduced-motion` honored everywhere; pointer effects gated behind `(hover: hover) and (pointer: fine)`; visible focus; skip link; meaningful alt text; AA contrast in both themes.
