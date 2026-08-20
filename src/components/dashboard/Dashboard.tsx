"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useLenis } from "lenis/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  site,
  about,
  projects,
  capabilities,
  experience,
} from "@/lib/content";
import { useUIMode } from "@/components/providers/UIMode";
import { useThreeD } from "@/components/providers/ThreeDMode";
import { useSpaceOrbit } from "@/lib/useSpaceOrbit";
import LocalTime from "@/components/ui/LocalTime";

/* ------------------------------------------------------------------ *
 * DIRECTION CONTRACT — Dashboard ("The Control Room")
 *
 * THESIS: The portfolio can recompose itself. The same body of work, read two
 *   ways: the cinematic scroll (default) and a summonable single screen. It
 *   refuses the SaaS hero-metric-tile dashboard (big number + accent + stat row).
 * OWN-WORLD: Inherited warm-monochrome. Hairline-framed panels on warm surface,
 *   no drop-shadow boxes; Fraunces italic the one emphasis; Geist Mono only for
 *   real data (years, counts, live clock). No chromatic accent.
 * STORY: Visitor toggles [Site | Dashboard], scans who/what/shipped/where/reach
 *   at a glance; every panel is a doorway back into the scroll at that section.
 * FIRST VIEWPORT: Full-viewport bento under the nav. Tall Identity panel (photo,
 *   name, one italic line, "Enter the site"); wide Capabilities ledger; About,
 *   Work, Experience, Contact along the deck. No big-number tile.
 * FORM: Editorial contact-sheet / control-room bento. Extension of the committed
 *   world (no concept roll). Signature: the grid assembles — a hairline plots
 *   across each panel head as panels resolve out of blur in reading order.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 *   finish review and the verdict.
 * ------------------------------------------------------------------ */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.04 } },
};
const panelV: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};
const lineV: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

