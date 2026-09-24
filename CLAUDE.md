# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

**Use pnpm, never npm.** npm's strict peer resolution fails on this React 19 project (optional peers like `@remix-run/react` still pin React 18 → ERESOLVE); pnpm installs cleanly.

- `pnpm dev` — dev server (Turbopack) on http://localhost:3000
- `pnpm build` — production build (also runs the type-check)
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint (flat config, `eslint-config-next`)

There is **no test suite**. The verification loop after any change is: `npx tsc --noEmit`, then `pnpm lint`, then `pnpm build`. For motion/3D or generated-image work, spin up a server and inspect the real output (e.g. `curl localhost:3000/opengraph-image`); frame-timing regressions are checked with **headed** Playwright (headless throttles rAF).

## Architecture

A single-surface portfolio. Two indexable route patterns: `/` (one long page) and `/work/[slug]` (4 statically-generated case studies). Everything below is the cross-file wiring that isn't obvious from any single file.

- **`src/lib/content.ts` is the single source of truth** for all copy — `site`, `projects`, `about`, `capabilities`, `experience`. Sections, case-study pages, OG-image cards, `sitemap.ts`, and the JSON-LD builders all read from it. Edit content here, not in components.

- **The homepage is composed, not monolithic.** `src/app/page.tsx` stacks `src/components/sections/*` inside `<Stage>` → `<SpacePlane>`. Most sections are Server Components; only interactive ones (`SelectedWork`, `CapabilityIndex`, the `AboutChoreo` entrance) and motion wrappers are `"use client"`.

- **Fonts are wired on `<html>`, not `<body>`.** `next/font` exposes `--font-fraunces` / `--font-geist-*` via classes on the element it's applied to, and the Tailwind `@theme` tokens (`--font-display`, `--font-sans`) resolve those at `:root`. On `<body>` they are undefined at `:root`, the tokens resolve empty, and every heading silently falls back to the OS system font (this shipped unnoticed in v1). Keep the classes on `<html>`.

- **The hero is a lit shot** (`components/hero/BeamField.tsx`, OGL): a shaft of warm light through a dark room, haze, and GPU dust points, with the `<h1 data-hero-name>` standing in it as real, always-visible type. Two canvases: the room behind the DOM (a quarter-res shadow pass marching toward the light through a soft copy of the headline, the room, then the dust) and a small transparent glint canvas inside the headline's wrapper that only warms the letters where the beam falls. `paintHeadline.ts` rasterises the headline from its real layout and divides out ancestor transforms, so the glint matches the type at rest even if it paints mid-intro. The intro (strike, dolly, sweep) starts on the Preloader's `preloader:done` event. It follows `ScrollFade` via GSAP's `y`/opacity, never layout. Reduced motion never mounts it. Measured at 0 dropped frames idle, aiming and scrolling (production build).

- **The preloader hands the name to the hero** (`components/layout/Preloader.tsx`). A filament under the name fills with real readiness (fonts, eager images, window `load`; 1.3s floor, 7s ceiling) and reveals the name from the centre. The name is set at the `<h1 data-hero-name>`'s computed size and scaled down, so when it flies (GSAP `x/y/scale`) onto the headline's first line it lands pixel-identical. While it flies, the wrapper carries `data-hero-intro="pending"` (headline hidden); on landing it flips to `"play"` (the comma fades in, line two rises, CSS in `globals.css`) and `preloader:done` fires. It falls back to a plain fade when the name can't land cleanly (headline wraps, page opened scrolled, dashboard mode). A `data-preload` attribute set by the pre-paint script covers the page until the loader mounts (8s failsafe). Any click or key speeds it up. Under reduced motion it never shows. The hero intro CSS must never change `display` or add `filter`: either one resizes the h1 or rasterises a large layer at the landing moment, and that hitch shows up as dropped frames.

- **The nav lives in `components/nav/`**, composed by `components/layout/Nav.tsx`. Every preference is controlled there (desktop deck, mobile menu, and the ⌘K `CommandPalette`); there is no other toggle UI. Theme goes through `lib/theme.ts` (`setTheme`/`toggleTheme`, which runs the circular View Transition spill and pauses transitions and shared-element names during it) and sound through `lib/sound.ts` (an app-lifetime controller publishing to `ambientState`). The reading rail caches all geometry on resize; never read layout inside its scroll frame (GSAP has already written styles by then, so a read forces reflow).

