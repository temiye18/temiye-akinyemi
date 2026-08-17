"use client";

import { useEffect, useRef } from "react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { shotUrl } from "@/lib/preview";
import { projects } from "@/lib/content";
import { useThreeD } from "@/components/providers/ThreeDMode";
import SignalGraphic from "@/components/ui/SignalGraphic";

export default function SelectedWork() {
  const reduce = useReducedMotion();
  const { enabled: threeD } = useThreeD();
  // Only reduced motion drops the pinned coverflow. 3D keeps it: we just switch
  // the pin strategy (see pinType below) so it survives the transformed plane.
  const plain = reduce;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plain) return;
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track);
    const clampDist = gsap.utils.clamp(-1.25, 1.25);
    const distance = () => track.scrollWidth - window.innerWidth;

    // Coverflow depth — each card swings on Y, recedes in Z and dims by how far
    // its centre sits from the middle of the screen; the centred card faces us
    // flat and full. The media inside drifts the other way. Position is read
    // from layout (offsetLeft + the track's x), never from getBoundingClientRect,
    // so the 3D transforms we write can't feed back into the measurement.
    const applyDepth = () => {
      const mid = window.innerWidth / 2;
      const base = section.getBoundingClientRect().left;
      const trackX = parseFloat(String(gsap.getProperty(track, "x"))) || 0;
      for (const card of cards) {
        const cardCenter =
          base + trackX + card.offsetLeft + card.offsetWidth / 2;
        const off = clampDist((cardCenter - mid) / mid);
        const mag = Math.abs(off);
        gsap.set(card, {
          rotationY: off * -30,
          z: -mag * 320,
          scale: 1 - mag * 0.14,
          opacity: 1 - mag * 0.4,
          // stack the centred card above its neighbours
          zIndex: Math.round((1 - mag) * 100),
        });
        const media = card.querySelector<HTMLElement>("[data-media]");
        if (media) gsap.set(media, { xPercent: off * -12, scale: 1.12 });
      }
    };

    let tween: gsap.core.Tween | null = null;

    // Build the pin on the NEXT frame, not synchronously. SpacePlane toggles the
    // page's 3D transform in its own effect (which has already run by the time
    // this rAF fires), so the pin always measures against a settled ancestor —
    // no stale-transform race, no blank section when switching modes.
    const raf = requestAnimationFrame(() => {
      tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          // 2D: native fixed-pinning (fastest, smoothest). 3D: the page is a
          // transformed plane, and a `position: fixed` pin would resolve against
          // that plane instead of the viewport. Transform-pinning holds the pin
          // by translating the element, so it works inside the transformed
          // ancestor. Same coverflow, correct pin in both worlds.
          pinType: threeD ? "transform" : "fixed",
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: applyDepth,
          onUpdate: (self) => {
            applyDepth();
            if (progressRef.current)
              progressRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      ScrollTrigger.refresh();
      applyDepth();
    });

    return () => {
      cancelAnimationFrame(raf);
      // Revert the pin (removes the pin-spacer + pinned inline styles) and kill
      // the scrub tween, then wipe the transforms we set on the cards so nothing
      // lingers into the next mode. A final refresh re-measures sibling triggers
      // now that the pin-spacer is gone.
      tween?.scrollTrigger?.kill(true);
      tween?.kill();
      cards.forEach((card) => {
        gsap.set(card, { clearProps: "transform,opacity,zIndex" });
        const media = card.querySelector<HTMLElement>("[data-media]");
        if (media) gsap.set(media, { clearProps: "transform" });
      });
      ScrollTrigger.refresh();
    };
  }, [plain, threeD]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className={`relative border-t border-[var(--color-line)] ${plain ? "" : "overflow-hidden"}`}
    >
      <div
        className={
          plain
            ? "flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 py-28 sm:px-10 lg:px-16"
            : "flex h-screen items-center [perspective:1800px]"
        }
      >
        <div
          ref={trackRef}
          className={`flex items-stretch gap-8 will-change-transform [transform-style:preserve-3d] ${plain ? "" : "pl-[8vw] pr-[8vw]"}`}
        >
          {/* intro panel */}
          <div className="flex h-[70vh] w-[min(72vw,380px)] flex-none flex-col justify-center pr-6">
            <p className="eyebrow mb-6">Selected Work</p>
            <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[0.98] tracking-tight">
              Selected{" "}
              <span className="italic font-normal text-[var(--color-muted)]">
                work.
              </span>
            </h2>
            <p className="mt-6 max-w-[30ch] text-[var(--color-muted)]">
              A few things I have built. Scroll to move through them.
            </p>
            <p className="eyebrow mt-8 text-[var(--color-faint)]">
              {projects.length.toString().padStart(2, "0")} — Projects
            </p>
          </div>

          {/* project cards */}
          {projects.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              data-card
              data-cursor-target
              style={{ backfaceVisibility: "hidden" }}
              className="group relative flex h-[70vh] w-[min(84vw,580px)] flex-none snap-center flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)] transition-colors duration-300 hover:border-[var(--color-line-strong)]"
            >
              {/* visual */}
              <div className="relative flex-1 overflow-hidden">
                <div data-media className="absolute inset-0 will-change-transform">
                  {p.url ? (
                    <Image
                      src={p.preview ?? shotUrl(p.url)}
                      alt={`${p.title} preview`}
                      fill
                      unoptimized={!p.preview}
                      sizes="(max-width: 640px) 84vw, 580px"
                      className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <SignalGraphic />
                  )}
                </div>
              </div>

              {/* meta */}
              <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-7">
                <div className="mb-3 flex items-center justify-between">
                  <span className="eyebrow text-[var(--color-faint)]">
                    {p.index}
                  </span>
                  <span className="eyebrow text-[var(--color-faint)]">
                    {p.year}
                  </span>
                </div>
                <h3
                  style={{ viewTransitionName: `title-${p.slug}` }}
                  className="flex items-center gap-3 text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-none tracking-tight"
                >
                  {p.title}
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={22}
                    strokeWidth={1.5}
                    className="text-[var(--color-faint)] transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]"
                  />
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {p.discipline}
                </p>
              </div>
            </Link>
          ))}

          {/* trailing spacer */}
          {!plain && <div className="h-1 w-[6vw] flex-none" />}
        </div>
      </div>

      {/* horizontal progress */}
      {!plain && (
        <div className="absolute bottom-0 left-0 h-px w-full bg-[var(--color-line)]">
          <div
            ref={progressRef}
            className="h-full origin-left bg-[var(--color-ink)]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      )}
    </section>
  );
}
