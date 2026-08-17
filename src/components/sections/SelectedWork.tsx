"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { shotUrl } from "@/lib/preview";
import { projects } from "@/lib/content";
import { useMediaQuery } from "@/lib/useMediaQuery";
import SignalGraphic from "@/components/ui/SignalGraphic";

/**
 * Selected Work as a static typographic index. Each project is a still row, so
 * a click always lands (mousedown and mouseup share the same target) and the
 * shared-element view transition on the title morphs cleanly into the case page.
 * The signature moment is withheld until you engage: hovering a row floats that
 * project's live preview beside the cursor and dims the rest. The preview is
 * portaled to <body> (true viewport space, above the 3D plane) and never
 * captures pointer events. Touch pointers get the preview inline per row.
 */
export default function SelectedWork() {
  const reduce = useReducedMotion();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // Float the preview to the pointer. Motion values, not state, so moving the
  // mouse never re-renders. Reduced motion snaps instead of easing.
  useGSAP(
    () => {
      if (!fine) return;
      const el = previewRef.current;
      if (!el) return;
      const dur = reduce ? 0 : 0.45;
      const xTo = gsap.quickTo(el, "x", { duration: dur, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: dur, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        xTo(Math.min(e.clientX, window.innerWidth - 372));
        yTo(gsap.utils.clamp(150, window.innerHeight - 150, e.clientY));
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { dependencies: [fine, reduce] },
  );

  // Entrance: rows rise and fade in on scroll, staggered. Visible by default
  // (SSR) so a paused tab or headless render never ships it blank.
  useGSAP(
    () => {
      if (reduce) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]", listRef.current);
      gsap.from(rows, {
        opacity: 0,
        yPercent: 45,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: listRef.current, start: "top 82%" },
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative border-t border-[var(--color-line)] px-6 py-24 sm:px-10 sm:py-28 lg:px-16 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <header className="mb-8 flex items-end justify-between gap-6 sm:mb-12">
          <div>
            <p className="eyebrow mb-4">Selected Work</p>
            <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[0.98] tracking-tight">
              Selected{" "}
              <span className="italic font-normal text-[var(--color-muted)]">
                work.
              </span>
            </h2>
          </div>
          <p className="hidden max-w-[26ch] text-sm leading-relaxed text-[var(--color-muted)] sm:block">
            {fine
              ? "Hover a title to preview it. Click to read the case."
              : "Tap a project to read the case."}
          </p>
        </header>

        <ul
          ref={listRef}
          onPointerLeave={() => setActive(null)}
          className="border-b border-[var(--color-line)]"
        >
          {projects.map((p, i) => {
            const dim = active !== null && active !== i;
            return (
              <li key={p.slug} data-row>
                <Link
                  href={`/work/${p.slug}`}
                  data-cursor-target
                  onPointerEnter={() => setActive(i)}
                  className="group flex items-center gap-3 border-t border-[var(--color-line)] py-5 sm:gap-5 md:py-7"
                >
                  <span className="w-7 shrink-0 font-[family-name:var(--font-mono)] text-xs text-[var(--color-faint)] tabular-nums md:w-10">
                    {p.index}
                  </span>

                  <h3
                    style={{ viewTransitionName: `title-${p.slug}` }}
                    className={`min-w-0 flex-1 text-[clamp(1.4rem,3.6vw,2.6rem)] font-medium leading-[1.05] tracking-tight transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 ${
                      dim ? "text-[var(--color-muted)]" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {p.title}
                  </h3>

                  <span
                    className={`hidden shrink-0 text-sm transition-colors duration-500 sm:block ${
                      dim ? "text-[var(--color-faint)]" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {p.discipline}
                  </span>

                  <span className="hidden w-12 shrink-0 text-right font-[family-name:var(--font-mono)] text-xs text-[var(--color-faint)] tabular-nums md:block">
                    {p.year}
                  </span>

                  {/* touch pointers have no hover, so preview inline */}
                  {!fine && (
                    <span className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] sm:w-24">
                      <PreviewMedia project={p} sizes="96px" />
                    </span>
                  )}

                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={22}
                    strokeWidth={1.5}
                    className="shrink-0 text-[var(--color-faint)] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {fine &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={previewRef}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[60] will-change-transform"
          >
            <div
              data-show={active !== null}
              className="relative ml-6 aspect-[16/10] w-[340px] -translate-y-1/2 scale-95 overflow-hidden rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] opacity-0 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)] transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] data-[show=true]:scale-100 data-[show=true]:opacity-100"
            >
              {projects.map((p, i) => (
                <div
                  key={p.slug}
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ opacity: active === i ? 1 : 0 }}
                >
                  <PreviewMedia project={p} sizes="340px" />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

/** Live screenshot for a project, or the signal graphic when it has no live site. */
function PreviewMedia({
  project,
  sizes,
}: {
  project: (typeof projects)[number];
  sizes: string;
}) {
  if (!project.url) return <SignalGraphic />;
  return (
    <Image
      src={project.preview ?? shotUrl(project.url)}
      alt={`${project.title} preview`}
      fill
      unoptimized={!project.preview}
      sizes={sizes}
      className="object-cover object-top"
    />
  );
}