- **Three orthogonal, persisted view modes**, each following the same trio: a `localStorage` key + a `data-*` attribute on `<html>` + a provider hook backed by `useSyncExternalStore`. They are: theme (`theme` → `data-theme`, light/dark), dimensionality (`view-mode` → `data-view-mode`, 2d/3d, `ThreeDMode` provider), and layout (`ui-mode` → `data-ui-mode`, site/dashboard, `UIMode` provider). A **pre-paint inline script in `layout.tsx`'s `<head>`** sets all three attributes from localStorage before first paint to avoid a flash — keep it in sync when adding a mode. Provider nesting in `layout.tsx`: `SmoothScroll` (Lenis) → `ThreeDProvider` → `UIModeProvider`.

- **Shared 3D orbit.** `src/lib/useSpaceOrbit.ts` is one rAF-driven hook used by both the site plane (`components/layout/SpacePlane`) and the dashboard house (`components/dashboard/Dashboard`) so 3D feels identical in each. Only one orbit runs at a time: the site plane rests while the dashboard is up. It is gated on `(hover: hover) and (pointer: fine)`, with reduced-motion folded into the `active` argument by the caller. `origin`/`mode` params switch between the scrolling page plane and a viewport-fit overlay.

- **Dashboard mode** (`components/dashboard/Stage.tsx`) keeps the SSR site mounted under `#site-root` (set `inert` + `aria-hidden` when the dashboard is active) and renders the `Dashboard` overlay in an `AnimatePresence`; it stops/starts Lenis on toggle. The hidden site must not keep working under it: the Beam pauses on `data-ui-mode="dashboard"` and `SpacePlane`'s orbit rests.

- **The dashboard is a sliding house** (`components/dashboard/Dashboard.tsx` owns the mechanism, `rooms.tsx` the five rooms' content). A fixed wall (photo, name, status, a live plan of the room) and five panels on one track. A single track position `t` (0..4, fractional mid-slide) drives every panel's `x` via `doorX()`, written straight to `style.transform` per frame (GSAP tweens `t`; drag, trackpad `deltaX` and keys 1 to 5 / arrows all move `t`). Desktop panels are `calc(100% - 4 * spine)` wide, and the closed ones run past the room's right edge, hidden by an opaque `.house-jamb` rather than an `overflow` clip. Below `lg` the panels become one-at-a-time sheets with a rail and swipe. Two 3D rules, both measured: no clip over moving layers inside the tilted plane, and under the tilt (`data-tilt`) the panels drop `will-change` and move on 2D transforms. Composited children inside a perspective-flattened plane each cost an offscreen GPU pass per frame. No infinite animation anywhere in the house (`.house-still` freezes the signal graphic).

- **Motion & performance discipline is load-bearing, not stylistic.** Animate only `transform`/`opacity`. Do **not** animate `box-shadow`, `mix-blend-mode`, or `backdrop-filter`, and avoid infinite CSS animations (e.g. `animate-ping`) in the dashboard — each has caused real, measured cursor jank here. Semi-transparent elements inside a rotating 3D plane need promotion (`will-change`). When in doubt, measure frames.

- **SEO/social system.** `src/lib/seo.ts` centralizes the production origin (`https://www.temiyeakinyemi.com`), default metadata, and JSON-LD builders (`Person`, `WebSite`, `CreativeWork`, `BreadcrumbList`); `JsonLd` (`components/seo/`) emits them. `src/app/{robots,sitemap,manifest}.ts` are the file-convention routes. Social cards are generated by `opengraph-image.tsx` / `twitter-image.tsx` per route via `next/og` `ImageResponse`, using **vendored TTFs in `assets/fonts/`** (committed — Satori needs TTF/OTF, not woff2) and the shared `src/lib/og-assets.ts` (fonts + palette + monogram). New public page → read from `seo.ts`, set `alternates.canonical`, optionally colocate an `opengraph-image`, add `<JsonLd>`.

## Design Context

This is a **portfolio** for Temiye Akinyemi (software engineer). It is a `brand` surface: the design IS the product.

- Strategy: `PRODUCT.md` (register, users, purpose, personality, anti-references, principles).
- Visual system: `docs/DESIGN.md` (theme, warm-monochrome palette, typography, motion, components).

**Design skill:** use **Impeccable** (`/impeccable`) for all UI and design work on this project. Read `PRODUCT.md` and `docs/DESIGN.md` first; preserve the incumbent monochrome system unless the task is an explicit redesign.

Guardrails that hold across the whole site: warm-monochrome only (no chromatic accent), the italic Fraunces as the one emphasis device, one signature moment per surface, **no em dashes** in copy, `prefers-reduced-motion` and `(hover: hover)` gates on every effect, and never a template-recognizable "creative-dev" surface.