export default function Dashboard() {
  const { setDashboard } = useUIMode();
  const { enabled: threeD } = useThreeD();
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [hasPhoto, setHasPhoto] = useState(true);

  // 3D mode: the bento tilts as one plane over the flat dotted field, orbiting
  // when idle — the same effect the site plane uses, so it feels identical here.
  // The transform lives on the inner plane, NOT the scroll container, so the
  // native scrollbar stays flat instead of tilting with it.
  useSpaceOrbit(planeRef, threeD && !reduce, "center");

  // send focus into the overview so the keyboard path starts here
  useEffect(() => {
    scrollRef.current?.focus({ preventScroll: true });
  }, []);

  // leave the dashboard and land on a section of the scrolling site
  const enterSite = (href: string) => {
    setDashboard(false);
    // let the site become visible and Lenis restart, then glide to the anchor
    let tries = 0;
    const go = () => {
      const el = document.querySelector(href);
      if (el && lenis) {
        lenis.scrollTo(el as HTMLElement, { offset: -80 });
      } else if (el) {
        el.scrollIntoView();
      } else if (tries++ < 8) {
        requestAnimationFrame(go);
        return;
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(go));
  };

  const motionProps = reduce
    ? {}
    : ({ initial: "hidden", animate: "show", exit: { opacity: 0 } } as const);

  return (
    <motion.section
      aria-label="Portfolio dashboard"
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-40 bg-[var(--color-ground)]"
    >
      {/* control-room ground: a faint dotted field for the glass to float on */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-line-strong) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 100%)",
          opacity: 0.5,
        }}
      />
      <div
        ref={scrollRef}
        tabIndex={-1}
        data-lenis-prevent
        className="relative h-full overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-8 pt-20 outline-none [-webkit-overflow-scrolling:touch] sm:px-8 sm:pt-24 lg:px-10 lg:pb-5 lg:pt-[4.75rem]"
      >
        <div ref={planeRef} className="mx-auto w-full max-w-[1360px]">
        <motion.div
          variants={container}
          {...motionProps}
          className="dash-grid w-full"
        >
          {/* ---------------------------------------------------------- *
           * Identity — the anchor panel, with the way back into the site.
           * ---------------------------------------------------------- */}
          <Panel area="identity" label="Identity" onOpen={() => enterSite("#top")}>
            <div className="relative flex h-full min-h-[15.5rem] flex-col justify-end overflow-hidden rounded-[10px]">
              {hasPhoto ? (
                <Image
                  src="/temiye.png"
                  alt={site.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  onError={() => setHasPhoto(false)}
                  className="object-cover object-top"
                  style={{ willChange: "transform" }}
                />
              ) : (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-4 -top-8 select-none font-[family-name:var(--font-display)] text-[12rem] leading-none text-[var(--color-line-strong)]"
                >
                  T
                </span>
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--color-ground) 97%, transparent) 0%, color-mix(in srgb, var(--color-ground) 88%, transparent) 34%, color-mix(in srgb, var(--color-ground) 55%, transparent) 58%, transparent 88%)",
                }}
              />
              <div className="relative p-5 sm:p-6">
                <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] font-medium leading-[1.05] tracking-tight text-[var(--color-ink)]">
                  {site.name}
                </h2>
                <p className="mt-3 max-w-[34ch] text-[0.9rem] leading-relaxed text-[var(--color-ink)]">
                  Software engineer building production web apps, and I care
                  about how each one{" "}
                  <span className="font-[family-name:var(--font-display)] italic text-[var(--color-ink)]">
                    feels.
                  </span>
                </p>
                <button
                  type="button"
                  data-cursor-target
                  onClick={() => enterSite("#top")}
                  className="group/enter mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors duration-300 hover:bg-[var(--color-ink)] hover:text-[var(--color-ground)]"
                >
                  Learn more
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={15}
                    strokeWidth={2}
                    className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/enter:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </Panel>

          {/* ---------------------------------------------------------- *
           * Capabilities — the wide skill ledger + toolkit marks.
           * ---------------------------------------------------------- */}
          <Panel
            area="capab"
            label="Capabilities"
            onOpen={() => enterSite("#capabilities")}
          >
            <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {capabilities.disciplines.map((d, i) => (
                <li
                  key={d.title}
                  className={`flex items-baseline gap-3 border-t border-[var(--color-line)] py-2 lg:py-[0.4rem] ${
                    i === 0 ? "border-t-0" : ""
                  } ${i === 1 ? "sm:border-t-0" : ""}`}
                >
                  <span className="font-[family-name:var(--font-mono)] text-[0.62rem] text-[var(--color-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.86rem] font-medium text-[var(--color-ink)]">
                    {d.title}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2.5 border-t border-[var(--color-line)] pt-2.5">
              <p className="eyebrow mb-2 text-[0.6rem]">Toolkit</p>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {capabilities.toolkit.map((t) => (
                  <li
                    key={t}
                    className="font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--color-muted)]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/* ---------------------------------------------------------- *
           * About — statement + the spec sheet of facts.
           * ---------------------------------------------------------- */}
          <Panel area="about" label="About" onOpen={() => enterSite("#about")}>
            <p className="text-[0.92rem] leading-snug text-[var(--color-ink)]">
              I build production web applications people rely on, and I care
              about how every screen{" "}
              <span className="font-[family-name:var(--font-display)] italic text-[var(--color-muted)]">
                looks and feels
              </span>{" "}
              while I do it.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {about.facts.map((f) => (
                <div key={f.k} className="border-t border-[var(--color-line)] pt-2">
                  <dt className="eyebrow text-[0.58rem]">{f.k}</dt>
                  <dd className="mt-1 text-[0.8rem] text-[var(--color-muted)]">
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          {/* ---------------------------------------------------------- *
           * Selected work — indexed rows, links straight to the cases.
           * ---------------------------------------------------------- */}
          <Panel
            area="work"
            label="Selected work"
            onOpen={() => enterSite("#work")}
          >
            <ul>
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-cursor-target
                    style={{ viewTransitionName: `title-${p.slug}` }}
                    className="group/row flex items-baseline gap-3 border-t border-[var(--color-line)] py-2 first:border-t-0 lg:py-[0.4rem]"
                  >
                    <span className="font-[family-name:var(--font-mono)] text-[0.62rem] text-[var(--color-faint)]">
                      {p.index}
                    </span>
                    <span className="flex-1 truncate text-[0.9rem] font-medium text-[var(--color-ink)]">
                      {p.title}
                      {p.signature && (
                        <span className="ml-2 align-middle text-[var(--color-faint)]">
                          &#9702;
                        </span>
                      )}
                    </span>
                    <span className="hidden truncate text-[0.72rem] text-[var(--color-muted)] sm:inline">
                      {p.discipline}
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-[0.68rem] text-[var(--color-faint)]">
                      {p.year}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={13}
                      strokeWidth={2}
                      className="-translate-x-1 text-[var(--color-faint)] opacity-0 transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)] group-hover/row:translate-x-0 group-hover/row:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          {/* ---------------------------------------------------------- *
           * Experience — the ledger, most recent first.
           * ---------------------------------------------------------- */}
          <Panel
            area="exp"
            label="Experience"
            count={`${String(experience.length).padStart(2, "0")} · Roles`}
            onOpen={() => enterSite("#experience")}
          >
            <ul>
              {experience.map((r) => (
                <li
                  key={`${r.company}-${r.period}`}
                  className="flex items-baseline justify-between gap-4 border-t border-[var(--color-line)] py-2 first:border-t-0 lg:py-[0.4rem]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[0.86rem] font-medium text-[var(--color-ink)]">
                      {r.company}
                    </p>
                    <p className="truncate text-[0.72rem] text-[var(--color-muted)]">
                      {r.role}
                    </p>
                  </div>
                  <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--color-faint)]">
                    {r.period}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* ---------------------------------------------------------- *
           * Contact — the direct line.
           * ---------------------------------------------------------- */}
          <Panel area="contact" label="Contact" onOpen={() => enterSite("#contact")}>
            <a
              href={`mailto:${site.email}`}
              data-cursor-target
              className="group/mail inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-[1.15rem] leading-tight tracking-tight text-[var(--color-ink)] transition-colors duration-300 hover:text-[var(--color-muted)] sm:text-[1.3rem]"
            >
              <span className="break-all">{site.email}</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                strokeWidth={2}
                className="shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/mail:translate-x-0.5"
              />
            </a>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-target
                    className="text-[0.78rem] text-[var(--color-muted)] underline decoration-[var(--color-line-strong)] underline-offset-4 transition-colors duration-300 hover:text-[var(--color-ink)] hover:decoration-[var(--color-ink)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2.5 border-t border-[var(--color-line)] pt-3">
              {/* static status dot — no infinite animation. A continuous ping
                  here repainted every frame even at rest and was the real source
                  of the cursor never feeling smooth on this surface. */}
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-ink)]" />
              <p className="text-[0.72rem] text-[var(--color-muted)]">
                <LocalTime /> · {site.status.toLowerCase()}
              </p>
            </div>
          </Panel>
        </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/* A hairline-framed panel. The elevation (surface + shadow + border + sheen)
 * lives on a static backing layer of its own, so it rasterizes once and is never
 * repainted by the interactive text/links on top: the shadow becomes a cached
 * GPU texture and hover activity can never re-blur it, which is what keeps the
 * elevation AND a 60fps cursor at the same time. The head plots a hairline across
 * as the panel resolves. */
function Panel({
  area,
  label,
  count,
  onOpen,
  children,
}: {
  area: string;
  label: string;
  count?: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={panelV}
      className={`dash-${area} group/panel relative flex flex-col rounded-xl`}
    >
      {/* static elevation backing — its own compositor layer, never repainted */}
      <span
        aria-hidden
        className="dash-panel liquid-glass absolute inset-0 rounded-xl"
      />
      {/* interactive content, on top, transparent — repaints stay off the backing */}
      <div className="relative z-[1] flex flex-1 flex-col overflow-hidden rounded-xl p-3.5 sm:p-4">
        <motion.span
          aria-hidden
          variants={lineV}
          style={{ transformOrigin: "left" }}
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--color-line-strong)]"
        />
        <button
          type="button"
          data-cursor-target
          onClick={onOpen}
          aria-label={`Open ${label} on the site`}
          className="mb-2.5 flex items-center justify-between text-left"
        >
          <span className="eyebrow text-[0.6rem] transition-colors duration-300 group-hover/panel:text-[var(--color-muted)]">
            {label}
          </span>
          <span className="flex items-center gap-2">
            {count && (
              <span className="font-[family-name:var(--font-mono)] text-[0.6rem] tracking-[0.14em] text-[var(--color-faint)]">
                {count}
              </span>
            )}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={14}
              strokeWidth={1.8}
              className="text-[var(--color-faint)] opacity-0 transition-opacity duration-300 group-hover/panel:opacity-100"
            />
          </span>
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </motion.section>
  );
}
