# Portfolio — Design System & Build Plan

**Owner:** Temiye Akinyemi — Frontend Engineer (4+ yrs), immersive/interactive interfaces
**Direction:** `OBSIDIAN + KINETIC` hybrid (see the [design dossier](https://claude.ai/code/artifact/f4a4dff7-241b-455e-84c4-9bdb79ba8dca))
**Foundation:** Next.js 16 · React 19 · Tailwind v4 · TypeScript
**Content mode:** design-first — realistic placeholders now, real work swapped in later.

---

## 1. The concept in one sentence

> The site withholds, then rewards — near-darkness that reveals itself to your cursor (OBSIDIAN), a body that thinks in kinetic, velocity-reactive type (KINETIC), and exactly one touchable 3D artifact held in reserve for a single project page.

The medium is the proof: every interaction is a live sample of the engineer's hand. Spectacle is spent **once, deliberately**.

---

## 2. Color tokens

Blue-ink near-black ground, cool off-white text, a single warm **sodium-amber** signal (warm light in a cool dark — the "lamp in fog" of the enigma). Semantic colors are separate from the accent.

### Dark (primary identity)
| Token | Value | Use |
|---|---|---|
| `--ground` | `#0B0C12` | page background (blue-biased near-black) |
| `--surface` | `#101219` | raised panels / cards |
| `--surface-2` | `#161923` | inset / secondary panels |
| `--line` | `rgba(233,233,241,0.09)` | hairlines |
| `--line-strong` | `rgba(233,233,241,0.16)` | emphasized dividers |
| `--text` | `#E9E9F1` | primary text (cool off-white) |
| `--muted` | `#9A9AAE` | secondary text (grey-lavender) |
| `--faint` | `#63647A` | labels, meta |
| `--accent` | `#E6A251` | THE signal — one accent only |
| `--accent-soft` | `rgba(230,162,81,0.13)` | accent washes |
| `--hazard` | `#C96B5E` | semantic warning only, never decorative |

### Light ("daylight blueprint" — deliberate, not an inversion)
`--ground #EBEDF2` · `--surface #FFFFFF` · `--surface-2 #F4F6FA` · `--text #15161E` · `--muted #52566A` · `--faint #888CA0` · `--accent #A75E17` (deepened for contrast on light).

**Rule:** loudness comes from motion and type, never from adding colors.

---

## 3. Typography

Encodes **artist × engineer** through contrast: an editorial variable **serif** against a technical **mono**, with a neutral sans for reading. All self-hosted via `next/font` (no layout shift, no CDN).

| Role | Face | Why | Notes |
|---|---|---|---|
| Display / kinetic | **Fraunces** (variable) | editorial, luxe, `opsz`/`SOFT`/`wght` axes make it ideal for velocity-reactive kinetic type; not the overused Playfair/Space Grotesk | animate `font-variation-settings` |
| Body / UI | **Geist Sans** | quiet, modern neutral; stays out of the way | |
| Labels / data / eyebrows | **Geist Mono** | the "signal/technical" voice — uppercase, letter-spaced | `tabular-nums` for figures |

Type scale (fluid, `clamp`): display `clamp(40px, 8vw, 96px)` · h2 `clamp(26px, 4.4vw, 44px)` · lead `20px` · body `17px` · label `11–12px / 0.2em tracking / uppercase`. Headings `text-wrap: balance`; body `text-wrap: pretty`; reading measure ~65–74ch.

> Fonts are easy to swap — if Fraunces reads too "luxe," candidates are Instrument Serif (lighter) or Bricolage Grotesque (grotesk kinetic).

---

## 4. Motion tokens (shared by CSS + GSAP/Motion via Tailwind `@theme`)

| Token | Value | Use |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | reveals — fast start, long settle (the "senior" curve) |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | transitions |
| `--dur-fast` | `0.4s` | micro-interactions |
| `--dur-base` | `0.8s` | reveals |
| `--dur-slow` | `1.2s` | scene / hero |
| stagger | `0.03–0.06s` | grouped reveals |

Spring defaults (Motion): `stiffness 260, damping 30` for cursor/magnetic. **Never** linear/default ease.

---

## 5. Motion doctrine (non-negotiable)

- **`prefers-reduced-motion`** on everything: disable Lenis, kill parallax/scrub/shader animation, show static posters, keep only opacity fades. `gsap.matchMedia()` is the pattern.
- **`(hover: hover) and (pointer: fine)`** gates cursor, magnetic, hover-distortion. Full functionality without hover (touch/keyboard).
- Animate only `transform` / `opacity` / `filter`. Hold 60fps. Protect LCP (hero image `priority`, shaders compile after paint), INP, CLS (`document.fonts.ready` before split-text).
- Client-only animation libs sit behind tight `"use client"` boundaries kept low in the tree; canvases `dynamic(..., { ssr: false })`.

---

## 6. Stack (version-verified, Aug 2026)

| Layer | Tool | Status |
|---|---|---|
| Smooth scroll | `lenis` 1.3 (`lenis/react`) | Phase 0 |
| Choreography | `gsap` 3.13 + ScrollTrigger + SplitText (`@gsap/react` `useGSAP`) | Phase 0 (all free now) |
| Interaction | `motion` 13 (`motion/react`) | Phase 0 |
| Route transitions | Next 16 View Transitions (`experimental.viewTransition`) | Phase 4 |
| Signature 3D | `ogl` (hero shader) · `@react-three/fiber` 9 + `drei` 10 (the one Artifact) | Phase 2 / Phase 4 |

Wire Lenis to GSAP's single ticker (`gsap.ticker.add(t => lenis.raf(t*1000))`, `lenis.on('scroll', ScrollTrigger.update)`) so nothing double-smooths.

---

## 7. Information architecture

1. **Preloader → hero handoff** — counter/masked reveal that hands off into the first frame (no white flash).
2. **Hero (OBSIDIAN)** — near-darkness; cursor-driven fog/displacement shader reveals name + cryptic line; nav surfaces "beneath the surface."
3. **Selected Work** — large stacked rows, hover-revealed preview, index numbering (a real sequence). One row's case page carries the **Artifact** 3D moment.
4. **About (KINETIC)** — velocity-reactive variable type; masked word-by-word reveals.
5. **Craft / Approach** — the discipline (perf, a11y, motion) stated as a differentiator.
6. **Contact** — magnetic CTA, state-aware cursor, footer.
- **Global:** Lenis, state-aware custom cursor, View Transitions between index ↔ case, reduced-motion + touch fallbacks throughout.

---

## 8. Build roadmap

- **Phase 0 — Foundation** ✅: stack installed; `next/font` (Fraunces/Geist/Geist Mono); Tailwind v4 `@theme` color + motion tokens; globals + reset; Lenis provider wired to GSAP ticker; reduced-motion/hover gates; layout shell; state-aware cursor.
- **Phase 1 — Skeleton** ✅: Hero, Selected Work, About, Craft, Contact with placeholder content; `MaskText` + `Reveal` scroll-reveal system; condensing `Nav`; type scale live.
- **Phase 2 — Signature hero** ✅: OBSIDIAN cursor-reactive OGL shader field (`ShaderField`/`HeroBackdrop`) + preloader→hero handoff (`Preloader`, scramble-resolve, once-per-session, skippable).
- **Phase 3 — Kinetic body** ✅: `KineticBand` — velocity-reactive marquee (Fraunces `wght` + skew bend to scroll velocity).
- **Phase 4 — Work + case** ✅: `/work/[slug]` case pages (SSG); shared-element `view-transition-name` on titles + opacity route `template`; one R3F Artifact (obsidian shard, drag-to-spin) on the signature case.
- **Phase 5 — Polish** ✅: `Magnetic` CTAs; skip link; SEO/OG metadata; reduced-motion + `(hover:hover)` gates throughout; shader pauses off-view; R3F/canvas lazy + dpr-clamped.

**Remaining / future:** swap placeholder content for real work; optional native View Transitions shared-element morph once Next 16 exposes a stable flag; OG image; Core Web Vitals field measurement.
